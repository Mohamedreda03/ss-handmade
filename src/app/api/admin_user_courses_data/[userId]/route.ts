import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;

    const userData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        Subscription: {
          include: {
            course: true,
          },
        },
      },
    });

    return NextResponse.json(userData);
  } catch (error) {
    console.log("admin_user_courses_data route error", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
