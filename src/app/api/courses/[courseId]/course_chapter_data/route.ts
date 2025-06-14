import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params: { courseId } }: { params: { courseId: string } }
) {
  try {
    const session = await auth();
    const isUserAuth = session ? true : false;
    const isUserAdmin = session?.user.role === "ADMIN";
    const [chapters, subscription, assignments] = await Promise.all([
      prisma.chapter.findMany({
        where: {
          courseId: courseId,
          isPublished: true,
        },
        orderBy: {
          position: "asc",
        },
        include: {
          Lesson: {
            where: isUserAdmin
              ? {} // المديرين يرون جميع الدروس
              : { isPublished: true }, // المستخدمين العاديين يرون المنشور فقط
            orderBy: {
              position: "asc",
            },
            select: {
              isFree: true,
              chapterId: true,
              id: true,
              title: true,
              type: true,
              position: true,
              isPublished: true,

              FileUserData: {
                where: {
                  userId: session?.user.id,
                },
                select: {
                  isCompleted: true,
                },
              },
              VideoUserData: {
                where: {
                  userId: session?.user.id,
                },
                select: {
                  isCompleted: true,
                },
              },
              assignment: {
                include: {
                  _count: {
                    select: {
                      submissions: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),

      prisma.subscription.findFirst({
        where: {
          courseId: courseId,
          userId: session?.user.id,
        },
      }),

      // جلب المهام لتضمينها كدروس
      prisma.assignment.findMany({
        where: {
          courseId: courseId,
          isPublished: true,
        },
        include: {
          lesson: {
            select: {
              id: true,
              chapterId: true,
              position: true,
            },
          },
          submissions: {
            where: {
              studentId: session?.user.id,
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
      }),
    ]);

    const isOwned = subscription ? true : false;

    // دمج المهام مع الدروس في الفصول المناسبة
    const chaptersWithAssignments = chapters.map((chapter) => {
      // العثور على المهام التي تنتمي لهذا الفصل
      const chapterAssignments = assignments.filter(
        (assignment) => assignment.lesson?.chapterId === chapter.id
      );

      // تحويل المهام إلى صيغة دروس
      const assignmentLessons = chapterAssignments.map((assignment) => ({
        id: assignment.lesson?.id || assignment.id,
        title: assignment.title,
        type: "assignment" as const,
        position: assignment.lesson?.position || 999, // موضع عالي إذا لم يكن محدد
        isPublished: assignment.isPublished,
        isFree: false, // المهام ليست مجانية عادة
        chapterId: chapter.id,
        FileUserData: [],
        VideoUserData: [],
        _count: {
          AssignmentSubmissions: assignment._count.submissions,
        },
        // بيانات إضافية للمهام
        assignmentData: {
          id: assignment.id,
          description: assignment.description,
          maxGrade: assignment.maxGrade,
          questionText: assignment.questionText,
          questionType: assignment.questionType,
          submissions: assignment.submissions,
        },
      })); // دمج الدروس العادية مع دروس المهام وترتيبها
      const allLessons = [...chapter.Lesson, ...assignmentLessons].sort(
        (a, b) => (a.position || 0) - (b.position || 0)
      );

      return {
        ...chapter,
        Lesson: allLessons,
      };
    });

    return NextResponse.json({
      chapters: chaptersWithAssignments,
      isOwned,
      isUserAuth,
      isUserAdmin,
    });
  } catch (error) {
    console.log("ERROR IN GET COURSE CHAPTER DATA:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
