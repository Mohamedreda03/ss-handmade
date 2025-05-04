"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

interface CoursesGridSectionProps {
  courses?: any[];
}

const CoursesGridSection = ({ courses = [] }: CoursesGridSectionProps) => {
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
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition duration-300 group"
            >
              <div className="relative h-[220px] w-full overflow-hidden">
                <Image
                  src={course.image}
                  alt={course.title}
                  width={400}
                  height={220}
                  className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
                />
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-right text-[#333] mb-2 line-clamp-1   ">
                  {course.title}
                </h3>

                <div className="flex justify-between items-center mb-4">
                  <div className="text-[#ff9800] font-bold text-lg rtl:text-left">
                    {course.price} جنيه
                  </div>
                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    <Star
                      size={16}
                      className="fill-yellow-400 text-yellow-400"
                    />
                    <span>{course.rating}</span>
                  </div>
                </div>

                <div className="flex justify-center mt-4">
                  <Link
                    href={`/courses/${course.id}`}
                    className="bg-[#6c7f60] text-white py-2 px-6 rounded-md w-full text-center font-semibold hover:bg-[#5a6b50] transition duration-300"
                  >
                    اشترك الآن
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoursesGridSection;
