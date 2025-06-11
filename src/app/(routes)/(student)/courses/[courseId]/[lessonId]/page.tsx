"use client";

import Loading from "@/components/Loading";
import OpenFile from "@/components/OpenFile";
import { SecureVideoPlayer } from "@/components/SecureVideoPlayer";
import StudentAssignmentView from "@/components/assignments/StudentAssignmentView";
import axios from "axios";
import { Book, Video, FileText } from "lucide-react";
import { useQuery } from "react-query";

export default function LessonPage({
  params,
}: {
  params: { courseId: string; lessonId: string; chapterId: string };
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["lesson", params.lessonId],
    queryFn: async () => {
      const data = await axios
        .get(`/api/student-lessons/${params.lessonId}`)
        .then((res) => res.data);
      return data;
    },
  });

  const onEndedVideo = async () => {
    await axios.patch(
      `/api/student_progress_data/${params.lessonId}/video_user_data`
    );
  };

  if (isLoading) return <Loading className="h-[70vh]" />;
  if (!data?.isUserAuth) {
    return (
      <div className="max-w-screen-md mx-auto py-11">
        <div className="w-fit border border-destructive text-destructive bg-destructive/10 mx-auto p-4 rounded-lg">
          ليس لديك صلاحية للوصول الى هذه الصفحة
        </div>
      </div>
    );
  }

  console.log("Lesson Data:", data);

  if (
    data?.isOwned ||
    data?.session?.user.role === "ADMIN" ||
    data?.lesson?.isFree
  ) {
    return (
      <div className="max-w-screen-xl mx-auto py-10">
        {data && data?.lesson?.type === "file" && (
          <div>
            <div className="flex items-center justify-center mb-10">
              <div className="flex items-center justify-center gap-3 bg-primary text-primary-foreground py-2 pl-6 pr-2 rounded-full">
                <span className="bg-primary-foreground rounded-full h-12 w-12 flex items-center justify-center">
                  <Book size={30} className="text-primary" />
                </span>
                <h1 className="text-4xl font-semibold">{data?.lesson.title}</h1>
              </div>
            </div>
            <div className="border border-primary/30 max-w-screen-md rounded-lg shadow-md mx-auto flex flex-col items-center px-5 py-8 bg-card">
              <p className="text-xl mb-3">أضغط هنا لتنزيل وفتح الملف</p>
              <OpenFile
                lessonId={params.lessonId}
                fileUrl={data?.lesson?.fileUrl!}
              />
            </div>
          </div>
        )}
        {data && data?.lesson?.type === "assignment" && (
          <div>
            <div className="flex items-center justify-center mb-10">
              <div className="flex items-center justify-center gap-3 bg-primary text-primary-foreground py-2 pl-6 pr-2 rounded-full">
                <span className="bg-primary-foreground rounded-full h-12 w-12 flex items-center justify-center">
                  <FileText size={30} className="text-primary" />
                </span>
                <h1 className="text-4xl font-semibold">{data?.lesson.title}</h1>
              </div>
            </div>
            <StudentAssignmentView
              lessonId={params.lessonId}
              courseId={params.courseId}
            />
          </div>
        )}
        {data?.lesson?.type === "video" && (
          <div>
            <div className="flex items-center justify-center mb-10">
              <div className="flex items-center justify-center gap-3 bg-secondary text-secondary-foreground py-2 pl-6 pr-2 rounded-full">
                <span className="bg-secondary-foreground rounded-full h-10 md:h-12 w-10 md:w-12 flex items-center justify-center">
                  <Video className="text-secondary md:h-8 md:w-8 h-6 w-6" />
                </span>
                <h1 className="text-2xl md:text-4xl font-semibold">
                  {data?.lesson?.title}
                </h1>
              </div>
            </div>
            <div className="w-full max-w-screen-lg mx-auto">
              {" "}
              {data && data?.lesson && (
                <div className="flex items-center justify-center">
                  {data && data?.lesson && (
                    <div className="flex items-center justify-center">
                      {data?.lesson?.videoId && (
                        <div className="w-[340px] h-[230px] sm:w-[500px] sm:h-[300px] md:w-[750px] md:h-[480px]">
                          <SecureVideoPlayer
                            videoId={data?.lesson?.videoId!}
                            onVideoEnd={onEndedVideo}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  } else {
    return (
      <div className="max-w-screen-md mx-auto py-11">
        <div className="w-fit border border-destructive text-destructive bg-destructive/10 mx-auto p-4 rounded-lg">
          ليس لديك صلاحية للوصول الى هذه الصفحة
        </div>
      </div>
    );
  }
}
