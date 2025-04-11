"use server";

import { auth } from "@/auth";

import { prisma } from "@/lib/prisma";

export const getUser: any = async () => {
  try {
    const session = await auth();
    if (!session) {
      return "Unauthorized";
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });
    return user;
  } catch (error) {
    console.log("GET USERS DATA:", error);
    return "internal server error";
  }
};
