import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadFileToSupabase } from "@/utils/uploadToSupabase";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !["CONSTRUCTOR", "ADMIN"].includes(session.user.role)
    ) {
      return NextResponse.json(
        { success: false, error: "غير مصرح لك برفع الملفات" },
        { status: 401 }
      );
    }

    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "لم يتم تقديم أي ملف" },
        { status: 400 }
      );
    }

    // التحقق من حجم الملف (50 ميجابايت كحد أقصى)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "يجب أن يكون حجم الملف أقل من 50 ميجابايت" },
        { status: 400 }
      );
    }

    // رفع الملف إلى Supabase
    const fileUrl = await uploadFileToSupabase(file);

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
  } catch (error) {
    console.error("[ASSIGNMENT_UPLOAD_ERROR]", error);
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
