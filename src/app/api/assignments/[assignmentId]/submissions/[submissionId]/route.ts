import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET - جلب تفاصيل إجابة
export async function GET(
  req: NextRequest,
  { params }: { params: { assignmentId: string; submissionId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const submission = await prisma.assignmentSubmission.findUnique({
      where: {
        id: params.submissionId,
      },
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
            creatorId: true,
          },
        },
        grade: {
          include: {
            grader: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!submission) {
      return new NextResponse("Submission not found", { status: 404 });
    }

    // التحقق من الصلاحيات
    if (session.user.role === "STUDENT") {
      // الطلاب يرون إجاباتهم فقط
      if (submission.studentId !== session.user.id) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
    } else if (session.user.role === "CONSTRUCTOR") {
      // المعلمون يرون إجابات مهامهم فقط
      if (submission.assignment.creatorId !== session.user.id) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
    }
    // الأدمن يرى جميع الإجابات

    return NextResponse.json(submission);
  } catch (error) {
    console.error("[SUBMISSION_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PATCH - تحديث إجابة (للطلاب قبل الموعد النهائي)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { assignmentId: string; submissionId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "STUDENT") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const submission = await prisma.assignmentSubmission.findUnique({
      where: {
        id: params.submissionId,
      },
      include: {
        assignment: true,
      },
    });

    if (!submission) {
      return new NextResponse("Submission not found", { status: 404 });
    } // التحقق من ملكية الإجابة
    if (submission.studentId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { submissionType, fileUrl, imageUrl, videoUrl, studentNote } = body;

    // التحقق من نوع الإجابة
    if (!["FILE", "IMAGE", "VIDEO"].includes(submissionType)) {
      return new NextResponse("Invalid submission type", { status: 400 });
    }

    // التحقق من السماح بنوع الإجابة
    if (
      submissionType === "FILE" &&
      !submission.assignment.allowFileSubmission
    ) {
      return new NextResponse("File submission not allowed", { status: 400 });
    }
    if (
      submissionType === "IMAGE" &&
      !submission.assignment.allowImageSubmission
    ) {
      return new NextResponse("Image submission not allowed", { status: 400 });
    }
    if (
      submissionType === "VIDEO" &&
      !submission.assignment.allowVideoSubmission
    ) {
      return new NextResponse("Video submission not allowed", { status: 400 });
    }

    const updatedSubmission = await prisma.assignmentSubmission.update({
      where: {
        id: params.submissionId,
      },
      data: {
        submissionType,
        fileUrl: submissionType === "FILE" ? fileUrl : null,
        imageUrl: submissionType === "IMAGE" ? imageUrl : null,
        videoUrl: submissionType === "VIDEO" ? videoUrl : null,
        studentNote,
        submittedAt: new Date(),
      },
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
          },
        },
      },
    });

    return NextResponse.json(updatedSubmission);
  } catch (error) {
    console.error("[SUBMISSION_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE - حذف إجابة
export async function DELETE(
  req: NextRequest,
  { params }: { params: { assignmentId: string; submissionId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const submission = await prisma.assignmentSubmission.findUnique({
      where: {
        id: params.submissionId,
      },
      include: {
        assignment: true,
      },
    });

    if (!submission) {
      return new NextResponse("Submission not found", { status: 404 });
    }

    // التحقق من الصلاحيات
    if (session.user.role === "STUDENT") {
      // الطلاب يحذفون إجاباتهم فقط
      if (submission.studentId !== session.user.id) {
        return new NextResponse("Unauthorized", { status: 401 });
      } // التحقق من انتهاء الموعد - تعليق مؤقت لعدم وجود dueDate في النموذج
      // if (
      //   submission.assignment.dueDate &&
      //   new Date() > submission.assignment.dueDate
      // ) {
      //   return new NextResponse("Assignment deadline has passed", {
      //     status: 403,
      //   });
      // }
    } else if (session.user.role === "CONSTRUCTOR") {
      // المعلمون يحذفون إجابات مهامهم فقط
      if (submission.assignment.creatorId !== session.user.id) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
    }
    // الأدمن يحذف أي إجابة

    await prisma.assignmentSubmission.delete({
      where: {
        id: params.submissionId,
      },
    });

    return new NextResponse("Submission deleted successfully", { status: 200 });
  } catch (error) {
    console.error("[SUBMISSION_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
