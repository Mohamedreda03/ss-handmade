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
  const { data, isLoading, error } = useQuery({
    queryKey: ["chapter", "course_data", courseId],
    queryFn: async () => {
      return await axios
        .get(`/api/courses/${courseId}/course_chapter_data`)
        .then((res) => res.data);
    },
    enabled: !!courseId,
    retry: 3,
    refetchOnWindowFocus: false,
  });
  if (isLoading || isCourseLoading) return null;

  // معالجة الأخطاء
  if (error) {
    return (
      <div className="md:px-10 mt-10 w-full mx-auto bg-gradient-to-b from-background to-accent/5 py-8 rounded-lg">
        <div className="flex items-center justify-center mb-10 pt-7">
          <h2 className="text-4xl md:text-5xl font-semibold border-b-4 border-primary text-foreground relative">
            محتوي
            <span className="text-primary"> الكورس</span>
            <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-full"></div>
          </h2>
        </div>
        <div className="text-center py-10">
          <p className="text-lg text-destructive">
            حدث خطأ في تحميل محتوى الكورس. يرجى المحاولة مرة أخرى.
          </p>
        </div>
      </div>
    );
  }

  // التحقق من وجود البيانات
  if (!data || !data.chapters || data.chapters.length === 0) {
    return (
      <div className="md:px-10 mt-10 w-full mx-auto bg-gradient-to-b from-background to-accent/5 py-8 rounded-lg">
        <div className="flex items-center justify-center mb-10 pt-7">
          <h2 className="text-4xl md:text-5xl font-semibold border-b-4 border-primary text-foreground relative">
            محتوي
            <span className="text-primary"> الكورس</span>
            <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-full"></div>
          </h2>
        </div>
        <div className="text-center py-10">
          <p className="text-lg text-muted-foreground">
            لا توجد فصول متاحة في هذا الكورس حالياً
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="md:px-10 mt-10 w-full mx-auto bg-gradient-to-b from-background to-accent/5 py-8 rounded-lg">
      <div className="flex items-center justify-center mb-10 pt-7">
        <h2 className="text-4xl md:text-5xl font-semibold border-b-4 border-primary text-foreground relative">
          محتوي
          <span className="text-primary"> الكورس</span>
          <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-full"></div>
        </h2>
      </div>{" "}
      {/* عرض الفصول والدروس - المهام الآن جزء من الدروس داخل الفصول */}
      <Accordion type="single" collapsible className="space-y-6 px-2">
        {data?.chapters?.map((chapter: any) => (
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
