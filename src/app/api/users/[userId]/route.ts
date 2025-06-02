import { getSession } from "@/actions/getSession";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    let body = await req.json();
    const session = await getSession();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (session?.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // إعداد البيانات المحدثة
    const updateData: any = {};

    // تحديث كلمة المرور فقط إذا تم إدخالها
    if (body.password && body.password.trim().length > 0) {
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    // تحديث الصلاحية
    if (body.role) {
      updateData.role = body.role;
    }

    // إزالة الحقول التي لا نريد تحديثها
    delete body.password;

    const user = await prisma.user.update({
      where: {
        id: params.userId as string,
      },
      data: updateData,
    });

    return NextResponse.json({
      data: user,
      success: true,
    });
  } catch (error) {
    console.log("UPDATE USER ERROR:", error);
    return new NextResponse("internal server error", { status: 500 });
  }
}
