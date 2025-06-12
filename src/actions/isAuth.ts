"use server";

import { auth } from "@/auth";

export const isAuth = async () => {
  try {
    const session = await auth();

    console.log("Session check:", {
      hasSession: !!session,
      userId: session?.user?.id,
    });

    if (!session) {
      console.log("No session found");
      return false;
    }

    // With NextAuth and PrismaAdapter, if session exists, user is authenticated
    console.log("Auth check passed");
    return true;
  } catch (error) {
    console.log("is auth error:", error);
    return false;
  }
};
