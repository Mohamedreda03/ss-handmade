"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Loading from "../Loading";
import Image from "next/image";
import { Answers } from "@prisma/client";
import EndTestModel from "../models/EndTestModel";

export default function Test({
  courseId,
  testId,
  lessonId,
  chapterId,
}: {
  lessonId: string;
  courseId: string;
  chapterId: string;
  testId: string;
}) {
  // const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [isEndTestLoading, setIsEndTestLoading] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["answer"],
    queryFn: async () => {
      const res = await axios.get(
        `/api/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/test/${testId}/answer`
      );
      return res.data;
    },
  });

  const questionsMap = useMemo(() => {
    const map: { [key: number]: any } = {};
    data?.lesson?.testQuestions.forEach((question: any, index: number) => {
      map[index] = question;
    });
    return map;
  }, [data]);

  const answersMap = useMemo(() => {
    const map: { [key: number]: any } = {};
    data?.test?.testAnswers.forEach((answer: any, index: number) => {
      map[answer.testQuestionId] = answer;
    });
    return map;
  }, [data]);

  const currentQuestionId = questionsMap[currentQuestionIndex]?.id;

  const dbAnswer = answersMap[currentQuestionId]?.answer;

  const [currentAnswer, setCurrentAnswer] = useState<number | null | undefined>(
    dbAnswer || null
  );

  useEffect(() => {
    setCurrentAnswer(dbAnswer);
  }, [currentQuestionIndex, dbAnswer]);

  const { mutateAsync } = useMutation({
    mutationFn: async (data: any) => {
      return await axios.post(
        `/api/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/test/${testId}/answer`,
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries("answer");
    },
  });

  const { mutateAsync: updateTestData } = useMutation({
    mutationFn: async (data: any) => {
      return await axios.patch(
        `/api/lesson_user_data/test/${testId}/test_result`,
        data
      );
    },
    onSuccess: () => {
      toast.success("تم ارسال الاجابات بنجاح");
    },
  });

  const onChange = async (newAnswer: number) => {
    setCurrentAnswer(newAnswer);

    await mutateAsync({
      lessonId: lessonId,
      lessonUserDataId: testId,
      testQuestionId: data?.lesson?.testQuestions[currentQuestionIndex]?.id,
      answer: newAnswer,
    });
  };

  const onEnd = async () => {
    setIsEndTestLoading(true);
    await updateTestData({});

    router.refresh();

    router.push(`/courses/${courseId}/${lessonId}`);
  };

  return (
    <>
      {isLoading ? (
        <Loading className="h-[70vh]" />
      ) : (
        <div className="select-none">
          <div className="max-w-[400px] w-full border border-second rounded-xl mb-8 mx-auto min-h-[200px] p-3 flex flex-col items-center gap-5">
            <div className="flex flex-col items-center gap-2">
              <div>اجمالي عدد الاسئلة</div>
              <div className="bg-first text-white px-3 py-2 rounded-lg">
                {data?.lesson?.testQuestions.length}
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div>عدد الأسئلة المجابة</div>
              <div className="bg-second text-white px-3 py-2 rounded-lg">
                {data?.test?.testAnswers.length}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap max-w-screen-lg mx-auto">
            {data?.lesson?.testQuestions?.map(
              (question: any, index: number) => {
                const isQuestionAnswered =
                  data?.test.testAnswers.find(
                    (answer: any) => answer.testQuestionId === question.id
                  ) !== undefined;

                return (
                  <Button
                    key={question.id}
                    variant="outline"
                    className={cn({
                      "border-secondary bg-secondary/25 hover:bg-secondary/25":
                        currentQuestionIndex === index,
                      "border-2 border-second bg-second/70": isQuestionAnswered,
                      "border-2 border-second bg-secondary/25 hover:bg-secondary/25":
                        currentQuestionIndex === index && isQuestionAnswered,
                    })}
                    onClick={() => {
                      setCurrentQuestionIndex(index);
                      // setCurrentQuestion(index);
                      setCurrentAnswer(answersMap[question.id]?.answer || null);
                    }}
                  >
                    {index + 1}
                  </Button>
                );
              }
            )}
          </div>
          {data?.lesson.testQuestions.length === 0 ? (
            <>
              <div>لا يوجد اسأله</div>
            </>
          ) : (
            <div className="mt-10">
              <h2 className="text-3xl mb-7 border-b pb-4">
                السؤال{" "}
                <span className="mr-2 bg-blue-500 text-white px-3 py-1.5 rounded-lg">
                  {currentQuestionIndex + 1}
                </span>
              </h2>
              <div className="flex flex-col gap-4">
                {data?.lesson?.testQuestions[currentQuestionIndex]
                  ?.image_url && (
                  <Image
                    src={
                      data?.lesson?.testQuestions[currentQuestionIndex]
                        ?.image_url
                    }
                    width={400}
                    height={400}
                    alt="question image"
                  />
                )}
                {/* <h3 className="md:text-3xl text-2xl">
                  {data?.lesson.testQuestions[currentQuestion].question}
                </h3> */}
                {data?.lesson?.testQuestions[currentQuestionIndex]
                  ?.question && (
                  <div
                    className="text-2xl html-content"
                    dangerouslySetInnerHTML={{
                      __html:
                        data?.lesson?.testQuestions[currentQuestionIndex]
                          ?.question || "",
                    }}
                  />
                )}
              </div>
              <div className="mt-10 gap-4 text-lg grid grid-cols-1 md:grid-cols-2 max-w-screen-md">
                {data?.lesson?.testQuestions[currentQuestionIndex]?.answers.map(
                  (answer: Answers, index: number) => {
                    // console.log(answer.index);

                    return (
                      <div key={answer.id}>
                        <label htmlFor={answer.id} className="flex gap-2 w-fit">
                          <div className="flex items-start gap-2">
                            <input
                              type="radio"
                              id={answer.id}
                              checked={currentAnswer === answer.index}
                              onChange={() => onChange(answer.index!)}
                            />
                            <div className="flex flex-col gap-1">
                              {answer.answer && (
                                <div
                                  className="html-content"
                                  dangerouslySetInnerHTML={{
                                    __html: answer.answer || "",
                                  }}
                                />
                              )}
                              {answer.image_url && (
                                <Image
                                  src={answer.image_url}
                                  width={200}
                                  height={200}
                                  alt="answer image"
                                />
                              )}
                            </div>
                          </div>
                        </label>
                      </div>
                    );
                  }
                )}
              </div>
              <div className="flex items-center gap-2 mt-10">
                {data?.lesson.testQuestions.length ===
                currentQuestionIndex + 1 ? (
                  <EndTestModel
                    onEndTest={onEnd}
                    isLoading={isEndTestLoading}
                  />
                ) : (
                  <Button
                    className="text-lg"
                    onClick={() => {
                      // setCurrentQuestion(currentQuestion + 1);
                      setCurrentQuestionIndex((prev) => prev + 1);
                      setCurrentAnswer(null);
                    }}
                    disabled={
                      currentQuestionIndex ===
                      data?.data?.lesson.testQuestions.length - 1
                    }
                  >
                    التالي
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="text-lg"
                  onClick={() => {
                    // setCurrentQuestion(currentQuestion - 1);
                    setCurrentQuestionIndex((prev) => prev - 1);
                    setCurrentAnswer(null);
                  }}
                  disabled={currentQuestionIndex === 0}
                >
                  السابق
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
