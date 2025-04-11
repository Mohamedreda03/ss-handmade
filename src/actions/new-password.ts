"use server";

import { prisma } from "@/lib/prisma";
import { getPasswordResetTokenByToken } from "@/utils/password-reset-token";
import bcrypt from "bcryptjs";

export const newPassword = async (password: string, token: string) => {
  if (!token) {
    return { error: true, message: "Missing token!" };
  }

  const existingToken = await getPasswordResetTokenByToken(token);

  if (!existingToken) {
    return { error: true, message: "Invalid token!" };
  }

  const hasExpired = new Date() > new Date(existingToken.expires);

  if (hasExpired) {
    return { error: true, message: "Token has expired!" };
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email: existingToken.email,
    },
  });

  if (!existingUser) {
    return { error: true, message: "الايمال غير موجود!" };
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

  return { error: false, message: "تم تحديث الباسورد" };
};
