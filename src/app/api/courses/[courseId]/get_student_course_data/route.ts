import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params: { courseId } }: { params: { courseId: string } }
) {
  try {
    const session = await auth();

    const [course, subscription] = await Promise.all([
      prisma.course.findFirst({
        where: {
          id: courseId,
        },
      }),
      prisma.subscription.findFirst({
        where: {
          courseId: courseId,
          userId: session?.user.id,
        },
      }),
    ]);

    const isOwned = subscription ? true : false;

    return NextResponse.json({ course, subscription, isOwned, session });
  } catch (error) {
    console.log("COURSES COURSEiD ROUTE ERROR", error);
  }
}
