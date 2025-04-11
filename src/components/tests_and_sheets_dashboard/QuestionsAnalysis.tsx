"use client";

import React from "react";
import Loading from "../Loading";
import QuestionData from "./QuestionData";

interface QuestionsAnalysisProps {
  data: any;
  numOfTestsUserData: number;
  isLoading: boolean;
}

export default function QuestionsAnalysis({
  data,
  numOfTestsUserData,
  isLoading,
}: QuestionsAnalysisProps) {
  if (isLoading) {
    return <Loading className="h-[300px]" />;
  }

  return (
    <div className="mt-10">
      <div className="text-lg flex items-center gap-3">
        <p className="text-xl">عدد الأسئلة</p>
        <p className="bg-first px-2 py-1 rounded-lg text-white">
          {data?.lesson?.testQuestions?.length}
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-4">
        {data?.questions?.map((question: any, index: number) => (
          <QuestionData
            key={question?.id}
            question={question}
            index={index}
            numOfTestsUserData={numOfTestsUserData}
          />
        ))}
      </div>
    </div>
  );
}
