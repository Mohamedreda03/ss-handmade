"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const signup = async (data: any) => {
  const user = await prisma.user.findFirst({
    where: {
      email: data.email,
    },
  });

  if (user) {
    return { error: true, message: "المستخدم مسجل بالفعل!" };
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  data.re_password = undefined;

  await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
  });

  return { error: false, message: "تم أنشاء الحساب بنجاح" };
};
