import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    console.log("🔍 Testing database connection...");

    // Test database connection with a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("✅ Database connection successful:", result);

    // Test subscription count for charts
    const subscriptionCount = await prisma.subscription.count();
    console.log("📊 Total subscriptions:", subscriptionCount);

    // Test users count
    const userCount = await prisma.user.count();
    console.log("👥 Total users:", userCount);

    // Test database connection
    const dbInfo = {
      dbConnectionTest: "Connection successful",
      timestamp: new Date().toISOString(),
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
    return NextResponse.json(
      {
        success: true,
        dbInfo,
        subscriptionCount,
        userCount,
        productCount,
        sampleProducts: products,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("❌ Database test error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown database error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
