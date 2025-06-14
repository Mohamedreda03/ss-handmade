import { Course } from "@prisma/client";
import YearCourses from "./YearCourses";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export default async function FilterCorses() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: {
      id: session?.user?.id,
    },
  });

  let courses: Course[] = [];

  if (user?.role === "ADMIN") {
    courses = await prisma.course.findMany({
      include: {
        User: {
          select: {
            id: true,
            role: true,
          },
        },
      },
    });
  } else if (user?.role === "CONSTRUCTOR") {
    courses = await prisma.course.findMany({
      where: {
        userId: user.id,
      },
      include: {
        User: {
          select: {
            id: true,
            role: true,
          },
        },
      },
    });
  }

  return (
    <div>
      {courses.length === 0 && (
        <div className="flex items-center justify-center h-52">
          <p className="text-2xl">لا يوجد دورات</p>
        </div>
      )}
      <YearCourses courses={courses} currentUser={user} />
    </div>
  );
}
