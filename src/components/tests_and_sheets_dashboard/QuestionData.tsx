import { cn } from "@/lib/utils";
import { Answers, TestQuestion } from "@prisma/client";
import { BadgeCheck, BadgeX } from "lucide-react";
import Image from "next/image";
import React from "react";

interface QuestionDataProps {
  question: TestQuestion & { numCorrectAnswers: number; answers: Answers[] };
  numOfTestsUserData: number;
  index: number;
}

export default function QuestionData({
  question,
  numOfTestsUserData,
  index,
}: QuestionDataProps) {
  return (
    <div className="border border-first-200 p-5 rounded-xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-4">
          {question?.image_url && (
            <Image
              src={question?.image_url}
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
                  __html: question?.question || "",
                }}
              />
            )}
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-3 mt-5">
          <BadgeCheck size={20} className="text-green-500" />
          <span className="text-xl">
            {question?.numCorrectAnswers}
            <span className="mx-1.5">/</span>
            {numOfTestsUserData}
            <span className="mr-3">عدد الطلاب الذين اجابوا اجابة صحيحة</span>
          </span>
        </div>
        <div className="flex items-center gap-3 mt-5">
          <BadgeX size={20} className="text-red-500" />
          <span className="text-xl">
            {numOfTestsUserData - question?.numCorrectAnswers}
            <span className="mx-1.5">/</span>
            {numOfTestsUserData}
            <span className="mr-3">عدد الطلاب الذين اجابوا اجابة خاطئة</span>
          </span>
        </div>
      </div>
      <div className="w-full h-[1px] bg-second mt-3 mb-5" />
      <div className="flex flex-col gap-3 text-xl">
        {question?.answers?.map((answer: any) => {
          return (
            <div
              key={answer?.id}
              className={cn("flex flex-col gap-2", {
                "text-green-500 border border-green-500 p-3 rounded-lg":
                  answer?.index === question?.currectAnswer,
              })}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{answer?.index}</span> -{" "}
                  <div
                    className="inline mr-2 html-content"
                    dangerouslySetInnerHTML={{
                      __html: answer?.answer || "",
                    }}
                  />
                </div>
              </div>
              {answer?.image_url && (
                <Image
                  src={answer?.image_url}
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
    </div>
  );
}
