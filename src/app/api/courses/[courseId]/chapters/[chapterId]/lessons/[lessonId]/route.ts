import { deleteVideoFromVimeo } from "@/actions/deleteVideoFromVimeo";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import axios from "axios";
import { existsSync, unlinkSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

export async function PATCH(
  req: NextRequest,
  { params: { lessonId } }: { params: { lessonId: string } }
) {
  try {
    let body = await req.json();

    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.lesson.update({
      where: {
        id: lessonId,
      },
      data: {
        ...body,
      },
    });

    return NextResponse.json({ message: "Lesson updated successfully" });
  } catch (error) {
    console.log("ERROR IN PATCH Lesson lessonId:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params: { lessonId } }: { params: { lessonId: string } }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const lesson = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
      },
      include: {
        testQuestions: {
          include: {
            answers: true,
          },
        },
      },
    });

    if (!lesson) {
      return new NextResponse("Lesson not found", { status: 404 });
    }

    if (lesson.testQuestions.length) {
      for (let i = 0; i < lesson.testQuestions.length; i++) {
        if (lesson.testQuestions[i].image_url) {
          const fileName = lesson?.testQuestions[i]?.image_url
            ?.split("/")
            .pop() as string;

          let path = join(process.cwd(), "..", "uploads", "images", fileName);

          if (existsSync(path)) {
            unlinkSync(path);
          }
        }

        lesson.testQuestions[i].answers.forEach(async (answer) => {
          if (answer.image_url) {
            const fileName = answer.image_url.split("/").pop() as string;

            let path = join(process.cwd(), "..", "uploads", "images", fileName);

            if (existsSync(path)) {
              unlinkSync(path);
            }
          }
        });
      }
    }

    if (lesson.fileUrl) {
      const fileName = lesson.fileUrl.split("/").pop() as string;

      let path = join(process.cwd(), "..", "uploads", "files", fileName);

      if (existsSync(path)) {
        unlinkSync(path);
      }
    }

    if (lesson.videoUrl) {
      await deleteVideoFromVimeo(lesson.videoUrl);
    }

    await prisma.lesson.delete({
      where: {
        id: lessonId,
      },
    });

    return NextResponse.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.log("ERROR IN DELETE Lesson lessonId:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params: { lessonId } }: { params: { lessonId: string } }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
      },
      include: {
        testQuestions: true,
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.log("ERROR IN GET Lesson lessonId:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
