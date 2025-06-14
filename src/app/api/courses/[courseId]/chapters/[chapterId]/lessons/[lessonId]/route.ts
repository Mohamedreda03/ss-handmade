import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import axios from "axios";
import { existsSync, unlinkSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

export async function PATCH(
  req: NextRequest,
  { params: { lessonId } }: { params: { lessonId: string } }
) {
  try {
    let body = await req.json();

    const session = await auth();
    if (!session || !["ADMIN", "CONSTRUCTOR"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // التحقق من صلاحية تعديل الدرس
    const lessonAccess = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        chapter: {
          include: {
            course: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!lessonAccess) {
      return new NextResponse("Lesson not found", { status: 404 });
    }

    // إذا كان constructor، يجب أن يكون مالك الكورس
    if (
      session.user.role === "CONSTRUCTOR" &&
      lessonAccess.chapter.course.userId !== session.user.id
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.lesson.update({
      where: {
        id: lessonId,
      },
      data: {
        ...body,
      },
    });

    return NextResponse.json({ message: "Lesson updated successfully" });
  } catch (error) {
    console.log("ERROR IN PATCH Lesson lessonId:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params: { lessonId } }: { params: { lessonId: string } }
) {
  try {
    const session = await auth();
    if (!session || !["ADMIN", "CONSTRUCTOR"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    } // التحقق من صلاحية حذف الدرس
    const lessonAccess = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        chapter: {
          include: {
            course: {
              select: { userId: true },
              include: {
                User: {
                  select: { role: true },
                },
              },
            },
          },
        },
      },
    });

    if (!lessonAccess) {
      return new NextResponse("Lesson not found", { status: 404 });
    } // إذا كان constructor، يجب أن يكون مالك الكورس
    if (
      session.user.role === "CONSTRUCTOR" &&
      lessonAccess.chapter.course.userId !== session.user.id
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // المشرف (ADMIN) يمكنه حذف أي محتوى
    const lesson = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
      },
    });

    if (!lesson) {
      return new NextResponse("Lesson not found", { status: 404 });
    }
    if (lesson.fileUrl) {
      const fileName = lesson.fileUrl.split("/").pop() as string;

      let path = join(process.cwd(), "..", "uploads", "files", fileName);

      if (existsSync(path)) {
        unlinkSync(path);
      }
    }

    // Note: videoUrl cleanup removed as we only support YouTube now

    await prisma.lesson.delete({
      where: {
        id: lessonId,
      },
    });

    return NextResponse.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.log("ERROR IN DELETE Lesson lessonId:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  {
    params: { lessonId, courseId },
  }: { params: { lessonId: string; courseId: string } }
) {
  try {
    const session = await auth();
    if (!session || !["ADMIN", "CONSTRUCTOR"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // For CONSTRUCTOR, verify ownership of the course/lesson
    if (session.user.role === "CONSTRUCTOR") {
      const lessonAccess = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
          chapter: {
            include: {
              course: {
                select: { userId: true },
              },
            },
          },
        },
      });

      if (
        !lessonAccess ||
        lessonAccess.chapter.course.userId !== session.user.id
      ) {
        return new NextResponse("Unauthorized access to this lesson", {
          status: 401,
        });
      }
    }
    const data = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.log("ERROR IN GET Lesson lessonId:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
