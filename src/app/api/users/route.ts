import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    return new NextResponse("Hello, World!");
  } catch (error) {
    console.log("GET USERS DATA:", error);
    return new NextResponse("internal server error", { status: 500 });
  }
}
