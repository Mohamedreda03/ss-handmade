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
      await prisma.chapter.update({
        where: {
          id: item.id,
        },
        data: {
          position: item.position,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("ERROR IN PUT CHAPTERID:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
