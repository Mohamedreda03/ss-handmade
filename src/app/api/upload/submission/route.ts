import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  uploadFileToSupabase,
  uploadImageToSupabase,
  uploadVideoToSupabase,
} from "@/utils/uploadToSupabase";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "STUDENT") {
      return NextResponse.json(
        { success: false, error: "غير مصرح لك برفع الملفات" },
        { status: 401 }
      );
    }

    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;
    const submissionType = data.get("submissionType") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "لم يتم تقديم أي ملف" },
        { status: 400 }
      );
    }

    if (!["FILE", "IMAGE", "VIDEO"].includes(submissionType)) {
      return NextResponse.json(
        { success: false, error: "نوع الملف غير صحيح" },
        { status: 400 }
      );
    }

    // التحقق من نوع الملف
    if (submissionType === "IMAGE" && !file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "يجب أن يكون الملف صورة" },
        { status: 400 }
      );
    }

    if (submissionType === "VIDEO" && !file.type.startsWith("video/")) {
      return NextResponse.json(
        { success: false, error: "يجب أن يكون الملف فيديو" },
        { status: 400 }
      );
    }

    // التحقق من حجم الملف
    let maxSize = 10 * 1024 * 1024; // 10 MB default
    if (submissionType === "VIDEO") {
      maxSize = 100 * 1024 * 1024; // 100 MB for videos
    } else if (submissionType === "IMAGE") {
      maxSize = 5 * 1024 * 1024; // 5 MB for images
    } else {
      maxSize = 20 * 1024 * 1024; // 20 MB for files
    }

    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return NextResponse.json(
        {
          success: false,
          error: `يجب أن يكون حجم الملف أقل من ${maxSizeMB} ميجابايت`,
        },
        { status: 400 }
      );
    }

    // رفع الملف حسب النوع
    let fileUrl: string;
    if (submissionType === "IMAGE") {
      fileUrl = await uploadImageToSupabase(file);
    } else if (submissionType === "VIDEO") {
      fileUrl = await uploadVideoToSupabase(file);
    } else {
      fileUrl = await uploadFileToSupabase(file);
    }

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      submissionType,
    });
  } catch (error) {
    console.error("[SUBMISSION_UPLOAD_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ أثناء رفع الملف",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
