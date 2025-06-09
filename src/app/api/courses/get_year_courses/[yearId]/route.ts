import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params: { yearId } }: { params: { yearId: string } }
) {
  try {
    const session = await auth();
    const isUserAuth = session ? true : false;

    const [courses, subscriptions] = await Promise.all([
      prisma.course.findMany({
        where: {
          isPublished: true,
        },
        include: {
          User: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      prisma.subscription.findMany({
        where: {
          userId: session?.user.id,
        },
      }),
    ]);

    return NextResponse.json({ courses, subscriptions, isUserAuth });
  } catch (error) {
    console.log("GET YEAR COURSES ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
