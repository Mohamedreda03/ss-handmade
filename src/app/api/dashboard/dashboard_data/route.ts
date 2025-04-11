import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const [usersCount, adminsCount, coursesCount] = await Promise.all([
      prisma.user.count({
        where: {
          role: "STUDENT",
        },
      }),
      prisma.user.count({
        where: {
          role: "ADMIN",
        },
      }),
      prisma.course.count(),
    ]);

    return NextResponse.json(
      {
        usersCount,
        adminsCount,
        coursesCount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Get Dashboard Data:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
