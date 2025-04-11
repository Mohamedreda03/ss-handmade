import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params: { courseId } }: { params: { courseId: string } }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const [course, items] = await Promise.all([
      prisma.course.findUnique({
        where: {
          id: courseId,
        },
      }),
      prisma.chapter.findMany({
        where: {
          courseId,
        },
        orderBy: {
          position: "asc",
        },
      }),
    ]);

    const itemsCount = items.length;

    return NextResponse.json({ course, items, itemsCount });
  } catch (error) {
    console.log("COURSES COURSEiD ROUTE ERROR", error);
  }
}
