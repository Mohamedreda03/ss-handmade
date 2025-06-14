import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
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
      // إذا لم يكن هناك session، إرجاع مصفوفة فارغة من الاشتراكات
      session?.user?.id 
        ? prisma.subscription.findMany({
            where: {
              userId: session.user.id,
            },
          })
        : Promise.resolve([]),
    ]);

    return NextResponse.json({ courses, subscriptions });
  } catch (error) {
    console.log(error);
    return new NextResponse("internal server error", { status: 500 });
  }
}
