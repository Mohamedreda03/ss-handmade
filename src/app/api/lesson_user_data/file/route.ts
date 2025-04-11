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

    const oldFileData = await prisma.fileUserData.findFirst({
      where: {
        userId: session.user.id,
        lessonId: body.lessonId,
      },
    });

    if (oldFileData) {
      await prisma.fileUserData.update({
        where: {
          id: oldFileData.id,
        },
        data: {
          isCompleted: body.isCompleted
            ? oldFileData.isCompleted + 1
            : oldFileData.isCompleted,
        },
      });
    } else {
      await prisma.fileUserData.create({
        data: {
          userId: session.user.id,
          lessonId: body.lessonId,
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
