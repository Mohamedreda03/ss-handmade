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
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const availability = searchParams.get("availability");
    const stockFilter = searchParams.get("stockFilter");

    // بناء شروط البحث
    const whereConditions: any = {
      type: "EQUIPMENT", // فقط المعدات
    };

    // إضافة البحث النصي
    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // فلترة حسب التوفر
    if (availability && availability !== "all") {
      whereConditions.isAvailable = availability === "available";
    }

    // فلترة حسب المخزون
    if (stockFilter && stockFilter !== "all") {
      switch (stockFilter) {
        case "in_stock":
          whereConditions.stock = { gt: 0 };
          break;
        case "low_stock":
          whereConditions.stock = { gt: 0, lte: 10 };
          break;
        case "out_of_stock":
          whereConditions.stock = 0;
          break;
      }
    }

    const products = await prisma.product.findMany({
      where: whereConditions,
      include: {
        orderItems: {
          select: {
            id: true,
            quantity: true,
          },
        },
        User: {
          select: {
            id: true,
            name: true,
          },
        },
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
