import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["ADMIN", "CONSTRUCTOR"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("limit") || "10", 10);

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    let whereClause = {};

    // إذا كان المستخدم constructor، فلتر الكورسات بناءً على userId
    if (session.user.role === "CONSTRUCTOR") {
      whereClause = {
        userId: session.user.id,
      };
    }
    // إذا كان admin، فلا نضع أي فلتر (يرى جميع الكورسات)

    const [courses, totalCourses] = await Promise.all([
      prisma.course.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          price: true,
          User: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              Subscription: true,
            },
          },
        },
        skip,
        take,
      }),
      prisma.course.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalCourses / pageSize);

    return NextResponse.json({
      courses,
      totalCourses,
      totalPages,
      currentPage: page,
      pageSize,
    });
  } catch (error) {
    console.log("COURSES GET ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
