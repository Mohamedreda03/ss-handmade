import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params: { courseId } }: { params: { courseId: string } }
) {
  try {
    const session = await auth();
    const isUserAuth = session ? true : false;
    const isUserAdmin = session?.user.role === "ADMIN";

    const [chapters, subscription] = await Promise.all([
      prisma.chapter.findMany({
        where: {
          courseId: courseId,
          isPublished: true,
        },
        orderBy: {
          position: "asc",
        },
        include: {
          Lesson: {
            where: {
              isPublished: true,
            },
            orderBy: {
              position: "asc",
            },
            select: {
              isFree: true,
              chapterId: true,
              id: true,
              title: true,
              type: true,
              position: true,
              isPublished: true,
              video_type: true,

              _count: {
                select: {
                  TestUserData: {
                    where: {
                      userId: session?.user.id,
                    },
                  },
                },
              },
              FileUserData: {
                where: {
                  userId: session?.user.id,
                },
                select: {
                  isCompleted: true,
                },
              },
              VideoUserData: {
                where: {
                  userId: session?.user.id,
                },
                select: {
                  isCompleted: true,
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

    const isOwned = subscription ? true : false;

    return NextResponse.json({
      chapters,
      isOwned,
      isUserAuth,
      isUserAdmin,
    });
  } catch (error) {
    console.log("ERROR IN GET COURSE CHAPTER DATA:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
