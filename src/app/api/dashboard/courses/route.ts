import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Mark this route as dynamic to avoid static generation issues
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("limit") || "10", 10);

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [courses, totalCourses] = await Promise.all([
      prisma.course.findMany({
        select: {
          id: true,
          title: true,
          price: true,

          _count: {
            select: {
              Subscription: true,
            },
          },
        },
        skip,
        take,
      }),
      prisma.course.count(),
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
