"use client";

import CourseChapter from "@/components/CourseChapter";
import { Accordion } from "@/components/ui/accordion";
import { Course } from "@prisma/client";
import axios from "axios";
import { useQuery } from "react-query";

export default function CourseDataLessons({
  course,
  courseId,
  isLoading: isCourseLoading,
}: {
  course: Course;
  courseId: string;
  isLoading: boolean;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["chapter", "sub"],
    queryFn: async () => {
      return await axios
        .get(`/api/courses/${courseId}/course_chapter_data`)
        .then((res) => res.data);
    },
  });

  if (isLoading || isCourseLoading) return null;

  return (
    <div className="md:px-10 mt-10 w-full mx-auto">
      <div className="flex items-center justify-center mb-10 pt-7">
        <h2 className="text-4xl md:text-5xl font-semibold border-b-4 border-secondary">
          محتوي
          <span className="text-rose-500"> الكورس</span>
        </h2>
      </div>
      <Accordion type="single" collapsible className="space-y-5">
        {data &&
          data?.chapters?.map((chapter: any) => (
            <CourseChapter
              key={chapter?.id}
              chapter={chapter}
              courseId={course?.id!}
              isOwned={data?.isOwned!}
              isUserAuth={data?.isUserAuth!}
              isUserAdmin={data?.isUserAdmin}
            />
          ))}
      </Accordion>
    </div>
  );
}
