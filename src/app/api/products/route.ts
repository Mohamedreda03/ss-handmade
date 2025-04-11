import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const limit = 15;
    const page = searchParams.get("page")
      ? parseInt(searchParams.get("page") as string)
      : 1;
    const skip = (page - 1) * limit;

    const sort = searchParams.get("sort") || "newest";

    const productType = searchParams.get("productType") || "all";

    let orderBy: any = {};
    if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    } else if (sort === "oldest") {
      orderBy = { createdAt: "asc" };
    }

    let where: any = {
      type: productType === "all" ? undefined : productType,
    };

    const products = await prisma.product.findMany({
      where: {
        name: {
          startsWith: search || undefined,
        },
        isAvailable: true,
        ...where,
      },

      take: limit,
      skip: skip,
      orderBy,
    });

    const totalProducts = await prisma.product.count({
      where: {
        name: {
          startsWith: search || undefined,
        },
        isAvailable: true,
      },
    });

    return NextResponse.json({
      data: products,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("[PRODUCTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const product = await prisma.product.create({
      data: {
        ...data,
        userId: session.user.id,
        type: "HANDMADE",
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("[PRODUCTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
