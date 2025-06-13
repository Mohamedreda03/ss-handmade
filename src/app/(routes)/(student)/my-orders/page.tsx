import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { OrdersClientRTL } from "./OrdersClientRTL";

export default async function MyOrdersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
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
  // This optimized query uses the new index on OrderItem.productId
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
          id: true, // Include user ID for reference
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
        // Only include items from products owned by this seller
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
  return (
    <OrdersClientRTL
      buyerOrders={buyerOrders}
      sellerOrders={sellerOrders}
      totalRevenue={totalRevenue}
    />
  );
}
