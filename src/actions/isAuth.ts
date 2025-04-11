"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const isAuth = async () => {
  try {
    const session = await auth();
    const deviceId = session?.user.device_id;

    if (!session) {
      return false;
    }

    const findSession = await prisma.session.findFirst({
      where: {
        userId: session?.user.id,
      },
    });

    if (!findSession) {
      return false;
    }

    if (findSession?.device_id !== deviceId) {
      return false;
    }

    return true;
  } catch (error) {
    console.log("is auth:", error);
    return false;
  }
};
