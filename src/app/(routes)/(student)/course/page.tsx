"use client";

import { useQuery } from "react-query";
import Loading from "@/components/Loading";
import CourseCard from "@/components/CourseCard";
import axios from "axios";

export const dynamic = "force-dynamic";
export default function CoursePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const data = await axios
        .get("/api/courses/courses_sub")
        .then((res) => res.data);
      return data;
    },
  });

  if (isLoading) return <Loading className="h-[600px]" />;

  return (
    <div className="px-5 py-10">
      <div className="flex items-center justify-center">
        <h2 className="text-5xl mb-7 border-b border-secondary">
          جميع الكورسات
        </h2>
      </div>
      {data?.courses?.length === 0 && (
        <div className="flex items-center justify-center h-[600px]">
          <p className="text-xl">لا توجد كورسات متاحة حاليا</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {data?.courses?.map((course: any) => {
          const isOwned = data?.subscriptions?.find(
            (subscription: any) => subscription.courseId === course.id
          );

          return (
            <CourseCard
              key={course?.id}
              course={course}
              isOwned={isOwned ? true : false}
              isUserAuth={true}
            />
          );
        })}
      </div>
    </div>
  );
}
