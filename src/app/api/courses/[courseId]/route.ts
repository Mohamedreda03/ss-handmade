import { deleteVideoFromVimeo } from "@/actions/deleteVideoFromVimeo";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { existsSync, unlinkSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await auth();

    // If this is a regular user (no auth needed), just return the basic course info
    if (!session) {
      const course = await prisma.course.findUnique({
        where: {
          id: params.courseId,
        },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return NextResponse.json({ data: course });
    }

    // If CONSTRUCTOR, check ownership
    if (session.user.role === "CONSTRUCTOR") {
      const course = await prisma.course.findUnique({
        where: {
          id: params.courseId,
        },
        include: {
          User: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!course) {
        return new NextResponse("Course not found", { status: 404 });
      }

      // Verify ownership
      if (course.userId !== session.user.id) {
        return new NextResponse("Unauthorized", { status: 401 });
      }

      return NextResponse.json({ data: course });
    }

    // If ADMIN or other authorized role
    const course = await prisma.course.findUnique({
      where: {
        id: params.courseId,
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ data: course });
  } catch (error) {
    console.log("COURSES COURSEiD ROUTE ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await auth();
    if (!session || !["ADMIN", "CONSTRUCTOR"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // التحقق من صلاحية تعديل الكورس
    const courseAccess = await prisma.course.findUnique({
      where: { id: params.courseId },
      select: { userId: true },
    });

    if (!courseAccess) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // إذا كان constructor، يجب أن يكون مالك الكورس
    if (
      session.user.role === "CONSTRUCTOR" &&
      courseAccess.userId !== session.user.id
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const course = await prisma.course.update({
      where: {
        id: params.courseId,
      },
      data: {
        ...body,
      },
    });

    return NextResponse.json({ data: course });
  } catch (error) {
    console.log("COURSES COURSEiD ROUTE ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params: { courseId } }: { params: { courseId: string } }
) {
  try {
    const session = await auth();
    if (!session || !["ADMIN", "CONSTRUCTOR"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // التحقق من صلاحية حذف الكورس
    const courseAccess = await prisma.course.findUnique({
      where: { id: courseId },
      select: { userId: true },
    });

    if (!courseAccess) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // إذا كان constructor، يجب أن يكون مالك الكورس
    if (
      session.user.role === "CONSTRUCTOR" &&
      courseAccess.userId !== session.user.id
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // استرجاع الـ Course والعلاقات المرتبطة
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      include: {
        chapters: {
          include: {
            Lesson: {
              include: {
                testQuestions: {
                  include: {
                    answers: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // حذف الصور والملفات المرتبطة بالدروس
    for (const chapter of course.chapters) {
      for (const lesson of chapter.Lesson) {
        if (lesson.testQuestions.length) {
          for (const question of lesson.testQuestions) {
            if (question.image_url) {
              const fileName = question.image_url.split("/").pop() as string;
              const path = join(
                process.cwd(),
                "..",
                "uploads",
                "images",
                fileName
              );
              if (existsSync(path)) {
                unlinkSync(path);
              }
            }

            for (const answer of question.answers) {
              if (answer.image_url) {
                const fileName = answer.image_url.split("/").pop() as string;
                const path = join(
                  process.cwd(),
                  "..",
                  "uploads",
                  "images",
                  fileName
                );
                if (existsSync(path)) {
                  unlinkSync(path);
                }
              }
            }
          }
        }

        if (lesson.fileUrl) {
          const fileName = lesson.fileUrl.split("/").pop() as string;
          const path = join(process.cwd(), "..", "uploads", "files", fileName);
          if (existsSync(path)) {
            unlinkSync(path);
          }
        }

        if (lesson.videoUrl) {
          await deleteVideoFromVimeo(lesson.videoUrl);
        }
      }
    }

    // حذف الكورس نفسه
    await prisma.course.delete({
      where: {
        id: courseId,
      },
    });

    return NextResponse.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.log("ERROR IN DELETE Course courseId:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
