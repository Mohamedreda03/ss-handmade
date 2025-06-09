import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    let { courseId } = params;
    let { title } = await req.json();

    const session = await auth();
    if (!session || !["ADMIN", "CONSTRUCTOR"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // التحقق من صلاحية إضافة فصل للكورس
    const courseAccess = await prisma.course.findUnique({
      where: { id: courseId },
      select: { userId: true },
    });

    if (!courseAccess) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // إذا كان constructor، يجب أن يكون مالك الكورس
    if (
      session.user.role === "CONSTRUCTOR" &&
      courseAccess.userId !== session.user.id
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const chaptersLength = await prisma.chapter.count({
      where: {
        courseId,
      },
    });

    const chapter = await prisma.chapter.create({
      data: {
        title,
        courseId,
        position: chaptersLength,
      },
    });

    return NextResponse.json(chapter);
  } catch (error) {
    console.log("ERROR IN POST CHAPTERID:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
