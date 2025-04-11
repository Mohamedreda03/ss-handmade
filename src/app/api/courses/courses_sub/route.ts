import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const [courses, subscriptions] = await Promise.all([
      prisma.course.findMany({
        where: {
          isPublished: true,
        },
      }),
      prisma.subscription.findMany({
        where: {
          userId: session?.user.id,
        },
      }),
    ]);

    return NextResponse.json({ courses, subscriptions });
  } catch (error) {
    console.log(error);
    return new NextResponse("internal server error", { status: 500 });
  }
}
