import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const name = req.nextUrl.searchParams.get("name") as string;
    const phone = req.nextUrl.searchParams.get("phone") as string;

    const student_phone = phone.length > 0 ? phone : undefined;

    const page = Number(req.nextUrl.searchParams.get("page") || "1");
    const pageSize = Number(req.nextUrl.searchParams.get("pageSize") || "10");

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [subscriptions, totalSubscriptions] = await Promise.all([
      prisma.subscription.findMany({
        where: {
          courseId: params.courseId,
          user: {
            name: {
              startsWith: name,
              mode: "insensitive",
            },
          },
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        skip,
        take,
      }),
      prisma.subscription.count({
        where: {
          courseId: params.courseId,
          user: {
            name: {
              startsWith: name,
              mode: "insensitive",
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalSubscriptions / pageSize);

    return NextResponse.json({
      data: subscriptions,
      meta: {
        totalSubscriptions,
        totalPages,
        currentPage: page,
        pageSize,
      },
    });
  } catch (error) {
    console.log("GET SUB DATA:", error);
    return new NextResponse("internal server error", { status: 500 });
  }
}
