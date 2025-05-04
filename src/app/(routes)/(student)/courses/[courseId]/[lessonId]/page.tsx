"use client";

import Loading from "@/components/Loading";
import EnterTestModel from "@/components/models/EnterTestModel";
import OpenFile from "@/components/OpenFile";
import { SecureVideoPlayer } from "@/components/SecureVideoPlayer";
import TestsTable from "@/components/TestsTable";
import VimeoNewPlayer from "@/components/VimeoNewPlayer";
import axios from "axios";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Book, FlaskConical, Video } from "lucide-react";
import { useQuery } from "react-query";

export default function LessonStudentPage({
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

  // حساب عدد المرات المتبقه في الامتحان
  const remainingEntries =
    (data?.lesson?.number_of_entries_allowed! || 0) -
    data?.lessonUserData?.length;

  const isSheetAllowedToOpen =
    data?.lesson?.type === "sheet" &&
    new Date(data?.lesson?.exam_allowed_from) < new Date() &&
    (!data?.lesson?.exam_allowed_to ||
      new Date(data?.lesson?.exam_allowed_to) > new Date());

  const isTestAllowedToOpen =
    data?.lesson?.type === "test" &&
    new Date(data?.lesson?.exam_allowed_to) > new Date() &&
    new Date(data?.lesson?.exam_allowed_from) < new Date();

  if (!data?.isUserAuth) {
    return (
      <div className="max-w-screen-md mx-auto py-11">
        <div className=" w-fit border border-red-500 text-red-500 bg-red-400/25 mx-auto">
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
              {/* ex */}
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
                            {/* <YouTubePlayer videoId={data?.lesson.videoId!} /> */}
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
        {(data?.lesson?.type === "test" || data?.lesson?.type === "sheet") && (
          <div>
            <div>
              <div className="flex items-center justify-center mb-10">
                <div className="flex items-center justify-center gap-3 bg-yellow-500 text-white py-2 pl-6 pr-2 rounded-full">
                  <span className="bg-white rounded-full h-10 md:h-12 w-10 md:w-12 flex items-center justify-center">
                    <FlaskConical className="text-yellow-400 bg-white md:h-8 md:w-8 h-6 w-6" />
                  </span>
                  <h1 className="text-2xl md:text-4xl font-semibold">
                    {data?.lesson?.title}
                  </h1>
                </div>
              </div>
              {/* {data?.lessonUserData?.length > 0 && ( */}
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 max-w-screen-md gap-5 mx-auto">
                  <div className="flex flex-col items-center justify-center mb-5">
                    <p className="text-lg">
                      عدد المرات المسوح بها دخول هذا{" "}
                      {data && data?.lesson?.type === "test"
                        ? "الامتحان"
                        : "الواجب"}
                    </p>
                    <p className="bg-blue-500 py-1.5 px-3 mt-3 rounded-lg text-xl">
                      {data && data?.lesson?.number_of_entries_allowed}
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center mb-5">
                    <p className="text-lg">
                      عدد مرات دخول{" "}
                      {data && data?.lesson?.type === "test"
                        ? "الامتحان"
                        : "الواجب"}{" "}
                      المتبقية
                    </p>
                    <p className="bg-blue-500 py-1.5 px-3 mt-3 rounded-lg text-xl">
                      {remainingEntries}
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center mb-10">
                    <p className="text-lg">
                      مدة{" "}
                      {data?.lesson?.type === "test" ? "الامتحان" : "الواجب"}
                    </p>

                    <h3 className="text-xl font-semibold mt-3 border border-blue-400 py-1.5 px-2 rounded-lg">
                      <span>{data?.lesson?.hours} ساعة</span>{" "}
                      {data?.lesson?.minutes && (
                        <>
                          و <span>{data?.lesson?.minutes} دقيقة</span>
                        </>
                      )}
                    </h3>
                  </div>
                  <div className="flex flex-col items-center justify-center mb-10">
                    <p className="text-lg">
                      الفترة المسموح بها دخول{" "}
                      {data?.lesson?.type === "test" ? "الامتحان" : "الواجب"}
                    </p>

                    <h3 className="text-xl font-semibold mt-3 border border-blue-400 py-2.5 px-2.5 rounded-lg">
                      <div className="mb-2">
                        <span className="ml-2">من</span>{" "}
                        {format(
                          new Date(data?.lesson?.exam_allowed_from!),
                          "hh:mm a, eeee, d/ MM/ yyyy",
                          {
                            locale: ar,
                          }
                        )}{" "}
                      </div>
                      {data?.lesson?.exam_allowed_to ? (
                        <>
                          <span className="mx-2">الي</span>{" "}
                          {format(
                            new Date(data?.lesson?.exam_allowed_to!),
                            "hh:mm a, eeee, d/ MM/ yyyy",
                            {
                              locale: ar,
                            }
                          )}
                        </>
                      ) : (
                        <div>
                          <span className="mx-2">الي</span>{" "}
                          <span>( لم يتم تحديد موعد انتهاء )</span>
                        </div>
                      )}
                    </h3>
                  </div>
                </div>
                {data && data?.lessonUserData?.length > 0 && (
                  <TestsTable
                    lessonUserData={data?.lessonUserData as any}
                    questionLength={data?.questionLength}
                    lesson={data?.lesson}
                    courseId={params.courseId}
                  />
                )}
              </div>
              {/* )} */}
              {(isSheetAllowedToOpen || isTestAllowedToOpen) && (
                <div className="w-full max-w-screen-lg mx-auto flex items-center justify-center">
                  {data && (
                    <EnterTestModel
                      lessonId={params.lessonId}
                      lesson={data?.lesson}
                      userId={data?.session?.user.id!}
                      lessonUserData={data?.lessonUserData as any}
                    />
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
        <div className=" w-fit border border-red-500 text-red-500 bg-red-400/25 mx-auto">
          ليس لديك صلاحية للوصول الى هذه الصفحة
        </div>
      </div>
    );
  }
}
