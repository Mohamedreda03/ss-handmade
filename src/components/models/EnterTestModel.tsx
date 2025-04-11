"use client";

import { useRouter } from "next/navigation";
import { Alert } from "./Alert";
import axios from "axios";
import toast from "react-hot-toast";

export default function EnterTestModel({
  lessonId,
  lesson,
  userId,
  lessonUserData,
}: {
  lessonId: string;
  lesson: any;
  userId: string;
  lessonUserData: any;
}) {
  const router = useRouter();

  const onClink = async () => {
    // get the end time of the test
    let startTime = new Date();
    let endTime = new Date();
    endTime.setHours(startTime.getHours() + lesson?.hours!);
    endTime.setMinutes(startTime.getMinutes() + lesson?.minutes!);

    // create test user data
    await axios
      .post(`/api/lesson_user_data/test`, {
        lessonId: lessonId,
        userId: userId,
        testEndTime: endTime,
      })
      .then((res) => {
        router.push(`/course/test/${res.data.id}`);
      })
      .catch(() => {
        toast.error("هناك امتحان مفتوح بالفعل يجب عليك انهائه اولا!");
      });
  };

  if (lessonUserData?.length >= lesson?.number_of_entries_allowed) {
    return null;
  }

  if (lesson.exam_allowed_to && lesson.exam_allowed_to < new Date()) {
    return null;
  }

  if (lesson.exam_allowed_from && lesson.exam_allowed_from > new Date()) {
    return null;
  }

  const isUserShowAnswers = lessonUserData?.some(
    (test: any) => test.userShowAnswers
  );

  if (isUserShowAnswers && lesson.type === "sheet") {
    return null;
  }
  return (
    <>
      <Alert
        dialogTitle="الدخول الي الاختبار"
        dialogDescription="هل تريد الدخول الي الاختبار الآن ؟"
        dialogCancel="إلغاء"
        dialogAction="نعم"
        buttonTitle={
          lesson.type === "test" ? "الدخول الي الامتحان" : "الدخول الي الواجب"
        }
        action={onClink}
        buttonStyle="text-xl px-7 h-12 rounded-lg"
      />
    </>
  );
}
