import { getServerSession } from "@/actions/getServerSession";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch orders made by the user (as a buyer)
    const buyerOrders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // Fetch orders that include products owned by the user (as a seller)
    const sellerOrders = await prisma.order.findMany({
      where: {
        orderItems: {
          some: {
            product: {
              userId: session.user.id,
            },
          },
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            id: true,
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
          where: {
            product: {
              userId: session.user.id,
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate total revenue from products owned by the user
    const totalRevenue = sellerOrders.reduce((total, order) => {
      const orderTotal = order.orderItems.reduce((subtotal, item) => {
        return subtotal + item.price * item.quantity;
      }, 0);
      return total + orderTotal;
    }, 0);

    return NextResponse.json({
      buyerOrders,
      sellerOrders,
      totalRevenue,
    });
  } catch (error) {
    console.error("[ORDERS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
