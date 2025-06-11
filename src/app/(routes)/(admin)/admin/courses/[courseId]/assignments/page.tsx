"use client";

import CourseAssignmentsManagement from "@/components/assignments/CourseAssignmentsManagement";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { useQuery } from "react-query";

export default function CourseAssignmentsPage({
  params: { courseId },
}: {
  params: { courseId: string };
}) {
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const res = await axios.get(`/api/courses/${courseId}`);
      return res.data.data;
    },
  });

  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["course-assignments", courseId],
    queryFn: async () => {
      const res = await axios.get(`/api/courses/${courseId}/assignments`);
      return res.data;
    },
  });

  if (courseLoading || assignmentsLoading) {
    return <Loading className="h-[300px]" />;
  }

  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/courses/${courseId}`}
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-800"
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة لإعدادات الكورس</span>
          </Link>
        </div>

        <Link href={`/admin/courses/${courseId}/assignments/new`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            إنشاء مهمة جديدة
          </Button>
        </Link>
      </div>

      {/* Course Info */}
      <div className="bg-card rounded-lg p-6 mb-8">
        <h1 className="text-2xl font-bold mb-2">إدارة مهام الكورس</h1>
        <p className="text-gray-600 mb-4">
          الكورس:{" "}
          <span className="font-medium text-primary">{course?.title}</span>
        </p>
        <div className="text-sm text-gray-500">
          عدد المهام: {assignments?.length || 0}
        </div>
      </div>

      {/* Assignments Management */}
      <CourseAssignmentsManagement
        courseId={courseId}
        assignments={assignments || []}
      />
    </div>
  );
}
