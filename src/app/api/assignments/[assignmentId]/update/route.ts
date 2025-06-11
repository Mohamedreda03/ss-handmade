import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
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
      questionType,
      questionText,
      questionFileUrl,
      questionImageUrl,
      questionVideoUrl,
      maxGrade,
      allowFileSubmission,
      allowImageSubmission,
      allowVideoSubmission,
    } = body;

    const updatedAssignment = await prisma.assignment.update({
      where: {
        id: params.assignmentId,
      },
      data: {
        title,
        description,
        questionType,
        questionText: questionType === "TEXT" ? questionText : null,
        questionFileUrl: questionType === "FILE" ? questionFileUrl : null,
        questionImageUrl: questionType === "IMAGE" ? questionImageUrl : null,
        questionVideoUrl: questionType === "VIDEO" ? questionVideoUrl : null,
        maxGrade,
        allowFileSubmission,
        allowImageSubmission,
        allowVideoSubmission,
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
    console.error("[ASSIGNMENT_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
