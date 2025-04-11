import { isAdmin } from "@/actions/isAdmin";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params: { courseId } }: { params: { courseId: string } }
) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      include: {
        chapters: {
          where: {
            Lesson: {
              some: {
                OR: [{ type: "test" }, { type: "sheet" }],
              },
            },
          },
          include: {
            Lesson: {
              where: {
                OR: [{ type: "test" }, { type: "sheet" }],
              },
              orderBy: {
                position: "asc",
              },
            },
          },
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.log("COURSES GET ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
