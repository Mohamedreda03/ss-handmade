"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function isUserSub(lessonId: string, courseId: string) {
  const session = await auth();
  const isUserAuth = session ? true : false;
  const isUserAdmin = session?.user.role === "ADMIN";

  const isLessonFree = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      isFree: true,
    },
  });

  if (isLessonFree) {
    return { isOwned: true, isUserAuth, isUserAdmin };
  } else {
    const subscription = await prisma.subscription.findFirst({
      where: {
        courseId: courseId,
        userId: session?.user.id,
      },
    });

    const isOwned = subscription ? true : false;

    return { isOwned, isUserAuth, isUserAdmin };
  }
}
