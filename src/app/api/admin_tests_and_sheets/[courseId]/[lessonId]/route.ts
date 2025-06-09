import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  {
    params: { courseId, lessonId },
  }: { params: { courseId: string; lessonId: string } }
) {
  try {
    const session = await auth();
    if (!session || !["ADMIN", "CONSTRUCTOR"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // For CONSTRUCTOR, verify course ownership through lesson
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
        return new NextResponse("Unauthorized", { status: 401 });
      }
    }

    const lesson = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
      },
      include: {
        testQuestions: {
          include: {
            answers: true,
          },
          orderBy: {
            index: "asc",
          },
        },
        _count: {
          select: { TestUserData: true },
        },
      },
    });

    if (!lesson) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const newLessonData = await Promise.all(
      lesson.testQuestions.map(async (question: any) => {
        const answers = await prisma.testAnswer.count({
          where: {
            testQuestionId: question.id,
            isCorrect: true,
          },
        });

        question.numCorrectAnswers = answers;

        return question;
      })
    );

    return NextResponse.json({
      lesson,
      questions: newLessonData,
    });
  } catch (error) {
    console.log("COURSES GET ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
