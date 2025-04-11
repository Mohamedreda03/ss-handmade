import { deleteVideoFromVimeo } from "@/actions/deleteVideoFromVimeo";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { existsSync, unlinkSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { chapterId: string } }
) {
  try {
    const body = await req.json();

    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.chapter.update({
      where: {
        id: params.chapterId,
      },
      data: {
        ...body,
      },
    });

    return new NextResponse("Chapter updated successfully", { status: 200 });
  } catch (error) {
    console.log("ERROR IN PUT CHAPTERID:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params: { chapterId } }: { params: { chapterId: string } }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // استرجاع الـ Chapter والعلاقات المرتبطة
    const chapter = await prisma.chapter.findUnique({
      where: {
        id: chapterId,
      },
      include: {
        Lesson: {
          include: {
            testQuestions: {
              include: {
                answers: true,
              },
            },
          },
        },
      },
    });

    if (!chapter) {
      return new NextResponse("Chapter not found", { status: 404 });
    }

    // حذف الصور المرتبطة بالـ Lessons
    for (const lesson of chapter.Lesson) {
      if (lesson.testQuestions.length) {
        for (const question of lesson.testQuestions) {
          if (question.image_url) {
            const fileName = question.image_url.split("/").pop() as string;
            const path = join(
              process.cwd(),
              "..",
              "uploads",
              "images",
              fileName
            );
            if (existsSync(path)) {
              unlinkSync(path);
            }
          }

          for (const answer of question.answers) {
            if (answer.image_url) {
              const fileName = answer.image_url.split("/").pop() as string;
              const path = join(
                process.cwd(),
                "..",
                "uploads",
                "images",
                fileName
              );
              if (existsSync(path)) {
                unlinkSync(path);
              }
            }
          }
        }
      }

      if (lesson.fileUrl) {
        const fileName = lesson.fileUrl.split("/").pop() as string;
        const path = join(process.cwd(), "..", "uploads", "files", fileName);
        if (existsSync(path)) {
          unlinkSync(path);
        }
      }

      if (lesson.videoUrl) {
        await deleteVideoFromVimeo(lesson.videoUrl);
      }
    }

    await prisma.chapter.delete({
      where: {
        id: chapterId,
      },
    });

    return NextResponse.json({ message: "Chapter deleted successfully" });
  } catch (error) {
    console.log("ERROR IN DELETE Chapter chapterId:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params: { chapterId } }: { params: { chapterId: string } }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const chapter = await prisma.chapter.findFirst({
      where: {
        id: chapterId,
      },
    });

    const lessons = await prisma.lesson.findMany({
      where: {
        chapterId,
      },
      orderBy: {
        position: "asc",
      },
    });

    const requiredFields = [chapter?.title, lessons.length];

    const totalFields = requiredFields.length;
    const filledFields = requiredFields.filter(Boolean).length;

    return NextResponse.json({
      chapter,
      lessons,
      requiredFields,
      totalFields,
      filledFields,
    });
  } catch (error) {
    console.log("ERROR IN GET CHAPTERID:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
