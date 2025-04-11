import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getPasswordResetTokenByToken } from "@/utils/password-reset-token";

export async function PATCH(req: NextRequest) {
  try {
    const { password, token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: true, message: "Missing token!" });
    }

    const existingToken = await getPasswordResetTokenByToken(token);

    if (!existingToken) {
      return NextResponse.json({ error: true, message: "Invalid token!" });
    }

    const hasExpired = new Date() > new Date(existingToken.expires);

    if (hasExpired) {
      return NextResponse.json({ error: true, message: "Token has expired!" });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: existingToken.email,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: true, message: "الايمال غير موجود!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    await prisma.passwordResetToken.delete({
      where: {
        id: existingToken.id,
      },
    });

    return NextResponse.json({ error: false, message: "تم تحديث الباسورد" });
  } catch (error) {
    console.log("NEW PASSWORD PATCH ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
