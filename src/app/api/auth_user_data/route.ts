import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        accounts: {
          select: {
            provider: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.log("GET USERS [userId] DATA:", error);
    return new NextResponse("internal server error", { status: 500 });
  }
}
