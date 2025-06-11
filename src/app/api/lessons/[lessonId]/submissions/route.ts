import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or constructor
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "CONSTRUCTOR")) {
      return NextResponse.json(
        { error: "Forbidden - Admin or Constructor access required" },
        { status: 403 }
      );
    }

    const { lessonId } = params;
    const { searchParams } = new URL(request.url);
    const gradedFilter = searchParams.get("graded");

    // Get assignment for this lesson
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        title: true,
        assignment: {
          select: {
            id: true,
            title: true,
            maxGrade: true,
          },
        },
      },
    });

    if (!lesson || !lesson.assignment) {
      return NextResponse.json(
        { error: "Lesson or assignment not found" },
        { status: 404 }
      );
    }

    // Build filter conditions
    const whereConditions: any = {
      assignmentId: lesson.assignment.id,
      isSubmitted: true,
    }; // Apply graded filter if specified
    let submissions;
    if (gradedFilter === "graded") {
      submissions = await prisma.assignmentSubmission.findMany({
        where: {
          ...whereConditions,
          grade: {
            isNot: null,
          },
        },
        select: {
          id: true,
          submissionType: true,
          fileUrl: true,
          imageUrl: true,
          videoUrl: true,
          studentNote: true,
          isSubmitted: true,
          submittedAt: true,
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignment: {
            select: {
              id: true,
              title: true,
              maxGrade: true,
              lesson: {
                select: {
                  id: true,
                  title: true,
                  Course: {
                    select: {
                      id: true,
                      title: true,
                    },
                  },
                },
              },
            },
          },
          grade: {
            select: {
              id: true,
              grade: true,
              feedback: true,
              gradedAt: true,
              grader: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          submittedAt: "desc",
        },
      });
    } else if (gradedFilter === "ungraded") {
      submissions = await prisma.assignmentSubmission.findMany({
        where: {
          ...whereConditions,
          grade: null,
        },
        select: {
          id: true,
          submissionType: true,
          fileUrl: true,
          imageUrl: true,
          videoUrl: true,
          studentNote: true,
          isSubmitted: true,
          submittedAt: true,
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignment: {
            select: {
              id: true,
              title: true,
              maxGrade: true,
              lesson: {
                select: {
                  id: true,
                  title: true,
                  Course: {
                    select: {
                      id: true,
                      title: true,
                    },
                  },
                },
              },
            },
          },
          grade: {
            select: {
              id: true,
              grade: true,
              feedback: true,
              gradedAt: true,
              grader: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          submittedAt: "desc",
        },
      });
    } else {
      submissions = await prisma.assignmentSubmission.findMany({
        where: whereConditions,
        select: {
          id: true,
          submissionType: true,
          fileUrl: true,
          imageUrl: true,
          videoUrl: true,
          studentNote: true,
          isSubmitted: true,
          submittedAt: true,
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignment: {
            select: {
              id: true,
              title: true,
              maxGrade: true,
              lesson: {
                select: {
                  id: true,
                  title: true,
                  Course: {
                    select: {
                      id: true,
                      title: true,
                    },
                  },
                },
              },
            },
          },
          grade: {
            select: {
              id: true,
              grade: true,
              feedback: true,
              gradedAt: true,
              grader: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          submittedAt: "desc",
        },
      });
    }

    return NextResponse.json(submissions);
  } catch (error) {
    console.error("Error fetching lesson submissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
