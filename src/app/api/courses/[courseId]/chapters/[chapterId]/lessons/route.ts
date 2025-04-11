import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { chapterId: string; courseId: string } }
) {
  try {
    let body = await req.json();

    const lessonsLength = await prisma.lesson.count({
      where: {
        chapterId: body.chapterId,
      },
    });

    body.position = lessonsLength;
    body.chapterId = params.chapterId;

    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

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
