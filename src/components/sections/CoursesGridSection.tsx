import { getFeaturedCourses } from "@/actions/courses";
import CourseCard from "@/components/CourseCard";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const CoursesGridSection = async () => {
  const session = await auth();
  const isUserAuth = !!session;

  const [courses, subscriptions] = await Promise.all([
    getFeaturedCourses(3),
    session
      ? prisma.subscription.findMany({
          where: { userId: session.user.id },
          select: { courseId: true },
        })
      : Promise.resolve([]),
  ]);

  return (
    <section className="py-16 bg-[#f9f9f7]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 relative">
          <h2 className="text-4xl font-bold text-[#333] mb-3">
            جاهز قصتك تبقى القصة الجاية ؟
          </h2>
          <p className="text-[#666] max-w-3xl mx-auto text-lg">
            اكتشفي مجموعة متنوعة من الكورسات المتخصصة لتعلم الحرف اليدوية من
            أفضل المدربين
          </p>
        </div>{" "}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => {
            const isOwned = subscriptions.some(
              (sub) => sub.courseId === course.id
            );

            return (
              <CourseCard
                key={course.id}
                course={course}
                isOwned={isOwned}
                isUserAuth={isUserAuth}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CoursesGridSection;
