import { getUser } from "@/actions/getUser";
import { isAuth } from "@/actions/isAuth";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const isUserAuth = await isAuth();
    const session = await auth();
    const user = await getUser();

    return NextResponse.json({
      isUserAuth,
      session,
      user,
    });
  } catch (error) {
    console.log("NEW PASSWORD PATCH ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
