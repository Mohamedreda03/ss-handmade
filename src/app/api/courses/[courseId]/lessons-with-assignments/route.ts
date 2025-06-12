import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
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
    }
    const { courseId } = params;

    // For CONSTRUCTOR, verify ownership of the course
    if (user.role === "CONSTRUCTOR") {
      const courseAccess = await prisma.course.findUnique({
        where: { id: courseId },
        select: { userId: true },
      });

      if (!courseAccess || courseAccess.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Forbidden - You don't own this course" },
          { status: 403 }
        );
      }
    }

    // Get all lessons with assignments for the course
    const lessons = await prisma.lesson.findMany({
      where: {
        courseId: courseId,
        assignment: {
          isNot: null,
        },
      },
      select: {
        id: true,
        title: true,
        position: true,
        chapter: {
          select: {
            id: true,
            title: true,
            position: true,
          },
        },
        assignment: {
          select: {
            id: true,
            title: true,
            description: true,
            maxGrade: true,
            isPublished: true,
            _count: {
              select: {
                submissions: true,
              },
            },
          },
        },
      },
      orderBy: [{ chapter: { position: "asc" } }, { position: "asc" }],
    });

    return NextResponse.json(lessons);
  } catch (error) {
    console.error("Error fetching lessons with assignments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
