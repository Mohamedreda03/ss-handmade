import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const existingUserEmail = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (existingUserEmail) {
      return NextResponse.json({
        error: true,
        message: "البريد الإلكتروني مسجل بالفعل!",
      });
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    body.re_password = undefined;

    await prisma.user.create({
      data: {
        ...body,
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      error: false,
      message: "تم أنشاء الحساب بنجاح",
    });
  } catch (error) {
    console.log("NEW PASSWORD PATCH ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
