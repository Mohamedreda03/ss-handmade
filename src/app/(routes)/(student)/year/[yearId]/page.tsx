"use client";

import CourseCard from "@/components/CourseCard";
import Loading from "@/components/Loading";
import { Years_Banks } from "@/utils/years_data";
import axios from "axios";
import { useQuery } from "react-query";

// export const dynamic = "force-dynamic";
export default function YearCourses({
  params,
}: {
  params: { yearId: string };
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["sub", "courses", params.yearId],
    queryFn: async () => {
      const data = await axios
        .get(`/api/courses/get_year_courses/${params.yearId}`)
        .then((res) => res.data);
      return data;
    },
  });

  if (isLoading) {
    return <Loading className="h-[70vh]" />;
  }

  const currentYear = Years_Banks.find((year) => year.year === params.yearId);

  const isAvailableCourses = data?.courses?.find(
    (course: any) => course.isPublished
  );

  return (
    <div className="p-5 mt-8">
      <div className="flex flex-col gap-3 items-center justify-center mb-10">
        <h2 className="border-b-4 border-secondary text-4xl md:text-5xl text-center">
          {currentYear?.name}
        </h2>
        <p className="max-w-screen-sm text-center text-muted-foreground">
          {currentYear?.description}
        </p>
      </div>
      {!isAvailableCourses && (
        <div className="flex items-center justify-center h-[70vh]">
          <h2 className="md:text-3xl text-2xl text-center">
            لم يتم اضافة الكورسات بعد
          </h2>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isAvailableCourses &&
          data?.courses?.map((course: any) => {
            const isOwned = data?.subscriptions?.find(
              (subscription: any) => subscription.courseId === course.id
            );

            return (
              <CourseCard
                key={course?.id}
                course={course}
                isOwned={isOwned ? true : false}
                isUserAuth={data?.isUserAuth!}
              />
            );
          })}
      </div>
    </div>
  );
}
