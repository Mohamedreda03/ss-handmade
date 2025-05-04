"use client";

import CourseDataLessons from "@/components/CourseDataLessons";
import StudentCourseHeader from "@/components/StudentCourseHeader";
import { Course } from "@prisma/client";
import axios from "axios";
import { useQuery } from "react-query";

export default function CourseStudentLayout({
  params,
  children,
}: {
  params: { courseId: string };
  children: React.ReactNode;
}) {
  const { data: course, isLoading } = useQuery({
    queryKey: ["sub", params.courseId],
    queryFn: async () => {
      const res = await axios.get(`/api/courses/${params.courseId}`);
      return res.data.data;
    },
  });

  return (
    <div className="px-5 py-6">
      <StudentCourseHeader course={course as Course} isLoading={isLoading} />

      {/* display lesson content */}
      {children}

      {/* course lessons and chapters */}
      <CourseDataLessons
        course={course as Course}
        courseId={params.courseId}
        isLoading={isLoading}
      />
    </div>
  );
}
