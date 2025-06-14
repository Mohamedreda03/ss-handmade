import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchQuery = req.nextUrl.searchParams.get("query") as string;
    const searchType = req.nextUrl.searchParams.get("type") as string; // 'name' or 'email'
    const userFilter = req.nextUrl.searchParams.get("filter") as string; // 'ALL', 'STUDENT', 'CONSTRUCTOR', 'ADMIN'

    const page = Number(req.nextUrl.searchParams.get("page") || "1");
    const pageSize = Number(req.nextUrl.searchParams.get("pageSize") || "10");

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // تحديد شروط البحث بناءً على نوع البحث والفلتر
    let whereCondition: any = {};

    // فلتر النص
    if (searchQuery) {
      whereCondition[searchType === "email" ? "email" : "name"] = {
        contains: searchQuery,
        mode: "insensitive" as const,
      };
    } // فلتر نوع المستخدم
    if (userFilter && userFilter !== "ALL") {
      whereCondition.role = userFilter;
    }
    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where: whereCondition,
        orderBy: {
          [searchType === "email" ? "email" : "name"]: "asc",
        },
        skip,
        take,
      }),
      prisma.user.count({
        where: whereCondition,
      }),
    ]);

    const totalPages = Math.ceil(totalUsers / pageSize);

    return NextResponse.json({
      data: users,
      meta: {
        totalUsers,
        totalPages,
        currentPage: page,
        pageSize,
      },
    });
  } catch (error) {
    console.log("GET USERS DATA:", error);
    return new NextResponse("internal server error", { status: 500 });
  }
}
