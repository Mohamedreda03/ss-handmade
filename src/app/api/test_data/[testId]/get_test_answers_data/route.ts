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

    const lessonId = req.nextUrl.searchParams.get("lessonId");

    const [lesson, testUserData, numOfCompleted, questionsLength] =
      await Promise.all([
        prisma.lesson.findUnique({
          where: {
            id: lessonId!,
          },
          include: {
            testQuestions: {
              include: {
                answers: true,
              },
            },
          },
        }),
        prisma.testUserData.findUnique({
          where: {
            id: testId,
          },
          include: {
            testAnswers: true,
          },
        }),
        prisma.testUserData.count({
          where: {
            userId: session.user.id,
            lessonId: lessonId!,
            isCompleted: true,
          },
        }),
        prisma.testQuestion.count({
          where: {
            lessonId: lessonId!,
          },
        }),
      ]);

    return NextResponse.json({
      lesson,
      questionsLength,
      testUserData,
      numOfCompleted,
    });
  } catch (error) {
    console.log("COURSES POST ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
