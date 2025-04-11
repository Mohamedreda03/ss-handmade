import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { generatePasswordResetToken } from "@/utils/password-reset-token";
import { sendPasswordResetEmail } from "@/utils/mail";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const isUserValid = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!isUserValid) {
      return NextResponse.json({
        error: true,
        message: "البريد الالكتروني غير موجود",
      });
    }

    const passwordResetToken = await generatePasswordResetToken(email);

    await sendPasswordResetEmail(email, passwordResetToken.token);

    return NextResponse.json({
      error: false,
      message: "تم ارسال ايمال التحقق",
    });
  } catch (error) {
    console.log("NEW PASSWORD PATCH ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
