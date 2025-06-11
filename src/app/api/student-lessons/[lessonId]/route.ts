import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params: { lessonId } }: { params: { lessonId: string } }
) {
  try {
    const session = await auth();
    const isUserAuth = session ? true : false;

    // جلب الدرس مع الفصل والكورس والواجب والاشتراك
    const [lesson, subscription] = await Promise.all([
      prisma.lesson.findFirst({
        where: {
          id: lessonId,
        },
        include: {
          chapter: {
            select: {
              id: true,
              courseId: true,
            },
          },
          assignment: {
            include: {
              submissions: {
                where: {
                  studentId: session?.user.id,
                },
                include: {
                  grade: true,
                },
              },
            },
          },
        },
      }),
      session?.user?.id
        ? prisma.subscription.findFirst({
            where: {
              userId: session.user.id,
            },
            include: {
              course: {
                select: {
                  id: true,
                },
              },
            },
          })
        : null,
    ]);

    if (!lesson) {
      return new NextResponse("Lesson not found", { status: 404 });
    }

    // التحقق من ملكية الكورس
    const isOwned = subscription?.course?.id === lesson.chapter.courseId;

    // جلب بيانات تقدم الطالب حسب نوع الدرس
    let lessonUserData: any;

    if (lesson?.type === "file") {
      lessonUserData = await prisma.fileUserData.findFirst({
        where: {
          userId: session?.user.id!,
          lessonId: lessonId,
        },
      });
    } else if (lesson?.type === "video") {
      lessonUserData = await prisma.videoUserData.findFirst({
        where: {
          userId: session?.user.id!,
          lessonId: lessonId,
        },
      });
    }

    return NextResponse.json({
      lesson,
      subscription,
      isUserAuth,
      isOwned,
      lessonUserData,
      session,
    });
  } catch (error) {
    console.log("ERROR IN GET Student Lesson:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
