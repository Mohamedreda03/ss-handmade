import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  {
    params: { lessonId, courseId },
  }: { params: { lessonId: string; courseId: string } }
) {
  try {
    const session = await auth();
    const isUserAuth = session ? true : false;
    const [lesson, subscription] = await Promise.all([
      prisma.lesson.findFirst({
        where: {
          id: lessonId,
        },
        include: {
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
      prisma.subscription.findFirst({
        where: {
          courseId: courseId,
          userId: session?.user.id,
        },
      }),
    ]);

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

    const isOwned = subscription ? true : false;
    return NextResponse.json({
      lesson,
      subscription,
      isUserAuth,
      isOwned,
      lessonUserData,
      session,
    });
  } catch (error) {
    console.log("ERROR IN GET Lesson lessonId:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
