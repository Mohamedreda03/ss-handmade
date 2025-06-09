import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    let list = await req.json();

    const session = await auth();
    if (!session || !["ADMIN", "CONSTRUCTOR"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // For CONSTRUCTOR, verify ownership of the course
    if (session.user.role === "CONSTRUCTOR") {
      const courseAccess = await prisma.course.findUnique({
        where: { id: params.courseId },
        select: { userId: true },
      });

      if (!courseAccess || courseAccess.userId !== session.user.id) {
        return new NextResponse("Unauthorized access to this course", {
          status: 401,
        });
      }
    }

    for (let item of list) {
      await prisma.chapter.update({
        where: {
          id: item.id,
        },
        data: {
          position: item.position,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("ERROR IN PUT CHAPTERID:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
