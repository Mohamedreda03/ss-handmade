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

    const videoUserData = await prisma.videoUserData.findFirst({
      where: {
        lessonId: params.lessonId,
        userId: session.user.id,
      },
    });

    if (!videoUserData) {
      await prisma.videoUserData.create({
        data: {
          lessonId: params.lessonId,
          userId: session.user.id,
          isCompleted: 1,
        },
      });
    } else {
      await prisma.videoUserData.update({
        where: {
          id: videoUserData.id,
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
