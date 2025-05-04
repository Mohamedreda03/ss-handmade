import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET(request: Request) {
  try {
    // استخراج معلمات الاستعلام
    const url = new URL(request.url);
    const filter = url.searchParams.get("filter") || "all";

    // تحديد تصفية الاستعلام حسب الفلتر
    const whereClause: any = {
      isAvailable: true,
    };

    // إضافة شروط تصفية إضافية حسب نوع الفلتر
    if (filter === "student") {
      whereClause.User = {
        role: Role.STUDENT,
      };
    } else if (filter === "platform") {
      whereClause.User = {
        NOT: {
          role: Role.STUDENT,
        },
      };
    }

    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
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
      // لا نحتاج التحديد هنا لأننا نستخدم التحديد في الواجهة
      // take: 8,
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching handmade products:", error);
    return NextResponse.json(
      { error: "فشل في جلب المنتجات المصنوعة يدويًا" },
      { status: 500 }
    );
  }
}
