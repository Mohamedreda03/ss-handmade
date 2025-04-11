import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    let list = await req.json();

    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    for (let item of list) {
      await prisma.lesson.update({
        where: {
          id: item.id,
        },
        data: {
          position: item.position,
        },
      });
    }

    return new NextResponse("Lessons reordered successfully", { status: 200 });
  } catch (error) {
    console.log("ERROR IN PATCH Lesson reorder:", error);
    return new NextResponse("Error in reorder lessons", { status: 500 });
  }
}
