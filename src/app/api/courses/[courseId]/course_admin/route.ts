import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params: { courseId } }: { params: { courseId: string } }
) {
  try {
    const session = await auth();

    if (!session || !["ADMIN", "CONSTRUCTOR"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // التحقق من صلاحية الوصول للكورس
    const courseAccess = await prisma.course.findUnique({
      where: { id: courseId },
      select: { userId: true },
    });

    if (!courseAccess) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // إذا كان constructor، يجب أن يكون مالك الكورس
    if (
      session.user.role === "CONSTRUCTOR" &&
      courseAccess.userId !== session.user.id
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const [course, items] = await Promise.all([
      prisma.course.findUnique({
        where: {
          id: courseId,
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
      prisma.chapter.findMany({
        where: {
          courseId,
        },
        orderBy: {
          position: "asc",
        },
      }),
    ]);

    const itemsCount = items.length;

    // إضافة معلومات المستخدم الحالي
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    });

    return NextResponse.json({ course, items, itemsCount, currentUser });
  } catch (error) {
    console.log("COURSES COURSEiD ROUTE ERROR", error);
  }
}
