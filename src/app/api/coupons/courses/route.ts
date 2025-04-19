import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dashRoles } from "@/lib/dashRoles";
import { auth } from "@/auth";

// Mark this route as dynamic to avoid static generation issues
export const dynamic = "force-dynamic";

interface Course {
  id: string;
  title: string;
  price: number;
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    const isAllowed = dashRoles.includes(session?.user.role!);

    if (!session || !isAllowed) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    let courses: any[] = [];

    if (session.user.role === "ADMIN") {
      courses = await prisma.course.findMany({
        select: {
          id: true,
          title: true,
          price: true,
        },
      });
    } else if (session.user.role === "CONSTRUCTOR") {
      courses = await prisma.course.findMany({
        where: {
          userId: session.user.id,
        },
        select: {
          id: true,
          title: true,
          price: true,
        },
      });
    }

    return NextResponse.json(courses);
  } catch (error) {
    console.log("Get all courses copons data error:", error);
    return new NextResponse("Internal server error", {
      status: 500,
    });
  }
}
