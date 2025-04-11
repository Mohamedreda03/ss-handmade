import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    let body = await req.json();
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const Question = await prisma.testQuestion.findFirst({
      where: {
        id: body.testQuestionId,
      },
    });

    console.log("Question", Question);
    console.log(body);

    const oldAnswer = await prisma.testAnswer.findFirst({
      where: {
        userId: session.user.id,
        lessonId: body.lessonId,
        testUserDataId: body.lessonUserDataId,
        testQuestionId: body.testQuestionId,
      },
    });

    if (oldAnswer) {
      await prisma.testAnswer.update({
        where: {
          id: oldAnswer.id,
        },
        data: {
          answer: body.answer,
          isCorrect: body.answer === Question?.currectAnswer,
        },
      });
    } else {
      await prisma.testAnswer.create({
        data: {
          userId: session.user.id,
          lessonId: body.lessonId,
          testUserDataId: body.lessonUserDataId,
          testQuestionId: body.testQuestionId,
          answer: body.answer,
          isCorrect: body.answer === Question?.currectAnswer,
        },
      });
    }

    return NextResponse.json("data", { status: 201 });
  } catch (error) {
    console.log("ERROR IN POST ANSWER:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { testQuestionId: string } }
) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const test = await prisma.testUserData.findFirst({
      where: {
        id: params.testQuestionId,
      },
      include: {
        testAnswers: true,
      },
    });

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: test?.lessonId,
      },
      include: {
        testQuestions: {
          include: {
            answers: true,
          },
        },
      },
    });

    return NextResponse.json({
      test,
      lesson,
    });
  } catch (error) {
    console.log("ERROR IN GET ANSWER:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { testQuestionId: string } }
) {
  try {
    let body = await req.json();
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.testUserData.update({
      where: {
        id: params.testQuestionId,
      },
      data: body,
    });

    return new NextResponse("updated");
  } catch (error) {
    console.log("ERROR IN PUT ANSWER:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
