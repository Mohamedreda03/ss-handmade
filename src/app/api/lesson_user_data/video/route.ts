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

    const oldVideoData = await prisma.videoUserData.findFirst({
      where: {
        userId: session.user.id,
        lessonId: body.lessonId,
      },
    });

    if (oldVideoData) {
      await prisma.videoUserData.update({
        where: {
          id: oldVideoData.id,
        },
        data: {
          isCompleted: body.isCompleted
            ? oldVideoData.isCompleted + 1
            : oldVideoData.isCompleted,
        },
      });
    } else {
      await prisma.videoUserData.create({
        data: {
          lessonId: body.lessonId,
          userId: session.user.id,
          isCompleted: 1,
        },
      });
    }

    return NextResponse.json({ status: 201 });
  } catch (error) {
    console.log("ERROR IN POST TEST:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
