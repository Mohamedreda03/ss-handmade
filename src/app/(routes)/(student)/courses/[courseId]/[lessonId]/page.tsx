"use client";

import Loading from "@/components/Loading";
import OpenFile from "@/components/OpenFile";
import { SecureVideoPlayer } from "@/components/SecureVideoPlayer";
import VimeoNewPlayer from "@/components/VimeoNewPlayer";
import axios from "axios";
import { Book, Video } from "lucide-react";
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
        .get(
          `/api/courses/${params.courseId}/chapters/${params.chapterId}/lessons/${params.lessonId}/student_lesson`
        )
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
        <div className="w-fit border border-red-500 text-red-500 bg-red-400/25 mx-auto p-4">
          ليس لديك صلاحية للوصول الى هذه الصفحة
        </div>
      </div>
    );
  }

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
              <div className="flex items-center justify-center gap-3 bg-blue-500 text-white py-2 pl-6 pr-2 rounded-full">
                <span className="bg-white rounded-full h-12 w-12 flex items-center justify-center">
                  <Book size={30} className="text-blue-400 bg-white" />
                </span>
                <h1 className="text-4xl font-semibold">{data?.lesson.title}</h1>
              </div>
            </div>
            <div className="border max-w-screen-md rounded-lg shadow-md mx-auto flex flex-col items-center px-5 py-8">
              <p className="text-xl mb-3">أضغط هنا لتنزيل وفتح الملف</p>
              <OpenFile
                lessonId={params.lessonId}
                fileUrl={data?.lesson?.fileUrl!}
              />
            </div>
          </div>
        )}
        {data?.lesson?.type === "video" && (
          <div>
            <div className="flex items-center justify-center mb-10">
              <div className="flex items-center justify-center gap-3 bg-yellow-500 text-white py-2 pl-6 pr-2 rounded-full">
                <span className="bg-white rounded-full h-10 md:h-12 w-10 md:w-12 flex items-center justify-center">
                  <Video className="text-yellow-400 bg-white md:h-8 md:w-8 h-6 w-6" />
                </span>
                <h1 className="text-2xl md:text-4xl font-semibold">
                  {data?.lesson?.title}
                </h1>
              </div>
            </div>
            <div className="w-full max-w-screen-lg mx-auto">
              {data && data?.lesson && (
                <div className="flex items-center justify-center">
                  {data && data?.lesson && (
                    <div className="flex items-center justify-center">
                      {data?.lesson?.video_type === "vimeo" &&
                        data?.lesson?.videoUrl && (
                          <div className="w-[340px] h-[230px] sm:w-[500px] sm:h-[300px] md:w-[750px] md:h-[480px] lg:w-[980px] lg:h-[600px]">
                            <VimeoNewPlayer
                              videoUrl={data?.lesson?.videoUrl!}
                              onEnded={onEndedVideo}
                            />
                          </div>
                        )}
                      {data &&
                        data?.lesson?.video_type === "youtube" &&
                        data?.lesson?.videoId && (
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
        <div className="w-fit border border-red-500 text-red-500 bg-red-400/25 mx-auto p-4">
          ليس لديك صلاحية للوصول الى هذه الصفحة
        </div>
      </div>
    );
  }
}
