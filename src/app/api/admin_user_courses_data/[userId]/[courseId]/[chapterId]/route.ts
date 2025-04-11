import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  {
    params,
  }: { params: { userId: string; courseId: string; chapterId: string } }
) {
  try {
    const { userId, chapterId } = params;

    const lessonsData = await prisma.lesson.findMany({
      where: { chapterId: chapterId },
      orderBy: {
        position: "asc", // Sort by position in ascending order
      },
      include: {
        FileUserData: {
          where: {
            userId: userId,
          },
        },
        VideoUserData: {
          where: {
            userId: userId,
          },
        },
        TestUserData: {
          where: {
            userId: userId,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            testQuestions: true,
          },
        },
      },
    });

    return NextResponse.json(lessonsData);
  } catch (error) {
    console.log("admin_user_courses_data route error", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
