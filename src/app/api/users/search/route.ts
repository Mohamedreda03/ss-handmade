import { prisma } from "@/lib/prisma";
import { CenterOrOnline } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const name = req.nextUrl.searchParams.get("name") as string;

    const page = Number(req.nextUrl.searchParams.get("page") || "1");
    const pageSize = Number(req.nextUrl.searchParams.get("pageSize") || "10");

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where: {
          name: {
            startsWith: name,
            mode: "insensitive",
          },
        },
        orderBy: {
          name: "asc",
        },
        skip,
        take,
      }),
      prisma.user.count({
        where: {
          name: {
            startsWith: name,
            mode: "insensitive",
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalUsers / pageSize);

    return NextResponse.json({
      data: users,
      meta: {
        totalUsers,
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
