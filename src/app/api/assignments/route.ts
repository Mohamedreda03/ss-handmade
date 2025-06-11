import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET - جلب المهام
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const chapterId = searchParams.get("chapterId");
    const lessonId = searchParams.get("lessonId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    let whereClause: any = {
      isPublished: true,
    };

    // فلترة حسب الكورس أو الفصل أو الدرس
    if (courseId) whereClause.courseId = courseId;
    if (chapterId) whereClause.chapterId = chapterId;
    if (lessonId) whereClause.lessonId = lessonId;

    // للطلاب: عرض المهام المنشورة فقط
    // للمعلمين والأدمن: عرض مهامهم
    if (session.user.role === "STUDENT") {
      // الطلاب يرون المهام المنشورة فقط
    } else if (session.user.role === "CONSTRUCTOR") {
      // المعلمون يرون مهامهم فقط
      whereClause.creatorId = session.user.id;
      delete whereClause.isPublished; // المعلم يرى جميع مهامه
    } else if (session.user.role === "ADMIN") {
      // الأدمن يرى جميع المهام
      delete whereClause.isPublished;
    }

    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
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
          submissions:
            session.user.role === "STUDENT"
              ? {
                  where: {
                    studentId: session.user.id,
                  },
                  include: {
                    grade: true,
                  },
                }
              : {
                  include: {
                    student: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                      },
                    },
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
        skip,
        take: limit,
      }),
      prisma.assignment.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json({
      assignments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[ASSIGNMENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST - إنشاء مهمة جديدة
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !["CONSTRUCTOR", "ADMIN"].includes(session.user.role)
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const body = await req.json();
    const {
      title,
      description,
      questionType,
      questionText,
      questionFileUrl,
      questionImageUrl,
      questionVideoUrl,
      courseId,
      chapterId,
      lessonId,
      maxGrade,
      allowFileSubmission,
      allowImageSubmission,
      allowVideoSubmission,
    } = body;

    // التحقق من البيانات المطلوبة
    if (!title || !questionType || !courseId) {
      return NextResponse.json(
        { error: "العنوان ونوع السؤال ومعرف الكورس مطلوبة" },
        { status: 400 }
      );
    }

    // التحقق من وجود محتوى السؤال حسب النوع
    if (questionType === "TEXT" && !questionText) {
      return NextResponse.json({ error: "نص السؤال مطلوب" }, { status: 400 });
    }
    if (questionType === "FILE" && !questionFileUrl) {
      return NextResponse.json({ error: "ملف السؤال مطلوب" }, { status: 400 });
    }
    if (questionType === "IMAGE" && !questionImageUrl) {
      return NextResponse.json(
        { error: "صورة السؤال مطلوبة" },
        { status: 400 }
      );
    }
    if (questionType === "VIDEO" && !questionVideoUrl) {
      return NextResponse.json(
        { error: "فيديو السؤال مطلوب" },
        { status: 400 }
      );
    }

    // للمعلمين: التحقق من ملكية الكورس
    if (session.user.role === "CONSTRUCTOR" && courseId) {
      const course = await prisma.course.findFirst({
        where: {
          id: courseId,
          userId: session.user.id,
        },
      });

      if (!course) {
        return new NextResponse("Unauthorized - Course not owned", {
          status: 401,
        });
      }
    }

    // إنشاء المهمة
    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        questionType,
        questionText: questionType === "TEXT" ? questionText : null,
        questionFileUrl: questionType === "FILE" ? questionFileUrl : null,
        questionImageUrl: questionType === "IMAGE" ? questionImageUrl : null,
        questionVideoUrl: questionType === "VIDEO" ? questionVideoUrl : null,
        courseId,
        chapterId,
        lessonId,
        creatorId: session.user.id,
        maxGrade: maxGrade || 100,
        allowFileSubmission: allowFileSubmission ?? true,
        allowImageSubmission: allowImageSubmission ?? true,
        allowVideoSubmission: allowVideoSubmission ?? true,
      },
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
      },
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("[ASSIGNMENTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
