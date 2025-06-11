import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET - جلب مهام الكورس
export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const chapterId = searchParams.get("chapterId");
    const lessonId = searchParams.get("lessonId");

    let whereClause: any = {
      courseId: params.courseId,
      isPublished: true,
    };

    // فلترة حسب الفصل أو الدرس إذا تم تحديدها
    if (chapterId) whereClause.chapterId = chapterId;
    if (lessonId) whereClause.lessonId = lessonId;

    // للطلاب: عرض المهام المنشورة فقط
    // للمعلمين والأدمن: عرض مهامهم أو جميع المهام
    if (session.user.role === "CONSTRUCTOR") {
      whereClause.creatorId = session.user.id;
      delete whereClause.isPublished; // المعلم يرى جميع مهامه
    } else if (session.user.role === "ADMIN") {
      delete whereClause.isPublished; // الأدمن يرى جميع المهام
    }

    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        chapter: {
          select: {
            id: true,
            title: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
          },
        },
        submissions: {
          where: {
            studentId: session.user.id,
          },
          include: {
            grade: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("[COURSE_ASSIGNMENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
