import { isAdmin } from "@/actions/isAdmin";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET(
  req: NextRequest,
  { params: { userId } }: { params: { userId: string } }
) {
  try {
    const body = await req.json();
    const session = await auth();
    const isUserAdmin = await isAdmin();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!isUserAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({ user, isUserAdmin });
  } catch (error) {
    console.log("COURSES GET ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
