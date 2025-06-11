import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SubmissionType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول" },
        { status: 401 }
      );
    }

    const { assignmentId } = params;

    // البحث عن إجابة الطالب
    const submission = await prisma.assignmentSubmission.findFirst({
      where: {
        assignmentId,
        studentId: session.user.id,
      },
      include: {
        assignment: {
          select: {
            title: true,
            maxGrade: true,
          },
        },
        grade: true,
      },
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Error fetching student submission:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول" },
        { status: 401 }
      );
    }

    const { assignmentId } = params;
    const formData = await req.formData();

    // التحقق من وجود المهمة
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: true,
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "المهمة غير موجودة" }, { status: 404 });
    } // التحقق من اشتراك الطالب في الكورس
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        courseId: assignment.courseId || "",
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "أنت غير مشترك في هذا الكورس" },
        { status: 403 }
      );
    }

    // التحقق من وجود إجابة سابقة
    const existingSubmission = await prisma.assignmentSubmission.findFirst({
      where: {
        assignmentId,
        studentId: session.user.id,
      },
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: "تم إرسال إجابة لهذه المهمة مسبقاً" },
        { status: 400 }
      );
    } // جمع الإجابات من FormData
    const submissionType = formData
      .get("submissionType")
      ?.toString() as SubmissionType;
    const fileUrl = formData.get("fileUrl")?.toString();
    const imageUrl = formData.get("imageUrl")?.toString();
    const videoUrl = formData.get("videoUrl")?.toString();
    const studentNote = formData.get("studentNote")?.toString();

    if (
      !submissionType ||
      !["FILE", "IMAGE", "VIDEO"].includes(submissionType)
    ) {
      return NextResponse.json(
        { error: "نوع الإجابة غير صحيح" },
        { status: 400 }
      );
    }

    // التحقق من وجود المحتوى المطلوب
    let contentUrl = "";
    if (submissionType === "FILE" && fileUrl) {
      contentUrl = fileUrl;
    } else if (submissionType === "IMAGE" && imageUrl) {
      contentUrl = imageUrl;
    } else if (submissionType === "VIDEO" && videoUrl) {
      contentUrl = videoUrl;
    }

    if (!contentUrl) {
      return NextResponse.json(
        { error: "يجب تحديد محتوى الإجابة" },
        { status: 400 }
      );
    } // إنشاء الإجابة
    const submission = await prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        studentId: session.user.id,
        submissionType,
        fileUrl: submissionType === "FILE" ? contentUrl : null,
        imageUrl: submissionType === "IMAGE" ? contentUrl : null,
        videoUrl: submissionType === "VIDEO" ? contentUrl : null,
        studentNote,
        isSubmitted: true,
        submittedAt: new Date(),
      },
      include: {
        assignment: {
          select: {
            title: true,
            maxGrade: true,
          },
        },
      },
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Error submitting assignment:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
