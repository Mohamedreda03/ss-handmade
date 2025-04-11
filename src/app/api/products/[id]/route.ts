import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

    const isOwner = await prisma.product.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!isOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const product = await prisma.product.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data,
    });

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
