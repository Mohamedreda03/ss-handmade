import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const fileUserData = await prisma.fileUserData.findFirst({
      where: {
        lessonId: params.lessonId,
        userId: session.user.id,
      },
    });

    if (!fileUserData) {
      await prisma.fileUserData.create({
        data: {
          lessonId: params.lessonId,
          userId: session.user.id,
          isCompleted: 1,
        },
      });
    } else {
      await prisma.fileUserData.update({
        where: {
          id: fileUserData.id,
        },
        data: {
          isCompleted: {
            increment: 1,
          },
        },
      });
    }

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.log("Video User Data Error: ", error);
    return new NextResponse("internal server error", { status: 500 });
  }
}
