import { NextRequest, NextResponse } from "next/server";
import { uploadImageToSupabase } from "@/utils/uploadToSupabase";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    // التحقق من صلاحية المستخدم (اختياري)
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "يجب تسجيل الدخول لرفع الصور" },
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

    // التحقق من نوع الملف
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "يجب أن يكون الملف صورة" },
        { status: 400 }
      );
    }

    // التحقق من حجم الملف (5 ميجابايت كحد أقصى)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "يجب أن يكون حجم الملف أقل من 5 ميجابايت" },
        { status: 400 }
      );
    }

    // رفع الصورة إلى Supabase
    const imageUrl = await uploadImageToSupabase(file);

    return NextResponse.json({
      success: true,
      path: imageUrl,
    });
  } catch (error) {
    console.error("[SUPABASE_UPLOAD_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ أثناء رفع الصورة",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
