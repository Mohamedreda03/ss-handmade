import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول" },
        { status: 401 }
      );
    }

    const user = session.user;
    if (user.role !== "ADMIN" && user.role !== "CONSTRUCTOR") {
      return NextResponse.json(
        { error: "ليس لديك صلاحية للوصول" },
        { status: 403 }
      );
    }

    const { lessonId } = params;

    // البحث عن المهمة المرتبطة بالدرس مباشرة
    const assignment = await prisma.assignment.findFirst({
      where: {
        lessonId: lessonId,
      },
      include: {
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Error fetching lesson assignment:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
