import { getServerSession } from "@/actions/getServerSession";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { NextResponse } from "next/server";

// PATCH /api/order-items/[itemId] - Actualizar el estado de un ítem de pedido
export async function PATCH(
  req: Request,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { itemId } = params;
    const { status } = await req.json();

    // Validar que el estado sea válido
    if (!Object.values(OrderStatus).includes(status)) {
      return new NextResponse("Invalid status", { status: 400 });
    }

    // Buscar el ítem de pedido y verificar que el usuario sea el vendedor del producto
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: itemId },
      include: {
        product: true,
      },
    });

    if (!orderItem) {
      return new NextResponse("Order item not found", { status: 404 });
    }

    // Verificar que el usuario actual es el vendedor del producto
    if (orderItem.product.userId !== session.user.id) {
      return new NextResponse("Forbidden: Not the seller of this product", {
        status: 403,
      });
    }

    // Actualizar el estado del ítem de pedido
    const updatedOrderItem = await prisma.orderItem.update({
      where: { id: itemId },
      data: { status },
      include: {
        product: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    return NextResponse.json(updatedOrderItem);
  } catch (error) {
    console.error("[ORDER_ITEM_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
