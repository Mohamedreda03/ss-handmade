import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["ADMIN", "CONSTRUCTOR"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name } = await req.json();

    const course = await prisma.course.create({
      data: {
        title: name,
        userId: session.user.id, // ربط الكورس بمنشئه
      },
    });

    return NextResponse.json({ data: course }, { status: 201 });
  } catch (error) {
    console.log("COURSES POST ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params: { lessonId } }: { params: { lessonId: string } }
) {
  try {
    const session = await auth();

    if (!session || !["ADMIN", "CONSTRUCTOR"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
      },
      include: {
        testQuestions: {
          include: {
            answers: true,
          },
        },
        chapter: {
          include: {
            course: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!lesson) {
      return new NextResponse("Lesson not found", { status: 404 });
    }

    // إذا كان constructor، يجب أن يكون مالك الكورس
    if (
      session.user.role === "CONSTRUCTOR" &&
      lesson.chapter.course.userId !== session.user.id
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    let requiredFields: any[] = [];

    let isTimeValid = lesson?.hours! > 0 || lesson?.minutes! > 0;

    if (lesson?.type === "video") {
      requiredFields = [lesson.title, lesson.videoUrl || lesson.videoId];
    } else if (lesson?.type === "file") {
      requiredFields = [lesson.title, lesson.fileUrl];
    } else if (lesson?.type === "test") {
      requiredFields = [
        lesson.title,
        lesson.testQuestions.length > 0,
        isTimeValid,
        lesson.exam_allowed_from,
        lesson.exam_allowed_to,
      ];
    } else if (lesson?.type === "sheet") {
      requiredFields = [
        lesson.title,
        lesson.testQuestions.length > 0,
        isTimeValid,
        lesson.number_of_entries_allowed,
        lesson.exam_allowed_from,
      ];
    }

    const totalFields = requiredFields.length;
    const filledFields = requiredFields.filter(Boolean).length;

    const isCompleted = totalFields === filledFields;

    return NextResponse.json({
      lesson,
      requiredFields,
      totalFields,
      filledFields,
      isCompleted,
    });
  } catch (error) {
    console.log("COURSES GET ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
