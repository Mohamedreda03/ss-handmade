import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET - جلب مهام الطالب
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "STUDENT") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // "pending", "submitted", "graded"
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    let whereClause: any = {
      isPublished: true,
    };

    // فلترة حسب الحالة
    if (status === "pending") {
      whereClause.OR = [
        {
          submissions: {
            none: {
              studentId: session.user.id,
            },
          },
        },
        {
          submissions: {
            some: {
              studentId: session.user.id,
              isSubmitted: false,
            },
          },
        },
      ];
    } else if (status === "submitted") {
      whereClause.submissions = {
        some: {
          studentId: session.user.id,
          isSubmitted: true,
          grade: null,
        },
      };
    } else if (status === "graded") {
      whereClause.submissions = {
        some: {
          studentId: session.user.id,
          isSubmitted: true,
          grade: {
            isNot: null,
          },
        },
      };
    }

    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
        where: whereClause,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
            },
          },
          chapter: {
            select: {
              id: true,
              title: true,
            },
          },
          lesson: {
            select: {
              id: true,
              title: true,
            },
          },
          submissions: {
            where: {
              studentId: session.user.id,
            },
            include: {
              grade: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.assignment.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json({
      assignments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[MY_ASSIGNMENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
