import { getServerSession } from "@/actions/getServerSession";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { orderId } = params;

    // Fetch the order with its items and product details
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        // Make sure the user is either the buyer or a seller of one of the products
        OR: [
          { userId: session.user.id }, // User is the buyer
          {
            orderItems: {
              some: {
                product: {
                  userId: session.user.id, // User is the seller of at least one product
                },
              },
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              include: {
                User: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("[ORDER_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
