import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      userId: string;
      courseId: string;
      chapterId: string;
      testId: string;
    };
  }
) {
  try {
    const { userId, testId } = params;

    await prisma.testUserData.deleteMany({
      where: {
        userId: userId,
        id: testId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("admin_user_courses_data route error", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
