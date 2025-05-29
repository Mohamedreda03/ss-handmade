import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "غير مصرح لك بالوصول" },
        { status: 401 }
      );
    }

    const { newPassword } = await req.json();

    if (!newPassword) {
      return NextResponse.json(
        { message: "كلمة المرور الجديدة مطلوبة" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "كلمة المرور يجب أن تكون أطول من 6 أحرف" },
        { status: 400 }
      );
    }

    // البحث عن المستخدم للتحقق من نوع الحساب
    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        accounts: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "المستخدم غير موجود" },
        { status: 404 }
      );
    }

    // تشفير كلمة المرور الجديدة
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // تحديث كلمة المرور في قاعدة البيانات
    await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    const message = user.password
      ? "تم تحديث كلمة المرور بنجاح"
      : "تم إنشاء كلمة المرور بنجاح";

    return NextResponse.json({ message }, { status: 200 });
  } catch (error) {
    console.error("خطأ في تحديث كلمة المرور:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء تحديث كلمة المرور" },
      { status: 500 }
    );
  }
}
