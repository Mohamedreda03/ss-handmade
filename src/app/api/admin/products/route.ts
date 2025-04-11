import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const { name, description, price, imageUrl, stock, isAvailable } =
      await req.json();

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

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        imageUrl,
        stock: stock || 0,
        isAvailable: isAvailable === undefined ? true : isAvailable,
        type: "EQUIPMENT",
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const products = await prisma.product.findMany({
      where: {
        // isAvailable: isAvailable === "true",
        type: "EQUIPMENT",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.log("[PRODUCTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
