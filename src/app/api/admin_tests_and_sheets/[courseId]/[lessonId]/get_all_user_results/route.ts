import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  {
    params: { courseId, lessonId },
  }: { params: { courseId: string; lessonId: string } }
) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const name = req.nextUrl.searchParams.get("name") as string;
    const email = req.nextUrl.searchParams.get("email") as string;

    const user_email = email.length > 0 ? email : undefined;

    const order = req.nextUrl.searchParams.get("order") as "asc" | "desc";
    const page = Number(req.nextUrl.searchParams.get("page") || "1");
    const pageSize = Number(req.nextUrl.searchParams.get("pageSize") || "10");

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [testUserData, totalTestUserData] = await Promise.all([
      prisma.testUserData.findMany({
        where: {
          lessonId: lessonId,
          isCompleted: true,
          user: {
            name: {
              contains: name,
            },
            email: {
              contains: user_email,
            },
          },
        },
        orderBy: {
          testResult: order,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        skip,
        take,
      }),
      prisma.testUserData.count({
        where: {
          lessonId: lessonId,
          isCompleted: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalTestUserData / pageSize);

    return NextResponse.json({
      data: testUserData,
      meta: {
        totalTestUserData,
        totalPages,
        currentPage: page,
        pageSize,
      },
    });
  } catch (error) {
    console.log("COURSES GET ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
