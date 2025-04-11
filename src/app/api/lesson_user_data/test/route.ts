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

    const oldTestRun = await prisma.testUserData.findMany({
      where: {
        userId: session.user.id,
        lessonId: body.lessonId,
        isCompleted: false,
      },
    });

    if (oldTestRun.length > 0) {
      return new NextResponse("You have already started test", {
        status: 400,
      });
    }

    const data = await prisma.testUserData.create({
      data: {
        lessonId: body.lessonId,
        userId: session.user.id,
        testEndTime: new Date(body.testEndTime),
      },
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.log("ERROR IN POST TEST:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
