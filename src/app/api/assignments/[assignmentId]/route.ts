import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET - جلب تفاصيل مهمة
export async function GET(
  req: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const assignment = await prisma.assignment.findUnique({
      where: {
        id: params.assignmentId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        chapter: {
          select: {
            id: true,
            title: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
          },
        },
        submissions: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            grade: true,
          },
        },
      },
    });

    if (!assignment) {
      return new NextResponse("Assignment not found", { status: 404 });
    }

    // التحقق من الصلاحيات
    if (session.user.role === "STUDENT") {
      // الطلاب يرون المهام المنشورة فقط
      if (!assignment.isPublished) {
        return new NextResponse("Assignment not published", { status: 403 });
      }
    } else if (session.user.role === "CONSTRUCTOR") {
      // المعلمون يرون مهامهم فقط
      if (assignment.creatorId !== session.user.id) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
    }
    // الأدمن يرى جميع المهام

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("[ASSIGNMENT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PATCH - تحديث مهمة
export async function PATCH(
  req: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !["CONSTRUCTOR", "ADMIN"].includes(session.user.role)
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const assignment = await prisma.assignment.findUnique({
      where: {
        id: params.assignmentId,
      },
    });

    if (!assignment) {
      return new NextResponse("Assignment not found", { status: 404 });
    }

    // التحقق من الصلاحيات
    if (
      session.user.role === "CONSTRUCTOR" &&
      assignment.creatorId !== session.user.id
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      questionText,
      questionFileUrl,
      questionImageUrl,
      questionVideoUrl,
      courseId,
      chapterId,
      lessonId,
      maxGrade,
      isPublished,
      allowFileSubmission,
      allowImageSubmission,
      allowVideoSubmission,
    } = body;

    const updatedAssignment = await prisma.assignment.update({
      where: {
        id: params.assignmentId,
      },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(questionText !== undefined && { questionText }),
        ...(questionFileUrl !== undefined && { questionFileUrl }),
        ...(questionImageUrl !== undefined && { questionImageUrl }),
        ...(questionVideoUrl !== undefined && { questionVideoUrl }),
        ...(courseId !== undefined && { courseId }),
        ...(chapterId !== undefined && { chapterId }),
        ...(lessonId !== undefined && { lessonId }),
        ...(maxGrade !== undefined && { maxGrade }),
        ...(isPublished !== undefined && { isPublished }),
        ...(allowFileSubmission !== undefined && { allowFileSubmission }),
        ...(allowImageSubmission !== undefined && { allowImageSubmission }),
        ...(allowVideoSubmission !== undefined && { allowVideoSubmission }),
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        chapter: {
          select: {
            id: true,
            title: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(updatedAssignment);
  } catch (error) {
    console.error("[ASSIGNMENT_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE - حذف مهمة
export async function DELETE(
  req: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !["CONSTRUCTOR", "ADMIN"].includes(session.user.role)
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const assignment = await prisma.assignment.findUnique({
      where: {
        id: params.assignmentId,
      },
    });

    if (!assignment) {
      return new NextResponse("Assignment not found", { status: 404 });
    }

    // التحقق من الصلاحيات
    if (
      session.user.role === "CONSTRUCTOR" &&
      assignment.creatorId !== session.user.id
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.assignment.delete({
      where: {
        id: params.assignmentId,
      },
    });

    return new NextResponse("Assignment deleted successfully", { status: 200 });
  } catch (error) {
    console.error("[ASSIGNMENT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
