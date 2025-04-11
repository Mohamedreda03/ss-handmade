import { isAdmin } from "@/actions/isAdmin";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ActionTypes } from "@/utils/actionsTypes";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    let body = await req.json();
    const { userId, courseId, price } = body;
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.history.create({
      data: {
        userId,
        courseId,

        price,
      },
    });

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.log("ERROR IN POST TEST:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await isAdmin();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const name = req.nextUrl.searchParams.get("name") as string;

    const page = Number(req.nextUrl.searchParams.get("page") || "1");
    const pageSize = Number(req.nextUrl.searchParams.get("pageSize") || "10");

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [history, totalHistory] = await Promise.all([
      prisma.history.findMany({
        where: {
          user: {
            name: {
              contains: name,
              mode: "insensitive",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take,
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.history.count({
        where: {
          user: {
            name: {
              contains: name,
              mode: "insensitive",
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalHistory / pageSize);

    return NextResponse.json({
      data: history,
      meta: {
        totalHistory,
        totalPages,
        currentPage: page,
        pageSize,
      },
    });
  } catch (error) {
    console.log("GET USERS DATA:", error);
    return new NextResponse("internal server error", { status: 500 });
  }
}
