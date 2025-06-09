import Link from "next/link";
import CourseCard from "./CourseCard";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getFeaturedCourses } from "@/actions/courses";

const FeaturedCourses = async () => {
  const session = await auth();
  const isUserAuth = !!session;

  const [courses, subscriptions] = await Promise.all([
    getFeaturedCourses(6),
    session
      ? prisma.subscription.findMany({
          where: { userId: session.user.id },
          select: { courseId: true },
        })
      : Promise.resolve([]),
  ]);
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">تعلم الحرف اليدوية</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            انضم إلى دوراتنا المميزة لتعلم الحرف اليدوية من محترفين ذوي خبرة.
            سواء كنت مبتدئًا أو محترفًا، لدينا ما يناسب جميع المستويات.
          </p>
        </div>
        {courses.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">لا توجد دورات متاحة حاليًا.</p>
          </div>
        )}{" "}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => {
            const isOwned = subscriptions.some(
              (sub) => sub.courseId === course.id
            );

            return (
              <CourseCard
                course={course}
                key={course.id}
                isOwned={isOwned}
                isUserAuth={isUserAuth}
              />
            );
          })}
        </div>
        <div className="text-center mt-12">
          <Link
            href="/courses"
            className="inline-block bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition font-medium"
          >
            عرض جميع الدورات
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
