import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string; courseId: string } }
) {
  try {
    const { userId, courseId } = params;

    const chaptersData = await prisma.chapter.findMany({
      where: { courseId: courseId },
      orderBy: {
        position: "asc", // Sort by position in ascending order
      },
      // include: {
      //   Lesson: {
      //     orderBy: {
      //       position: "asc",
      //     },
      //     include: {
      //       FileUserData: {
      //         where: {
      //           userId: userId,
      //         },
      //       },
      //       VideoUserData: {
      //         where: {
      //           userId: userId,
      //         },
      //       },
      //       TestUserData: {
      //         where: {
      //           userId: userId,
      //         },
      //       },
      //     },
      //   },
      // },
    });

    return NextResponse.json(chaptersData);
  } catch (error) {
    console.log("admin_user_courses_data route error", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
