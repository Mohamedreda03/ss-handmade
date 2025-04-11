import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params: { testId } }: { params: { testId: string } }
) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.testUserData.update({
      where: {
        id: testId,
      },
      data: {
        userShowAnswers: true,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.log("COURSES GET SHOW TEST ANSWERS ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
