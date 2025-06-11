import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { uploadFileToSupabase } from "@/utils/uploadToSupabase";

export async function POST(
  req: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { assignmentId } = params;

    // جلب المهمة مع بيانات الدرس والكورس
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        lesson: {
          include: {
            chapter: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });
    if (!assignment) {
      return NextResponse.json({ error: "المهمة غير موجودة" }, { status: 404 });
    }

    if (!assignment.lesson) {
      return NextResponse.json(
        { error: "المهمة غير مرتبطة بدرس" },
        { status: 400 }
      );
    }

    // التحقق من اشتراك الطالب في الكورس
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        courseId: assignment.lesson.chapter.course.id,
      },
    });

    if (!subscription && session.user.role !== "ADMIN") {
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
    }
    const formData = await req.formData();

    // جمع الإجابات من FormData
    const fileAnswer = formData.get("fileAnswer") as File | null;
    const imageAnswer = formData.get("imageAnswer") as File | null;
    const videoAnswer = formData.get("videoAnswer") as File | null;
    const studentNote = formData.get("studentNote")?.toString() || null;

    // تحديد نوع الإجابة ورفع الملفات
    let submissionType: "FILE" | "IMAGE" | "VIDEO";
    let fileUrl = null;
    let imageUrl = null;
    let videoUrl = null;

    if (fileAnswer && fileAnswer.size > 0) {
      submissionType = "FILE";
      fileUrl = await uploadFileToSupabase(fileAnswer);
    } else if (imageAnswer && imageAnswer.size > 0) {
      submissionType = "IMAGE";
      imageUrl = await uploadFileToSupabase(imageAnswer);
    } else if (videoAnswer && videoAnswer.size > 0) {
      submissionType = "VIDEO";
      videoUrl = await uploadFileToSupabase(videoAnswer);
    } else {
      return NextResponse.json(
        { error: "يجب تقديم إجابة (ملف أو صورة أو فيديو)" },
        { status: 400 }
      );
    } // إنشاء الإجابة
    const submission = await prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        studentId: session.user.id,
        submissionType,
        fileUrl,
        imageUrl,
        videoUrl,
        studentNote,
        isSubmitted: true,
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
            maxGrade: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "تم إرسال الإجابة بنجاح",
      submission,
    });
  } catch (error) {
    console.error("[ASSIGNMENT_SUBMIT]", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
