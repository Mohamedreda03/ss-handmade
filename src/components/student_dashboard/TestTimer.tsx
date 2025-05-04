import React, { useState, useEffect, useCallback } from "react";
import {
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
} from "date-fns";
import { useMutation } from "react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Lesson } from "@prisma/client";

export default function TestTimer({
  endTime,
  testId,
  courseId,
  lessonId,
  lesson,
}: {
  endTime: Date;
  testId: string;
  courseId: string;
  lessonId: string;
  lesson: Lesson;
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeUp, setTimeUp] = useState(false);

  const router = useRouter();

  // const endTestDate = async () => {
  //   if (
  //     lesson.exam_allowed_to &&
  //     new Date() >= new Date(lesson.exam_allowed_to)
  //   ) {
  //     await endTest();
  //     toast.success("لقد انتهت فترة الامتحان");
  //   }
  // };

  const { mutateAsync: endTest } = useMutation({
    mutationFn: async () => {
      return await axios.patch(
        `/api/lesson_user_data/test/${testId}/test_result`
      );
    },
    onSuccess: () => {
      toast.success("تم ارسال الاجابات بنجاح");
      router.push(`/courses/${courseId}/${lessonId}`);
    },
  });

  const handleEndTest = useCallback(async () => {
    await endTest();
    // router.
  }, [endTest]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      // endTestDate();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  function formatNumber(number: number) {
    return number < 10 ? "0" + number : number;
  }

  // حساب الفرق بالساعات
  const hoursDifference = Math.max(
    0,
    differenceInHours(new Date(endTime), new Date(currentTime))
  );
  const formattedHoursDifference = formatNumber(hoursDifference);

  // حساب الفرق بالدقائق
  const totalMinutesDifference = Math.max(
    0,
    differenceInMinutes(new Date(endTime), new Date(currentTime))
  );
  const remainingMinutes = formatNumber(totalMinutesDifference % 60);

  // حساب الفرق بالثواني
  const totalSecondsDifference = Math.max(
    0,
    differenceInSeconds(new Date(endTime), new Date(currentTime))
  );
  const remainingSeconds = formatNumber(totalSecondsDifference % 60);

  useEffect(() => {
    if (
      hoursDifference === 0 &&
      totalMinutesDifference === 0 &&
      totalSecondsDifference === 0
    ) {
      setTimeUp(true);
      // تنفيذ الحدث المطلوب عندما يصل الوقت إلى صفر
      handleEndTest();
    }
  }, [
    hoursDifference,
    totalMinutesDifference,
    totalSecondsDifference,
    handleEndTest,
  ]);

  return (
    <div className="border px-6 pb-2 pt-1 rounded-lg text-xl">
      {remainingSeconds} <span className="mx-0.5 text-3xl">:</span>{" "}
      {remainingMinutes} <span className="mx-0.5 text-3xl">:</span>{" "}
      {formattedHoursDifference}
      {timeUp && <p className="text-red-400">أنتهي الوقت</p>}
    </div>
  );
}
