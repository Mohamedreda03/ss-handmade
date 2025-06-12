import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or constructor
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "CONSTRUCTOR")) {
      return NextResponse.json(
        { error: "Forbidden - Admin or Constructor access required" },
        { status: 403 }
      );
    } // Get courses based on user role
    let whereClause = {};

    if (user.role === "CONSTRUCTOR") {
      // Constructor only sees their own courses
      whereClause = {
        userId: session.user.id,
      };
    }
    // Admin sees all courses (no where clause needed)

    const courses = await prisma.course.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        description: true,
        isPublished: true,
        _count: {
          select: {
            assignments: true,
            Lesson: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching admin courses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
