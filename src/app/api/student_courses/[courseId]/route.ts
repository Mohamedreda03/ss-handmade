import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await auth();
    const [course, chapters, subscription] = await Promise.all([
      prisma.course.findFirst({
        where: {
          id: params.courseId,
        },
      }),
      prisma.chapter.findMany({
        where: {
          courseId: params.courseId,
        },
        include: {
          Lesson: true,
        },
      }),
      prisma.subscription.findFirst({
        where: {
          courseId: params.courseId,
          userId: session?.user.id,
        },
      }),
    ]);

    const isOwned = subscription ? true : false;

    return NextResponse.json({
      course,
      chapters,
      subscription,
      isOwned,
      session,
    });
  } catch (error) {
    console.log("error in getCourseLayoutData:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
