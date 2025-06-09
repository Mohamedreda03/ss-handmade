import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  {
    params: { testQuestionId, lessonId, courseId },
  }: { params: { testQuestionId: string; lessonId: string; courseId: string } }
) {
  try {
    let body = await req.json();
    const session = await auth();

    if (!session || !["ADMIN", "CONSTRUCTOR"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // For CONSTRUCTOR, verify ownership of the lesson/test question
    if (session.user.role === "CONSTRUCTOR") {
      const questionAccess = await prisma.testQuestion.findUnique({
        where: { id: testQuestionId },
        include: {
          lesson: {
            include: {
              chapter: {
                include: {
                  course: {
                    select: { userId: true },
                  },
                },
              },
            },
          },
        },
      });

      if (
        !questionAccess ||
        questionAccess.lesson.chapter.course.userId !== session.user.id
      ) {
        return new NextResponse("Unauthorized access to this test question", {
          status: 401,
        });
      }
    }

    await prisma.testQuestion.update({
      where: {
        id: testQuestionId,
      },
      data: {
        question: body.question.question,
        image_url: body.question.image_url,
        currectAnswer: body.currectAnswer,
        explanation_text: body.explanation_text || "",
        explanation_image: body.explanation_image || "",
      },
    });

    /**
     * we already deleted all old images in the client page and replaced them with new ones
     */

    await prisma.answers.deleteMany({
      where: {
        testQuestionId: testQuestionId,
      },
    });

    for (let i = 0; i < body.answers.length; i++) {
      await prisma.answers.create({
        data: {
          testQuestionId: testQuestionId,
          answer: body.answers[i].answer,
          image_url: body.answers[i].image_url,
          index: body.answers[i].index,
        },
      });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.log("ERROR IN POST ANSWER:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// delete question and answers
export async function DELETE(
  req: NextRequest,
  {
    params: { testQuestionId, lessonId, courseId },
  }: { params: { testQuestionId: string; lessonId: string; courseId: string } }
) {
  try {
    const session = await auth();

    if (!session || !["ADMIN", "CONSTRUCTOR"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // For CONSTRUCTOR, verify ownership of the lesson/test question
    if (session.user.role === "CONSTRUCTOR") {
      const questionAccess = await prisma.testQuestion.findUnique({
        where: { id: testQuestionId },
        include: {
          lesson: {
            include: {
              chapter: {
                include: {
                  course: {
                    select: { userId: true },
                  },
                },
              },
            },
          },
        },
      });

      if (
        !questionAccess ||
        questionAccess.lesson.chapter.course.userId !== session.user.id
      ) {
        return new NextResponse("Unauthorized access to this test question", {
          status: 401,
        });
      }
    }

    await prisma.answers.deleteMany({
      where: {
        testQuestionId: testQuestionId,
      },
    });

    await prisma.testQuestion.delete({
      where: {
        id: testQuestionId,
      },
    });

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    console.log("ERROR IN DELETE ANSWER:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
