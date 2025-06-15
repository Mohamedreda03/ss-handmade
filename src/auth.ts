import NextAuth from "next-auth";
import authConfig from "./lib/auth.config";

import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma), // مهم لحفظ بيانات المستخدمين!
  session: {
    strategy: "jwt", // JWT للجلسات فقط
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 5 * 60 * 60, // تحديث كل 5 ساعات
  },
  ...authConfig,
});
