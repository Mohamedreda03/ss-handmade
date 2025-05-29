"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const isAuth = async () => {
  try {
    const session = await auth();

    console.log("Session check:", {
      hasSession: !!session,
      userId: session?.user?.id,
      deviceId: session?.user?.device_id,
    });

    if (!session) {
      console.log("No session found");
      return false;
    }

    const deviceId = session?.user.device_id;

    const findSession = await prisma.session.findFirst({
      where: {
        userId: session?.user.id,
      },
    });

    console.log("Database session check:", {
      hasDbSession: !!findSession,
      dbDeviceId: findSession?.device_id,
      sessionDeviceId: deviceId,
      match: findSession?.device_id === deviceId,
    });

    if (!findSession) {
      console.log("No session found in database");
      return false;
    }

    if (findSession?.device_id !== deviceId) {
      console.log("Device ID mismatch");
      return false;
    }

    console.log("Auth check passed");
    return true;
  } catch (error) {
    console.log("is auth error:", error);
    return false;
  }
};
