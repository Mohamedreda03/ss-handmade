import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET - جلب إجابات المهمة
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

    if (session.user.role === "STUDENT") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const submissions = await prisma.assignmentSubmission.findMany({
      where: {
        assignmentId: params.assignmentId,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
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
      orderBy: {
        submittedAt: "desc",
      },
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error("[SUBMISSIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST - إرسال إجابة
export async function POST(
  req: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "STUDENT") {
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
    if (!assignment.isPublished) {
      return new NextResponse("Assignment not published", { status: 403 });
    }

    // التحقق من وجود إجابة سابقة
    const existingSubmission = await prisma.assignmentSubmission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId: params.assignmentId,
          studentId: session.user.id,
        },
      },
    });

    if (existingSubmission && existingSubmission.isSubmitted) {
      return new NextResponse("Submission already exists", { status: 400 });
    }

    const body = await req.json();
    const { submissionType, fileUrl, imageUrl, videoUrl, studentNote } = body;

    // التحقق من نوع الإجابة
    if (!["FILE", "IMAGE", "VIDEO"].includes(submissionType)) {
      return new NextResponse("Invalid submission type", { status: 400 });
    }

    // التحقق من السماح بنوع الإجابة
    if (submissionType === "FILE" && !assignment.allowFileSubmission) {
      return new NextResponse("File submission not allowed", { status: 400 });
    }
    if (submissionType === "IMAGE" && !assignment.allowImageSubmission) {
      return new NextResponse("Image submission not allowed", { status: 400 });
    }
    if (submissionType === "VIDEO" && !assignment.allowVideoSubmission) {
      return new NextResponse("Video submission not allowed", { status: 400 });
    }

    // التحقق من وجود الملف حسب النوع
    if (submissionType === "FILE" && !fileUrl) {
      return new NextResponse("File URL is required", { status: 400 });
    }
    if (submissionType === "IMAGE" && !imageUrl) {
      return new NextResponse("Image URL is required", { status: 400 });
    }
    if (submissionType === "VIDEO" && !videoUrl) {
      return new NextResponse("Video URL is required", { status: 400 });
    }

    // إنشاء أو تحديث الإجابة
    const submissionData = {
      assignmentId: params.assignmentId,
      studentId: session.user.id,
      submissionType,
      fileUrl: submissionType === "FILE" ? fileUrl : null,
      imageUrl: submissionType === "IMAGE" ? imageUrl : null,
      videoUrl: submissionType === "VIDEO" ? videoUrl : null,
      studentNote,
      isSubmitted: true,
      submittedAt: new Date(),
    };

    let submission;
    if (existingSubmission) {
      submission = await prisma.assignmentSubmission.update({
        where: {
          id: existingSubmission.id,
        },
        data: submissionData,
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
    } else {
      submission = await prisma.assignmentSubmission.create({
        data: submissionData,
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
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error("[SUBMISSION_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
