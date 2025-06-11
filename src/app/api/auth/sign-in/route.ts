import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
      include: {
        contractorProfile: true, // تضمين بيانات ملف مُنسق
      },
    });

    if (!user) {
      return NextResponse.json({
        error: true,
        message: "المستخدم غير موجود يرجا انشاء حساب جديد!",
      });
    }

    const validPassword = await bcrypt.compare(body.password, user.password!);
    if (!validPassword) {
      return NextResponse.json({
        error: true,
        message: "كلمة المرور غير صحيحة!",
      });
    }

    // التحقق من حالة المُنسق إذا كان المستخدم مُنسق
    if (user.role === "CONSTRUCTOR") {
      if (!user.contractorProfile) {
        return NextResponse.json({
          error: true,
          message:
            "لم يتم العثور على ملف المُنسق الخاص بك. يرجى التواصل مع الإدارة.",
          contractorStatus: "NO_PROFILE",
        });
      }

      const contractorStatus = user.contractorProfile.status;
      if (contractorStatus === "PENDING") {
        return NextResponse.json({
          error: true,
          message:
            "حسابك كمُنسق لا زال تحت المراجعة. يرجى المحاولة مرة أخرى لاحقاً.",
          contractorStatus: "PENDING",
        });
      }

      if (contractorStatus === "REJECTED") {
        return NextResponse.json({
          error: true,
          message:
            "تم رفض طلب التسجيل كمُنسق. يرجى مراجعة بياناتك وإعادة التقديم أو التواصل مع الإدارة.",
          contractorStatus: "REJECTED",
        });
      }

      if (contractorStatus === "SUSPENDED") {
        return NextResponse.json({
          error: true,
          message:
            "تم تعليق حسابك كمُنسق مؤقتاً. يرجى التواصل مع الإدارة لمزيد من التفاصيل.",
          contractorStatus: "SUSPENDED",
        });
      }

      // إذا كان المُنسق مقبول (APPROVED)، يمكنه تسجيل الدخول
      if (contractorStatus !== "APPROVED") {
        return NextResponse.json({
          error: true,
          message: "حالة الحساب غير صالحة. يرجى التواصل مع الإدارة.",
          contractorStatus: contractorStatus,
        });
      }
    }

    return NextResponse.json({
      error: false,
      message: "تم تسجيل الدخول بنجاح",
      user,
    });
  } catch (error) {
    console.log("SIGN IN POST ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
