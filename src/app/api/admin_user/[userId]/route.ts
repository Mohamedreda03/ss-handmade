import { isAdmin } from "@/actions/isAdmin";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params: { userId } }: { params: { userId: string } }
) {
  try {
    const isUserAdmin = await isAdmin();

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    return NextResponse.json({ user, isUserAdmin });
  } catch (error) {
    console.log("COURSES GET ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
