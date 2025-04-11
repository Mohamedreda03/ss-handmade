"use client";

import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import axios from "axios";
import { formatDate } from "date-fns";
import { ar } from "date-fns/locale";
import { BadgeCheck, BadgeX } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "react-query";

export default function Page({
  params: { testId },
}: {
  params: { testId: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  if (!searchParams.has("lessonId")) {
    router.push(`/`);
  }

  const { data, isLoading } = useQuery({
    queryKey: ["getTestData", testId],
    queryFn: async () => {
      const data = await axios
        .get(
          `/api/test_data/${testId}/get_test_answers_data?lessonId=${searchParams.get(
            "lessonId"
          )}`
        )
        .then((res) => res.data);
      return data;
    },
  });

  const questionLength = data?.questionsLength!;

  const isSheet = data?.lesson.type === "sheet";
  const isTest = data?.lesson.type === "test";

  const isShowedSheetAnswers =
    (isSheet && data?.testUserData?.userShowAnswers) ||
    new Date(data?.lesson.exam_allowed_to) < new Date() ||
    (isSheet &&
      data?.lesson.number_of_entries_allowed === data?.numOfCompleted);

  const isShowedTestAnswers =
    isTest && new Date(data?.lesson.exam_allowed_to) < new Date();

  const isStudentShowedAnswers = isShowedSheetAnswers || isShowedTestAnswers;

  const isShowSheetAnswers1 = isSheet && data?.testUserData?.userShowAnswers;

  const isShowSheetAnswers2 =
    isSheet && new Date(data?.lesson.exam_allowed_to) < new Date();

  const isShowSheetAnswers3 =
    isSheet && data?.lesson.number_of_entries_allowed === data?.numOfCompleted;

  const isAllowedToShowSheetAnswers =
    isShowSheetAnswers1 || isShowSheetAnswers2 || isShowSheetAnswers3;

  //   if (!data?.testUserData?.isCompleted) {
  //     router.push(`/`);
  //   }

  const { mutateAsync, isLoading: isUpdateShowAnswers } = useMutation({
    mutationFn: async () => {
      await axios.patch(`/api/test_data/${testId}/show_test_answers`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries("getTestData");
    },
  });

  const handleShowAnswers = async () => {
    await mutateAsync();
  };

  if (isLoading) return <Loading className="h-[70vh]" />;

  const testAnswers = data?.testUserData?.testAnswers;

  // const testQuestions = data?.lesson?.testQuestions;

  return (
    <div className="max-w-screen-md mx-auto p-5 min-h-[70vh]">
      <div className="flex flex-col items-center gap-8 mb-10 mt-10">
        <h3 className="text-4xl">درجاتك</h3>
        <h3 className="text-2xl">
          <span
            className={cn(
              "text-2xl font-semibold",
              data?.testUserData?.testResult! > questionLength / 2
                ? "bg-green-500 px-4 py-1.5 rounded-lg text-white"
                : "bg-red-500 px-4 py-1.5 rounded-lg text-white"
            )}
          >
            {data?.testUserData?.testResult}
          </span>{" "}
          <span className="mx-4">من</span>
          <span className="text-2xl font-semibold bg-blue-500 text-white px-4 py-1.5 rounded-lg">
            {questionLength}
          </span>
        </h3>
        <div className="flex items-center justify-center gap-8">
          <Button
            className="text-lg"
            onClick={() =>
              router.push(
                `/course/${searchParams.get("courseId")}/${searchParams.get(
                  "lessonId"
                )}`
              )
            }
          >
            العودة للدرس
          </Button>
          {!isTest && !isStudentShowedAnswers && (
            <>
              <Button
                className="text-lg"
                onClick={handleShowAnswers}
                disabled={isUpdateShowAnswers}
              >
                عرض النتيجة
              </Button>
            </>
          )}
        </div>
      </div>
      {!isStudentShowedAnswers ? (
        <div className="flex flex-col gap-3 items-center justify-center">
          {data?.lesson?.exam_allowed_to && (
            <>
              <div className="border-b border-red-500 pb-2">
                {isTest && "سيتم عرض الاجابات بعد انتهاء مدة"}{" "}
                {isTest ? "الاختبار" : "الواجب"}
              </div>
              <div>
                {data?.lesson?.exam_allowed_to ? (
                  <>
                    {formatDate(
                      new Date(data?.lesson?.exam_allowed_to!),
                      "hh:mm a, eeee, d/ MM/ yyyy",
                      {
                        locale: ar,
                      }
                    )}
                  </>
                ) : (
                  ""
                )}
              </div>
            </>
          )}
          {!isTest && !isAllowedToShowSheetAnswers && (
            <div className="border-b border-red-500 pb-2 text-center">
              يمكنك عرض الاجابات الخاصة بك عن طريق زر عرض النتيجه ولاكن سيتم
              منعك من اكمال عدد المرات المتبقية لك
            </div>
          )}
        </div>
      ) : (
        <>
          <div>
            <div className="flex items-center justify-center">
              <h1 className="text-3xl font-semibold mb-5 border-b border-red-500">
                الاجابات الخاصة بك
              </h1>
            </div>
            <div className="flex flex-col gap-5">
              {data?.lesson?.testQuestions?.map(
                (question: any, index: number) => {
                  const studentAnswer = testAnswers?.find(
                    (a: any) => a.testQuestionId === question.id
                  )?.answer;

                  return (
                    <div key={question.id} className="border p-5 rounded-lg">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex flex-col gap-4">
                          {question.image_url && (
                            <Image
                              src={question.image_url}
                              width={300}
                              height={300}
                              alt="image"
                              className="rounded-lg"
                            />
                          )}
                          <div className="text-xl font-semibold flex items-start gap-2">
                            <span>{index + 1}</span> -
                            {question.question && (
                              <div
                                className="inline mr-2 html-content"
                                dangerouslySetInnerHTML={{
                                  __html: question.question || "",
                                }}
                              />
                            )}
                          </div>
                        </div>
                        {!studentAnswer && (
                          <span className="text-red-400 border border-red-500 rounded-full px-2 w-32 text-center">
                            غير مجاب
                          </span>
                        )}
                        {studentAnswer &&
                          studentAnswer === question.currectAnswer && (
                            <span className="text-green-400 border border-green-500 rounded-full px-2 w-32 text-center">
                              اجابه صحيحه
                            </span>
                          )}
                        {studentAnswer &&
                          studentAnswer !== question.currectAnswer && (
                            <span className="text-red-400 border border-red-500 rounded-full px-2 w-32 text-center">
                              اجابه خاطئه
                            </span>
                          )}
                      </div>
                      <div className="flex flex-col gap-3 mt-8 text-xl">
                        {question.answers.map((answer: any) => {
                          return (
                            <div
                              key={answer.id}
                              className={cn("flex flex-col gap-2", {
                                "text-green-500 border border-green-500 p-3 rounded-lg":
                                  answer.index === question.currectAnswer,
                                "text-red-500 border border-red-500 p-3 rounded-lg":
                                  answer.index === studentAnswer &&
                                  answer.index !== question.currectAnswer,
                              })}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span>{answer.index}</span> -{" "}
                                  {/* <span>{answer.answer}</span> */}
                                  {answer.answer && (
                                    <div
                                      className="inline mr-2 html-content"
                                      dangerouslySetInnerHTML={{
                                        __html: answer.answer || "",
                                      }}
                                    />
                                  )}
                                </div>
                                {answer.index === studentAnswer &&
                                  answer.index === question.currectAnswer && (
                                    <BadgeCheck
                                      size={20}
                                      className="text-green-500 mr-auto"
                                    />
                                  )}

                                {answer.index === studentAnswer &&
                                  answer.index !== question.currectAnswer && (
                                    <BadgeX
                                      size={20}
                                      className="text-red-500 mr-auto"
                                    />
                                  )}
                              </div>
                              {answer.image_url && (
                                <Image
                                  src={answer.image_url}
                                  width={200}
                                  height={200}
                                  alt="image"
                                  className="rounded-lg"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {((studentAnswer &&
                        studentAnswer !== question?.currectAnswer) ||
                        !studentAnswer) &&
                        (question?.explanation_text ||
                          question?.explanation_image) && (
                          <div className="mt-3">
                            <h3 className="text-lg border-b w-fit">
                              تفسير السؤال
                            </h3>
                            {question?.explanation_text && (
                              <div
                                className="html-content mt-3"
                                dangerouslySetInnerHTML={{
                                  __html: question.explanation_text,
                                }}
                              />
                            )}
                            {question?.explanation_image && (
                              <Image
                                src={question.explanation_image}
                                width={350}
                                height={250}
                                alt="explanation"
                                className="rounded-lg"
                              />
                            )}
                          </div>
                        )}
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
