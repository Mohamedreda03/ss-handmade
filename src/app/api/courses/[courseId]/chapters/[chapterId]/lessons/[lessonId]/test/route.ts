import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: { params: { lessonId: string; chapterId: string; courseId: string } }
) {
  try {
    let body = await req.json();
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const questionsLength = await prisma.testQuestion.count({
      where: {
        lessonId: params.lessonId,
      },
    });

    body.index = questionsLength;

    const questionData: any = {
      question: body.question.question,
      image_url: body.question.image_url,
      currectAnswer: body.currectAnswer,
      index: questionsLength,
      explanation_text: body.explanation_text || undefined,
      explanation_image: body.explanation_image || undefined,
    };

    const question = await prisma.testQuestion.create({
      data: {
        lessonId: params.lessonId,
        ...questionData,
      },
    });

    for (let i = 0; i < body.answers.length; i++) {
      await prisma.answers.create({
        data: {
          testQuestionId: question.id,
          answer: body.answers[i].answer,
          image_url: body.answers[i].image_url,
          index: body.answers[i].index,
        },
      });
    }

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.log("ERROR IN POST TEST:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let body = await req.json();
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const question = await prisma.testQuestion.create({
      data: {
        lessonId: body.lessonId,
        ...body,
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.log("ERROR IN POST TEST:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
