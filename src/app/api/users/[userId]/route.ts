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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth();

    // التحقق من أن المستخدم مشرف
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { userId } = params;

    // التحقق من وجود المستخدم
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!userToDelete) {
      return new NextResponse("User not found", { status: 404 });
    }

    // منع المشرف من حذف نفسه
    if (userToDelete.id === session.user.id) {
      return new NextResponse("Cannot delete your own account", {
        status: 400,
      });
    }

    // حذف المستخدم مع جميع البيانات المرتبطة
    await prisma.user.delete({
      where: { id: userId },
    });

    console.log(`User deleted successfully:`, {
      deletedUserId: userToDelete.id,
      deletedUserName: userToDelete.name,
      deletedUserRole: userToDelete.role,
      deletedBy: session.user.id,
    });

    return NextResponse.json({
      message: "User deleted successfully",
      deletedUser: {
        id: userToDelete.id,
        name: userToDelete.name,
        email: userToDelete.email,
        role: userToDelete.role,
      },
    });
  } catch (error) {
    console.error("ERROR IN DELETE USER:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
