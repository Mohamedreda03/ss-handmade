"use server";

import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/utils/mail";
import { generatePasswordResetToken } from "@/utils/password-reset-token";

export const reset = async (email: any) => {
  const isUserValid = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!isUserValid) {
    return {
      error: true,
      message: "البريد الالكتروني غير موجود",
    };
  }

  const passwordResetToken = await generatePasswordResetToken(email);

  await sendPasswordResetEmail(email, passwordResetToken.token);

  return {
    error: false,
    message: "تم ارسال ايمال التحقق",
  };
};
