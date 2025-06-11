import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const status = url.searchParams.get("status") || "ALL";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build where clause based on status filter
    const whereClause: any = {};
    if (status !== "ALL") {
      whereClause.status = status;
    } // Get contractors with pagination
    const [contractors, totalContractors, statusStats] = await Promise.all([
      prisma.contractorProfile.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.contractorProfile.count({
        where: whereClause,
      }),
      // Get stats for all statuses
      prisma.contractorProfile.groupBy({
        by: ["status"],
        _count: {
          status: true,
        },
      }),
    ]);

    // Convert stats array to object for easier access
    const stats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      suspended: 0,
    };

    statusStats.forEach((stat) => {
      const status = stat.status.toLowerCase() as keyof typeof stats;
      if (status in stats) {
        stats[status] = stat._count.status;
      }
    });

    const totalPages = Math.ceil(totalContractors / limit);

    return NextResponse.json({
      success: true,
      data: contractors,
      stats,
      pagination: {
        totalPages,
        currentPage: page,
        totalContractors,
      },
    });
  } catch (error) {
    console.error("[CONTRACTORS_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ في النظام" },
      { status: 500 }
    );
  }
}
