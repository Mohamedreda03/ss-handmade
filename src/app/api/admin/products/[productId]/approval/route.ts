import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await auth();

    // التحقق من أن المستخدم مشرف
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { productId } = params;
    const { action } = await req.json(); // 'approve' أو 'reject'

    if (!action || !["approve", "reject"].includes(action)) {
      return new NextResponse("Invalid action. Use 'approve' or 'reject'", {
        status: 400,
      });
    }

    // التحقق من وجود المنتج
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // تحديث حالة الموافقة
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        approvalStatus: action === "approve" ? "APPROVED" : "REJECTED",
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    console.log(`Product ${action}d:`, {
      productId,
      productName: product.name,
      userId: product.User?.id,
      userName: product.User?.name,
      adminId: session.user.id,
    });

    return NextResponse.json({
      message: `Product ${action}d successfully`,
      product: updatedProduct,
    });
  } catch (error) {
    console.error("ERROR IN PRODUCT APPROVAL:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
