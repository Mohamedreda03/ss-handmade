import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const { name, description, price, imageUrl, stock, isAvailable, type } =
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
        type: type || "HANDMADE", // استخدام النوع المرسل أو يدوي كافتراضي
        userId: session.user.id, // ربط المنتج بالمشرف الذي أنشأه
        approvalStatus: "APPROVED", // المنتجات التي ينشئها المشرف مقبولة مباشرة
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
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const availability = searchParams.get("availability");
    const stockFilter = searchParams.get("stockFilter");
    const approvalStatus = searchParams.get("approvalStatus");
    const productType = searchParams.get("productType");
    const page = Number(searchParams.get("page") || "0");
    const pageSize = Number(searchParams.get("pageSize") || "0");

    // إذا لم يتم تمرير pagination، اعرض جميع المنتجات
    const usePagination = page > 0 && pageSize > 0;
    const skip = usePagination ? (page - 1) * pageSize : undefined;
    const take = usePagination ? pageSize : undefined; // بناء شروط البحث
    const whereConditions: any = {};

    // فلترة حسب حالة الموافقة
    if (approvalStatus && approvalStatus !== "all") {
      whereConditions.approvalStatus = approvalStatus;
    }

    // فلترة حسب نوع المنتج
    if (productType && productType !== "all") {
      whereConditions.type = productType;
    }

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
    const queryOptions: any = {
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
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    };

    // إضافة pagination فقط عند الحاجة
    if (usePagination) {
      queryOptions.skip = skip;
      queryOptions.take = take;
    }

    const [products, totalProducts] = await Promise.all([
      prisma.product.findMany(queryOptions),
      prisma.product.count({
        where: whereConditions,
      }),
    ]);

    const response: any = {
      data: products,
    };

    // إضافة معلومات pagination فقط عند الحاجة
    if (usePagination) {
      const totalPages = Math.ceil(totalProducts / pageSize);
      response.meta = {
        totalProducts,
        totalPages,
        currentPage: page,
        pageSize,
      };
    } else {
      response.meta = {
        totalProducts,
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.log("[PRODUCTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
