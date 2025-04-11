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
    const course = await prisma.course.findFirst({
      where: {
        id: params.courseId,
      },
    });

    return NextResponse.json({ data: course });
  } catch (error) {
    console.log("COURSES COURSEiD ROUTE ERROR", error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
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
    if (!session || session.user.role !== "ADMIN") {
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
