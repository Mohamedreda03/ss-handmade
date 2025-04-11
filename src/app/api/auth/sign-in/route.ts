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
    });

    if (!user) {
      return NextResponse.json({
        error: true,
        message: "المستخدم غير موجود يرجا انشاء حساب حديد!",
      });
    }

    const validPassword = await bcrypt.compare(body.password, user.password!);
    if (!validPassword) {
      return NextResponse.json({
        error: true,
        message: "كلمة المرور غير صحيحة!",
      });
    }

    return NextResponse.json({
      error: false,
      message: "تم تسجيل الدخول بنجاح",
      user,
    });
  } catch (error) {
    console.log("NEW PASSWORD PATCH ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
