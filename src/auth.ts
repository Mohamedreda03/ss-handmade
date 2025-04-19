import NextAuth from "next-auth";
import authConfig from "./lib/auth.config";

import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    updateAge: 5 * 60 * 60, // 5 hours
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  ...authConfig,
});
