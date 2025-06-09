import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    let list = await req.json();

    const session = await auth();
    if (!session || !["ADMIN", "CONSTRUCTOR"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // إذا كان Constructor، يجب التحقق من ملكية الدروس
    if (session.user.role === "CONSTRUCTOR") {
      // الحصول على معرف الدرس الأول للتحقق من الملكية
      const firstLessonId = list[0]?.id;
      if (!firstLessonId) {
        return new NextResponse("No lessons provided", { status: 400 });
      }

      // التحقق من ملكية الدرس
      const lessonAccess = await prisma.lesson.findUnique({
        where: { id: firstLessonId },
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

      if (!lessonAccess || lessonAccess.chapter.course.userId !== session.user.id) {
        return new NextResponse("Unauthorized - You don't own this course", { status: 401 });
      }
    }

    for (let item of list) {
      await prisma.lesson.update({
        where: {
          id: item.id,
        },
        data: {
          position: item.position,
        },
      });
    }

    return new NextResponse("Lessons reordered successfully", { status: 200 });
  } catch (error) {
    console.log("ERROR IN PATCH Lesson reorder:", error);
    return new NextResponse("Error in reorder lessons", { status: 500 });
  }
}
