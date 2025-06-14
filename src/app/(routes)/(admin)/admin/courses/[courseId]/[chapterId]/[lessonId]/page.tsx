"use client";

import AddFile from "@/components/admin_dashboard/AddFile";
import DeleteAlert from "@/components/admin_dashboard/DeleteAlert";
import EditLessonTitle from "@/components/admin_dashboard/EditLessonTitle";
import IsPublishedButton from "@/components/admin_dashboard/IsPublishedButton";
import IsLessonFree from "@/components/admin_dashboard/lessons/IsLessonFree";
import LessonAssignment from "@/components/admin_dashboard/lessons/LessonAssignment";
import UploadVideo from "@/components/admin_dashboard/UploadVideo";
import Loading from "@/components/Loading";
import axios from "axios";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useQuery } from "react-query";

export default function LessonPage({
  params,
}: {
  params: { courseId: string; chapterId: string; lessonId: string };
}) {
  const { courseId, chapterId, lessonId } = params;

  const { data, isLoading } = useQuery({
    queryKey: ["lessons", "chapters", courseId, chapterId, lessonId],
    queryFn: async () => {
      const data = await axios
        .get(`/api/admin_lesson/${lessonId}`)
        .then((res) => res.data);
      return data;
    },
  });
  if (isLoading) {
    return <Loading className="h-[70vh]" />;
  }
  // تحديد ما إذا كان يمكن حذف الدرس
  const canDeleteContent = () => {
    // المشرف (ADMIN) يمكنه حذف أي محتوى
    if (data?.currentUser?.role === "ADMIN") {
      return true;
    }

    // المدرس (CONSTRUCTOR) يمكنه حذف محتواه فقط
    if (data?.currentUser?.role === "CONSTRUCTOR") {
      return data?.lesson?.chapter?.course?.userId === data?.currentUser?.id;
    }

    return false;
  };

  return (
    <div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-10">
          <Link
            href={`/admin/courses/${courseId}/${chapterId}`}
            className="flex items-center gap-1.5"
          >
            <ArrowRight className="h-4 w-4 cursor-pointer" />
            <span>العودة لاعدادات الفصل</span>
          </Link>{" "}
          <div className="flex items-center">
            <span className="border-b border-secondary text-2xl ml-4">
              {data?.lesson?.title}
            </span>

            {canDeleteContent() && (
              <DeleteAlert
                buttonTitle="حذف الدرس"
                dialogTitle="هل انت متأكد من حذف هذا الدرس؟"
                dialogDescription="سيتم حذف جميع بيانات الدرس نهائيا"
                apiEndpoint={`/api/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`}
                toastMessage="تم حذف الدرس بنجاح"
                redirect={`/admin/courses/${courseId}/${chapterId}`}
                queryKey={"lessons"}
              />
            )}

            <IsPublishedButton
              queryKeys={"lessons"}
              disabled={!data?.isCompleted}
              isPublished={data?.lesson?.isPublished!}
              apiEndpoint={`/api/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`}
            />
          </div>
        </div>{" "}
        <div className="flex flex-col gap-5 md:flex-row">
          <div className="flex flex-col gap-5 md:flex-1">
            <EditLessonTitle
              title={data?.lesson?.title!}
              courseId={courseId}
              chapterId={chapterId}
              lessonId={lessonId}
            />
            <IsLessonFree
              lessonId={params.lessonId}
              courseId={courseId}
              chapterId={chapterId}
              lesson={data?.lesson}
            />
          </div>
          <div className="flex flex-col gap-5 md:flex-1">
            {" "}
            {data && data?.lesson?.type === "video" && (
              <UploadVideo
                courseId={courseId}
                chapterId={chapterId}
                lesson={data?.lesson}
                video={data?.lesson.videoUrl!}
                videoId={data?.lesson.videoId!}
              />
            )}
            {data && data?.lesson?.type === "file" && (
              <AddFile
                lessonId={lessonId}
                fileUrl={data?.lesson.fileUrl!}
                courseId={courseId}
                chapterId={chapterId}
              />
            )}
            {data && data?.lesson?.type === "assignment" && (
              <LessonAssignment
                courseId={courseId}
                chapterId={chapterId}
                lessonId={lessonId}
                lesson={data?.lesson}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
