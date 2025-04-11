"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const isAdmin = async () => {
  try {
    const session = await auth();
    if (!session) {
      return false;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (!user) {
      return false;
    }

    if (user.role !== "ADMIN") {
      return false;
    }

    return true;
  } catch (error) {
    console.log("is admin:", error);
  }
};
