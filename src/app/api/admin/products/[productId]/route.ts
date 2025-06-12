import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    if (!params.productId) {
      return new NextResponse("Product ID is required", { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: {
        id: params.productId,
      },
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const body = await req.json();
    const { name, description, price, imageUrl, stock, isAvailable } = body;

    console.log("PATCH request received:", {
      name,
      description,
      price: { value: price, type: typeof price },
      imageUrl,
      stock: { value: stock, type: typeof stock },
      isAvailable,
    });

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

    if (!params.productId) {
      return new NextResponse("Product ID is required", { status: 400 });
    } // Prepare update data with validation
    const updateData: any = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.length < 3) {
        return new NextResponse("اسم المنتج يجب أن يكون نص لا يقل عن 3 أحرف", {
          status: 400,
        });
      }
      updateData.name = name;
    }

    if (description !== undefined) updateData.description = description;

    if (price !== undefined) {
      const numPrice = typeof price === "string" ? parseFloat(price) : price;
      if (isNaN(numPrice) || numPrice <= 0) {
        return new NextResponse("السعر يجب أن يكون رقم موجب", { status: 400 });
      }
      updateData.price = numPrice;
    }

    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    if (stock !== undefined) {
      const numStock = typeof stock === "string" ? parseInt(stock) : stock;
      if (isNaN(numStock) || numStock < 0) {
        return new NextResponse("الكمية يجب أن تكون رقم موجب أو صفر", {
          status: 400,
        });
      }
      updateData.stock = numStock;
    }

    if (isAvailable !== undefined) {
      if (typeof isAvailable !== "boolean") {
        return new NextResponse("حالة التوفر يجب أن تكون true أو false", {
          status: 400,
        });
      }
      updateData.isAvailable = isAvailable;
    }

    console.log("Update data:", updateData);

    const product = await prisma.product.update({
      where: {
        id: params.productId,
      },
      data: updateData,
    });

    console.log("Updated product:", product);

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { productId: string } }
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

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: params.productId },
    });
    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Check for related order items - هذا يمنع الحذف نهائياً
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: params.productId },
    });

    if (orderItemsCount > 0) {
      return new NextResponse(
        JSON.stringify({
          error: "Cannot delete product with existing orders",
          message: `لا يمكن حذف هذا المنتج لأن لديه ${orderItemsCount} طلب. المنتجات التي لها طلبات لا يمكن حذفها نهائياً.`,
          orderCount: orderItemsCount,
          canDelete: false,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // إذا لم يكن لديه orderItems، تحقق من الكوبونات وامضي في الحذف
    const couponsCount = await prisma.coupon.count({
      where: { productId: params.productId },
    });

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // حذف جميع الكوبونات المرتبطة بالمنتج (مستخدمة وغير مستخدمة)
      if (couponsCount > 0) {
        await tx.coupon.deleteMany({
          where: {
            productId: params.productId,
          },
        });
      }

      // حذف المنتج
      const deletedProduct = await tx.product.delete({
        where: { id: params.productId },
      });

      return { product: deletedProduct, deletedCoupons: couponsCount };
    });

    return NextResponse.json({
      success: true,
      message: "تم حذف المنتج بنجاح",
      product: result,
    });
  } catch (error: any) {
    console.log("[PRODUCT_DELETE]", error);

    // Handle specific Prisma errors
    if (error.code === "P2003") {
      return new NextResponse(
        JSON.stringify({
          error: "Foreign key constraint violation",
          message: "لا يمكن حذف المنتج بسبب وجود بيانات مرتبطة به",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}
