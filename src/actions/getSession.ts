"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getSession() {
  try {
    const session = await auth();

    const userSession = await prisma.session.findFirst({
      where: {
        userId: session?.user.id,
      },
      include: {
        user: {
          select: {
            role: true,
          },
        },
      },
    });

    if (!userSession) {
      return null;
    }

    return { role: userSession.user.role, user: userSession.user };
  } catch (error) {
    console.log("Error in getAllCourses: ", error);
  }
}
