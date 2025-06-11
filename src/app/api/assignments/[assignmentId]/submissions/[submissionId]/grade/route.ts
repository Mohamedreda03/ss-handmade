import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST - إضافة تقييم
export async function POST(
  req: NextRequest,
  { params }: { params: { assignmentId: string; submissionId: string } }
) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !["CONSTRUCTOR", "ADMIN"].includes(session.user.role)
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const submission = await prisma.assignmentSubmission.findUnique({
      where: {
        id: params.submissionId,
      },
      include: {
        assignment: true,
        grade: true,
      },
    });

    if (!submission) {
      return new NextResponse("Submission not found", { status: 404 });
    }

    // التحقق من الصلاحيات
    if (
      session.user.role === "CONSTRUCTOR" &&
      submission.assignment.creatorId !== session.user.id
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // التحقق من وجود تقييم سابق
    if (submission.grade) {
      return new NextResponse("Grade already exists", { status: 400 });
    }

    const body = await req.json();
    const { grade, feedback } = body;

    // التحقق من صحة الدرجة
    if (grade < 0 || grade > submission.assignment.maxGrade) {
      return new NextResponse(
        `Grade must be between 0 and ${submission.assignment.maxGrade}`,
        { status: 400 }
      );
    }

    const assignmentGrade = await prisma.assignmentGrade.create({
      data: {
        submissionId: params.submissionId,
        graderId: session.user.id,
        grade: parseFloat(grade),
        feedback,
      },
      include: {
        grader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        submission: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            assignment: {
              select: {
                id: true,
                title: true,
                maxGrade: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(assignmentGrade);
  } catch (error) {
    console.error("[GRADE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PATCH - تحديث تقييم
export async function PATCH(
  req: NextRequest,
  { params }: { params: { assignmentId: string; submissionId: string } }
) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !["CONSTRUCTOR", "ADMIN"].includes(session.user.role)
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const submission = await prisma.assignmentSubmission.findUnique({
      where: {
        id: params.submissionId,
      },
      include: {
        assignment: true,
        grade: true,
      },
    });

    if (!submission) {
      return new NextResponse("Submission not found", { status: 404 });
    }

    if (!submission.grade) {
      return new NextResponse("Grade not found", { status: 404 });
    }

    // التحقق من الصلاحيات
    if (session.user.role === "CONSTRUCTOR") {
      if (submission.assignment.creatorId !== session.user.id) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
    }

    const body = await req.json();
    const { grade, feedback } = body;

    // التحقق من صحة الدرجة
    if (
      grade !== undefined &&
      (grade < 0 || grade > submission.assignment.maxGrade)
    ) {
      return new NextResponse(
        `Grade must be between 0 and ${submission.assignment.maxGrade}`,
        { status: 400 }
      );
    }

    const updatedGrade = await prisma.assignmentGrade.update({
      where: {
        id: submission.grade.id,
      },
      data: {
        ...(grade !== undefined && { grade: parseFloat(grade) }),
        ...(feedback !== undefined && { feedback }),
      },
      include: {
        grader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        submission: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            assignment: {
              select: {
                id: true,
                title: true,
                maxGrade: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedGrade);
  } catch (error) {
    console.error("[GRADE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
