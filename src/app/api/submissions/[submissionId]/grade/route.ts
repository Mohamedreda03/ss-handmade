import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { submissionId: string } }
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

    const { submissionId } = params;
    const body = await request.json();
    const { grade, feedback } = body;

    // Validate input
    if (typeof grade !== "number" || grade < 0) {
      return NextResponse.json(
        { error: "Valid grade is required" },
        { status: 400 }
      );
    } // Check if submission exists
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          select: {
            maxGrade: true,
          },
        },
        grade: true, // Check if already graded
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Validate grade against max grade
    if (grade > submission.assignment.maxGrade) {
      return NextResponse.json(
        {
          error: `Grade cannot exceed maximum grade of ${submission.assignment.maxGrade}`,
        },
        { status: 400 }
      );
    }

    // Create or update grade
    const gradeData = {
      grade: grade,
      feedback: feedback || null,
      graderId: session.user.id,
    };

    let updatedGrade;
    if (submission.grade) {
      // Update existing grade
      updatedGrade = await prisma.assignmentGrade.update({
        where: { id: submission.grade.id },
        data: {
          ...gradeData,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new grade
      updatedGrade = await prisma.assignmentGrade.create({
        data: {
          ...gradeData,
          submissionId: submissionId,
        },
      });
    }

    // Get updated submission with all details
    const finalSubmission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
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
          include: {
            grader: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    return NextResponse.json({
      message: "Submission graded successfully",
      submission: finalSubmission,
    });
  } catch (error) {
    console.error("Error grading submission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
