import { Course } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import CourseCard from "./CourseCard";

interface FeaturedCoursesProps {
  courses: Course[];
}

const FeaturedCourses = ({ courses }: FeaturedCoursesProps) => {
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
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            // <div
            //   key={course.id}
            //   className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition border border-gray-100"
            // >
            //   <div className="relative h-56 w-full">
            //     {course.image && (
            //       <Image
            //         src={course.image}
            //         alt={course.title}
            //         fill
            //         className="object-cover"
            //       />
            //     )}
            //   </div>
            //   <div className="p-5">
            //     <h3 className="font-semibold text-xl mb-2">{course.title}</h3>
            //     <div className="flex items-center text-sm text-gray-500 mb-3">
            //       <span>{course.description}</span>
            //     </div>
            //     <div className="flex justify-between items-center mt-4">
            //       <p className="font-bold text-lg">
            //         EGP {course.price?.toFixed(2)}
            //       </p>
            //       <Link
            //         href={`/courses/${course.id}`}
            //         className="bg-primary text-white px-4 py-2 rounded text-sm hover:bg-primary/90 transition"
            //       >
            //         انضم الآن
            //       </Link>
            //     </div>
            //   </div>
            // </div>
            <CourseCard
              course={course}
              key={course.id}
              isOwned={false}
              isUserAuth
            />
          ))}
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
