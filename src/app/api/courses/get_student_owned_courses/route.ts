import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId: session?.user.id,
      },
      include: {
        course: true,
      },
    });

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.log("COURSES POST ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
