import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProductType } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const sort = url.searchParams.get("sort") || "newest";
    const productType = url.searchParams.get("productType") || "all";
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = 12; // Number of products per page

    // Build where clause based on filters
    const whereClause: any = {
      isAvailable: true,
    };

    // Add search filter
    if (search) {
      whereClause.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    // Add product type filter
    if (productType !== "all") {
      whereClause.type = productType as ProductType;
    }

    // Determine order based on sort parameter
    const orderBy: any = {};
    if (sort === "newest") {
      orderBy.createdAt = "desc";
    } else if (sort === "oldest") {
      orderBy.createdAt = "asc";
    }

    // Run both queries in parallel for better performance
    const [totalItems, products] = await Promise.all([
      prisma.product.count({
        where: whereClause,
      }),
      prisma.product.findMany({
        orderBy,
        include: {
          User: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
        where: whereClause,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    const totalPages = Math.ceil(totalItems / pageSize);

    return NextResponse.json(
      {
        data: products,
        totalPages,
        currentPage: page,
        totalItems,
      },
      { headers: { "Cache-Control": "private, max-age=10" } }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "فشل في جلب المنتجات",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
