import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    let body = await req.json();
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.testUserData.update({
      where: {
        id: body.id,
      },
      data: {
        ...body,
      },
    });

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.log("ERROR IN POST TEST:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
