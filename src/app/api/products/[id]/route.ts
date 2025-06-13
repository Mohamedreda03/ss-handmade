import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json();
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Allow STUDENT, CONSTRUCTOR, and ADMIN to edit their own products
    if (!["STUDENT", "CONSTRUCTOR", "ADMIN"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const isOwner = await prisma.product.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!isOwner) {
      return new NextResponse(
        "Unauthorized - Product not found or you don't own this product",
        { status: 401 }
      );
    }

    // Validate the data before updating
    const updateData: any = {};

    if (data.name !== undefined) {
      if (typeof data.name !== "string" || data.name.length < 3) {
        return new NextResponse("اسم المنتج يجب أن يكون نص لا يقل عن 3 أحرف", {
          status: 400,
        });
      }
      updateData.name = data.name;
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    if (data.price !== undefined) {
      const numPrice =
        typeof data.price === "string" ? parseFloat(data.price) : data.price;
      if (isNaN(numPrice) || numPrice <= 0) {
        return new NextResponse("السعر يجب أن يكون رقم موجب", { status: 400 });
      }
      updateData.price = numPrice;
    }

    if (data.stock !== undefined) {
      const numStock =
        typeof data.stock === "string" ? parseInt(data.stock) : data.stock;
      if (isNaN(numStock) || numStock < 0) {
        return new NextResponse("الكمية يجب أن تكون رقم موجب أو صفر", {
          status: 400,
        });
      }
      updateData.stock = numStock;
    }

    if (data.imageUrl !== undefined) {
      updateData.imageUrl = data.imageUrl;
    }

    if (data.isAvailable !== undefined) {
      if (typeof data.isAvailable !== "boolean") {
        return new NextResponse("حالة التوفر يجب أن تكون true أو false", {
          status: 400,
        });
      }
      updateData.isAvailable = data.isAvailable;
    }
    const product = await prisma.product.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: updateData,
    });

    // Revalidate the my-products page to show updated data
    revalidatePath("/my-products");

    return NextResponse.json(product);
  } catch (error) {
    console.error("[PRODUCTS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const isOwner = await prisma.product.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!isOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const product = await prisma.product.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("[PRODUCTS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const product = await prisma.product.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("[PRODUCTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
