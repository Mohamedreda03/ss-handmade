import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const correctAnswers = await prisma.testAnswer.count({
      where: {
        testUserDataId: params.id,
        isCorrect: true,
      },
    });

    await prisma.testUserData.update({
      where: {
        id: params.id,
      },
      data: {
        testResult: correctAnswers,
        isCompleted: true,
      },
    });

    return new NextResponse("updated");
  } catch (error) {
    console.log("ERROR IN PUT ANSWER:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
