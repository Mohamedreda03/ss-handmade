"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import NewAssignmentForm from "@/components/assignments/NewAssignmentForm";

interface NewAssignmentPageProps {
  params: {
    courseId: string;
  };
}

export default function NewAssignmentPage({ params }: NewAssignmentPageProps) {
  return (
    <div className="min-h-screen bg-[#F4F4F0] p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href={`/admin/courses/${params.courseId}`}
            className="flex items-center gap-2 text-[#6F7354] hover:text-[#5a6145] transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة إلى إدارة الكورس</span>
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#6F7354]">
            إضافة مهمة جديدة
          </h1>
          <p className="text-[#3D402C]/70 mt-2">
            قم بإنشاء مهمة جديدة للطلاب في هذا الكورس
          </p>
        </div>

        {/* Form */}
        <NewAssignmentForm courseId={params.courseId} />
      </div>
    </div>
  );
}
