import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params: { testId } }: { params: { testId: string } }
) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const test = await prisma.testUserData.findFirst({
      where: {
        id: testId,
      },
    });

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: test?.lessonId,
      },
      include: {
        chapter: {
          select: {
            id: true,
            courseId: true,
          },
        },
      },
    });

    return NextResponse.json({
      lesson,
      test,
    });
  } catch (error) {
    console.log("COURSES POST ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
