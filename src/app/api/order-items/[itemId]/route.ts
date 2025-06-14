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

    console.log("🔄 بدء تحديث حالة العنصر:", {
      itemId,
      newStatus: status,
      userId: session.user.id,
    });

    // Validar que el estado sea válido
    if (!Object.values(OrderStatus).includes(status)) {
      console.error("❌ حالة غير صالحة:", status);
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
      console.error("❌ عنصر الطلب غير موجود:", itemId);
      return new NextResponse("Order item not found", { status: 404 });
    }

    console.log("📦 تفاصيل عنصر الطلب:", {
      itemId: orderItem.id,
      currentStatus: orderItem.status,
      productId: orderItem.productId,
      productOwnerId: orderItem.product.userId,
      requestingUserId: session.user.id,
    });

    // Verificar que el usuario actual es el vendedor del producto
    if (orderItem.product.userId !== session.user.id) {
      console.error("🚫 المستخدم ليس صاحب المنتج");
      return new NextResponse("Forbidden: Not the seller of this product", {
        status: 403,
      });
    }
    console.log("💾 تحديث عنصر الطلب في قاعدة البيانات...");

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
        order: {
          include: {
            orderItems: true,
          },
        },
      },
    });

    console.log("✅ تم تحديث عنصر الطلب:", {
      itemId: updatedOrderItem.id,
      oldStatus: orderItem.status,
      newStatus: updatedOrderItem.status,
      orderId: updatedOrderItem.orderId,
    }); // تحديث حالة الطلب بناءً على حالة العناصر
    const order = updatedOrderItem.order;
    const allItems = order.orderItems;

    console.log("🔍 تحديث حالة الطلب:", {
      orderId: order.id,
      currentOrderStatus: order.status,
      allItemsStatuses: allItems.map((item) => ({
        id: item.id,
        status: item.status,
      })),
    });

    // تحديد حالة الطلب بناءً على حالة العناصر - منطق محسن
    let newOrderStatus: OrderStatus;

    // عد العناصر حسب الحالة
    const statusCounts = {
      PENDING: allItems.filter((item) => item.status === OrderStatus.PENDING)
        .length,
      PROCESSING: allItems.filter(
        (item) => item.status === OrderStatus.PROCESSING
      ).length,
      COMPLETED: allItems.filter(
        (item) => item.status === OrderStatus.COMPLETED
      ).length,
      CANCELLED: allItems.filter(
        (item) => item.status === OrderStatus.CANCELLED
      ).length,
    };

    console.log("📊 إحصائيات الحالات:", statusCounts);

    // منطق تحديد الحالة الجديدة
    if (statusCounts.COMPLETED === allItems.length) {
      // جميع العناصر مكتملة
      newOrderStatus = OrderStatus.COMPLETED;
    } else if (statusCounts.CANCELLED === allItems.length) {
      // جميع العناصر ملغاة
      newOrderStatus = OrderStatus.CANCELLED;
    } else if (statusCounts.PROCESSING > 0 || statusCounts.COMPLETED > 0) {
      // هناك عناصر قيد المعالجة أو مكتملة
      newOrderStatus = OrderStatus.PROCESSING;
    } else {
      // جميع العناصر قيد الانتظار أو خليط من المعلق والملغي
      newOrderStatus = OrderStatus.PENDING;
    }

    console.log("📝 حالة الطلب الجديدة:", {
      oldStatus: order.status,
      newStatus: newOrderStatus,
      willUpdate: newOrderStatus !== order.status,
    }); // تحديث حالة الطلب إذا تغيرت
    if (newOrderStatus !== order.status) {
      console.log(
        "🔄 تحديث حالة الطلب من",
        order.status,
        "إلى",
        newOrderStatus
      );
      await prisma.order.update({
        where: { id: order.id },
        data: { status: newOrderStatus },
      });
      console.log("✅ تم تحديث حالة الطلب بنجاح");
    } else {
      console.log("⏭️ لا حاجة لتحديث حالة الطلب - الحالة لم تتغير");
    }

    console.log("📋 النتيجة النهائية:", {
      orderItemId: updatedOrderItem.id,
      orderItemStatus: updatedOrderItem.status,
      orderId: order.id,
      orderStatus: newOrderStatus,
    });

    return NextResponse.json(updatedOrderItem);
  } catch (error) {
    console.error("[ORDER_ITEM_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
