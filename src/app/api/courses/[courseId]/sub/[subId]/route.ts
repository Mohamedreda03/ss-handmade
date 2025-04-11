import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { subId: string } }
) {
  try {
    await prisma.subscription.delete({
      where: {
        id: params.subId,
      },
    });

    return new NextResponse("deleted", { status: 200 });
  } catch (error) {
    console.log("GET SUB DATA:", error);
    return new NextResponse("internal server error", { status: 500 });
  }
}
