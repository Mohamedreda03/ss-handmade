import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { chapterId: string; courseId: string } }
) {
  try {
    let body = await req.json();

    const session = await auth();
    if (!session || !["ADMIN", "CONSTRUCTOR"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // التحقق من صلاحية إضافة درس
    const chapterAccess = await prisma.chapter.findUnique({
      where: { id: params.chapterId },
      include: {
        course: {
          select: { userId: true },
        },
      },
    });

    if (!chapterAccess) {
      return new NextResponse("Chapter not found", { status: 404 });
    }

    // إذا كان constructor، يجب أن يكون مالك الكورس
    if (
      session.user.role === "CONSTRUCTOR" &&
      chapterAccess.course.userId !== session.user.id
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const lessonsLength = await prisma.lesson.count({
      where: {
        chapterId: body.chapterId,
      },
    });

    body.position = lessonsLength;
    body.chapterId = params.chapterId;

    await prisma.chapter.update({
      where: {
        id: params.chapterId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    const lesson = await prisma.lesson.create({
      data: {
        ...body,
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.log("ERROR IN PUT CHAPTERID:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
