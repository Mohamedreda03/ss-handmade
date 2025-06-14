import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { existsSync, unlinkSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { chapterId: string; courseId: string } }
) {
  try {
    const body = await req.json();

    const session = await auth();
    if (!session || !["ADMIN", "CONSTRUCTOR"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // التحقق من صلاحية تعديل الفصل
    const chapterAccess = await prisma.chapter.findUnique({
      where: { id: params.chapterId },
      include: {
        course: {
          select: { userId: true },
        },
      },
    });

    if (!chapterAccess) {
      return new NextResponse("Chapter not found", { status: 404 });
    }

    // إذا كان constructor، يجب أن يكون مالك الكورس
    if (
      session.user.role === "CONSTRUCTOR" &&
      chapterAccess.course.userId !== session.user.id
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.chapter.update({
      where: {
        id: params.chapterId,
      },
      data: {
        ...body,
      },
    });

    return new NextResponse("Chapter updated successfully", { status: 200 });
  } catch (error) {
    console.log("ERROR IN PUT CHAPTERID:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params: { chapterId } }: { params: { chapterId: string } }
) {
  try {
    const session = await auth();
    if (!session || !["ADMIN", "CONSTRUCTOR"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    } // التحقق من صلاحية حذف الفصل
    const chapterAccess = await prisma.chapter.findUnique({
      where: { id: chapterId },
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
    });

    if (!chapterAccess) {
      return new NextResponse("Chapter not found", { status: 404 });
    } // إذا كان constructor، يجب أن يكون مالك الكورس
    if (
      session.user.role === "CONSTRUCTOR" &&
      chapterAccess.course.userId !== session.user.id
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // المشرف (ADMIN) يمكنه حذف أي محتوى// استرجاع الـ Chapter والعلاقات المرتبطة
    const chapter = await prisma.chapter.findUnique({
      where: {
        id: chapterId,
      },
      include: {
        Lesson: true,
      },
    });

    if (!chapter) {
      return new NextResponse("Chapter not found", { status: 404 });
    } // حذف الملفات المرتبطة بالـ Lessons
    for (const lesson of chapter.Lesson) {
      if (lesson.fileUrl) {
        const fileName = lesson.fileUrl.split("/").pop() as string;
        const path = join(process.cwd(), "..", "uploads", "files", fileName);
        if (existsSync(path)) {
          unlinkSync(path);
        }
      }

      // Note: videoUrl cleanup removed as we only support YouTube now
    }

    await prisma.chapter.delete({
      where: {
        id: chapterId,
      },
    });

    return NextResponse.json({ message: "Chapter deleted successfully" });
  } catch (error) {
    console.log("ERROR IN DELETE Chapter chapterId:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  {
    params: { chapterId, courseId },
  }: { params: { chapterId: string; courseId: string } }
) {
  try {
    const session = await auth();
    if (!session || !["ADMIN", "CONSTRUCTOR"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // For CONSTRUCTOR, verify ownership of the course
    if (session.user.role === "CONSTRUCTOR") {
      const courseAccess = await prisma.course.findUnique({
        where: { id: courseId },
        select: { userId: true },
      });

      if (!courseAccess || courseAccess.userId !== session.user.id) {
        return new NextResponse("Unauthorized access to this course", {
          status: 401,
        });
      }
    }
    const chapter = await prisma.chapter.findFirst({
      where: {
        id: chapterId,
      },
      include: {
        course: {
          include: {
            User: {
              select: {
                id: true,
                role: true,
              },
            },
          },
        },
      },
    });

    const lessons = await prisma.lesson.findMany({
      where: {
        chapterId,
      },
      orderBy: {
        position: "asc",
      },
    });

    // إضافة معلومات المستخدم الحالي
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    });

    const requiredFields = [chapter?.title, lessons.length];

    const totalFields = requiredFields.length;
    const filledFields = requiredFields.filter(Boolean).length;

    return NextResponse.json({
      chapter,
      lessons,
      requiredFields,
      totalFields,
      filledFields,
      currentUser,
    });
  } catch (error) {
    console.log("ERROR IN GET CHAPTERID:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
