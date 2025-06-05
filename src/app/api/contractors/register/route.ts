import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if user already exists
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

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Create user with contractor profile
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        role: "CONSTRUCTOR",
        contractorProfile: {
          create: {
            bio: body.contractorProfile.bio,
            specialization: body.contractorProfile.specialization,
            experience: body.contractorProfile.experience,
            linkedinUrl: body.contractorProfile.linkedinUrl,
            portfolioUrl: body.contractorProfile.portfolioUrl,
            cvUrl: body.contractorProfile.cvUrl,
            status: "PENDING",
          },
        },
      },
      include: {
        contractorProfile: true,
      },
    });

    return NextResponse.json({
      error: false,
      message: "تم تقديم طلب التسجيل بنجاح. سيتم مراجعة طلبك خلال 48 ساعة",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        contractorProfile: user.contractorProfile,
      },
    });
  } catch (error) {
    console.log("CONTRACTOR REGISTRATION ERROR", error);
    return NextResponse.json(
      {
        error: true,
        message: "حدث خطأ في التسجيل",
      },
      { status: 500 }
    );
  }
}
