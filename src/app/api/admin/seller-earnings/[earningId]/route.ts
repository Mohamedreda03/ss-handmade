import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  req: Request,
  { params }: { params: { earningId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is an admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const sellerEarning = await prisma.sellerEarning.findUnique({
      where: {
        id: params.earningId,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItem: {
          include: {
            product: true,
          },
        },
        order: true,
      },
    });

    if (!sellerEarning) {
      return new NextResponse("Seller earning not found", { status: 404 });
    }

    return NextResponse.json(sellerEarning);
  } catch (error) {
    console.log("[SELLER_EARNING_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { earningId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { isPaid } = await req.json();

    // Check if user is an admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const sellerEarning = await prisma.sellerEarning.update({
      where: {
        id: params.earningId,
      },
      data: {
        isPaid,
        paidAt: isPaid ? new Date() : null,
      },
    });

    return NextResponse.json(sellerEarning);
  } catch (error) {
    console.log("[SELLER_EARNING_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
