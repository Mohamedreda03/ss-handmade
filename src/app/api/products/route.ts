import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProductType } from "@prisma/client";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

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

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Allow both STUDENT and CONSTRUCTOR to create products
    if (!["STUDENT", "CONSTRUCTOR", "ADMIN"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, description, price, imageUrl, stock, isAvailable } =
      await req.json();

    // Validate required fields
    if (!name || typeof name !== "string" || name.length < 3) {
      return new NextResponse("اسم المنتج مطلوب ولا يقل عن 3 أحرف", {
        status: 400,
      });
    }

    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(numPrice) || numPrice <= 0) {
      return new NextResponse("السعر يجب أن يكون رقم موجب", { status: 400 });
    }

    const numStock = typeof stock === "string" ? parseInt(stock) : stock;
    if (isNaN(numStock) || numStock < 0) {
      return new NextResponse("الكمية يجب أن تكون رقم موجب أو صفر", {
        status: 400,
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || "",
        price: numPrice,
        imageUrl: imageUrl || null,
        stock: numStock,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        type: "HANDMADE", // Products created by users are HANDMADE
        userId: session.user.id, // Associate product with the user
      },
    });

    // Revalidate the my-products page to show the new product
    revalidatePath("/my-products");

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.log("[PRODUCTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
