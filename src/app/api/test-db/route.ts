import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Test database connection
    const dbInfo = {
      dbConnectionTest: "Connection attempted",
    };

    // Count products
    const productCount = await prisma.product.count();

    // Get a sample of products
    const products = await prisma.product.findMany({
      take: 5,
      include: {
        User: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      dbInfo,
      productCount,
      sampleProducts: products,
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Database connection error: ${error}`,
      },
      { status: 500 }
    );
  }
}
