import { isAuth } from "@/actions/isAuth";
import { auth } from "@/auth";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const isUserAuth = await isAuth();
    const session = await auth();

    return NextResponse.json({ isUserAuth, session });
  } catch (error) {
    console.log("YSER AUTH GET ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
