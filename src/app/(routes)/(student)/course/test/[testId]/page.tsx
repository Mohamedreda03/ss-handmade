"use client";

import Loading from "@/components/Loading";
import Test from "@/components/student_dashboard/Test";
import TestTimer from "@/components/student_dashboard/TestTimer";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useQuery } from "react-query";

export default function TestPage({ params }: { params: { testId: string } }) {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["getTestData", params.testId],
    queryFn: async () => {
      const data = await axios
        .get(`/api/test_data/${params.testId}`)
        .then((res) => res.data);
      return data;
    },
  });

  if (isLoading) return <Loading className="h-[70vh]" />;

  if (data?.test?.isCompleted) {
    router.push(
      `/course/${data.lesson.chapter.courseId}/${data.test.lessonId}`
    );
    return;
  }

  if (data)
    return (
      <div className="px-5 py-10 max-w-screen-xl mx-auto min-h-[calc(100vh-80px)]">
        <div className="flex items-center justify-between mb-7">
          <TestTimer
            endTime={data?.test?.testEndTime!}
            testId={params.testId}
            courseId={data?.lesson?.chapter?.courseId!}
            lessonId={data?.test?.lessonId!}
            lesson={data?.lesson}
          />
          <div></div>
        </div>
        <Test
          chapterId={data?.lesson?.chapter?.id!}
          lessonId={data?.test?.lessonId!}
          courseId={data?.lesson?.chapter?.courseId!}
          testId={params.testId}
        />
      </div>
    );
}
