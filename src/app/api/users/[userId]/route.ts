import { getSession } from "@/actions/getSession";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    let body = await req.json();
    const session = await getSession();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (session?.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    body.password =
      body.password.length > 0
        ? await bcrypt.hash(body.password, 10)
        : undefined;

    body.owned_money = body.owned_money.toString();

    const user = await prisma.user.update({
      where: {
        id: params.userId as string,
      },
      data: {
        ...body,
      },
    });

    return NextResponse.json({
      data: user,
      success: true,
    });
  } catch (error) {
    console.log("GET USERS [userId] DATA:", error);
    return new NextResponse("internal server error", { status: 500 });
  }
}
