import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { couponId: string } }
) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", {
        status: 401,
      });
    }

    await prisma.coupon.delete({
      where: {
        id: params.couponId,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.log("delete coupon error:", error);
    return new NextResponse("Internal server error", {
      status: 500,
    });
  }
}
