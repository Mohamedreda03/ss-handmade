"use client";

import DeleteAlert from "@/components/admin_dashboard/DeleteAlert";
import EditChapterTitle from "@/components/admin_dashboard/EditChapterTitle";
import EditLessons from "@/components/admin_dashboard/EditLessons";
import IsPublishedButton from "@/components/admin_dashboard/IsPublishedButton";
import Loading from "@/components/Loading";
import axios from "axios";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useQuery } from "react-query";

export default function ChapterPage({
  params: { courseId, chapterId },
}: {
  params: { courseId: string; chapterId: string };
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["chapters", "lessons", courseId, chapterId],
    queryFn: async () => {
      const res = await axios.get(
        `/api/courses/${courseId}/chapters/${chapterId}`
      );
      return res.data;
    },
  });

  if (isLoading) {
    return <Loading className="h-[70vh]" />;
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-10">
        <Link
          href={`/admin/courses/${courseId}`}
          className="flex items-center gap-1.5"
        >
          <ArrowRight className="h-4 w-4 cursor-pointer" />
          <span>العودة لاعدادات الكورس</span>
        </Link>
        <div className="flex items-center">
          <span className="border-b border-secondary text-2xl ml-4">
            {data?.chapter?.title}
          </span>

          <DeleteAlert
            buttonTitle="حذف الفصل"
            dialogTitle="هل انت متأكد من حذف هذا الفصل؟"
            dialogDescription="سيتم حذف جميع بيانات الفصل نهائيا"
            apiEndpoint={`/api/courses/${courseId}/chapters/${chapterId}`}
            toastMessage="تم حذف الفصل بنجاح"
            redirect={`/admin/courses/${courseId}`}
            queryKey={"chapters"}
          />

          <IsPublishedButton
            disabled={data?.filledFields !== data?.totalFields}
            isPublished={data?.chapter?.isPublished!}
            apiEndpoint={`/api/courses/${courseId}/chapters/${chapterId}`}
            queryKeys={"chapters"}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-5">
        <div className="md:flex-1 flex flex-col gap-5">
          <EditChapterTitle
            title={data?.chapter?.title!}
            courseId={courseId}
            chapterId={chapterId}
          />
        </div>
        <div className="md:flex-1 flex flex-col gap-5">
          <EditLessons
            items={data?.lessons as any[]}
            courseId={courseId}
            chapterId={chapterId}
          />
        </div>
      </div>
    </div>
  );
}
