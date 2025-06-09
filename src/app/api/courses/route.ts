import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["ADMIN", "CONSTRUCTOR"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name } = await req.json();

    const course = await prisma.course.create({
      data: {
        title: name,
        userId: session.user.id, // ربط الكورس بمنشئه
      },
    });

    return NextResponse.json({ data: course }, { status: 201 });
  } catch (error) {
    console.log("COURSES POST ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["ADMIN", "CONSTRUCTOR"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    let courses;

    if (session.user.role === "ADMIN") {
      // Admin يرى جميع الكورسات
      courses = await prisma.course.findMany({
        include: {
          User: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } else if (session.user.role === "CONSTRUCTOR") {
      // Constructor يرى كورساته فقط
      courses = await prisma.course.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          User: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }

    return NextResponse.json({ data: courses });
  } catch (error) {
    console.log("COURSES GET ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
