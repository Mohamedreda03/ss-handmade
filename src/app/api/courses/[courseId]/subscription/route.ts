import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ActionTypes } from "@/utils/actionsTypes";
import { stat } from "fs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const body = await req.json();
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { message: "User not found", status: 404 },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found", status: 404 },
        { status: 404 }
      );
    }

    await prisma.subscription.create({
      data: {
        courseId: params.courseId,
        userId: session.user.id,
      },
    });

    await prisma.history.create({
      data: {
        userId: session.user.id,
        courseId: params.courseId,
        price: body.coursePrice,
      },
    });

    return NextResponse.json(
      { message: "Subscribed", status: 200 },
      { status: 200 }
    );
  } catch (error) {
    console.log("GET USERS DATA:", error);
    return new NextResponse("internal server error", { status: 500 });
  }
}
