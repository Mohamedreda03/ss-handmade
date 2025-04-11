"use client";

import Loading from "@/components/Loading";
import QuestionData from "@/components/tests_and_sheets_dashboard/QuestionData";
import QuestionsAnalysis from "@/components/tests_and_sheets_dashboard/QuestionsAnalysis";
import StudentsResultData from "@/components/tests_and_sheets_dashboard/StudentsResultData";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "react-query";

interface TestOrSheetDataProps {
  params: { courseId: string; lessonId: string };
}

export default function TestOrSheetData({
  params: { courseId, lessonId },
}: TestOrSheetDataProps) {
  const [switchData, setSwitchData] = useState<"analysis" | "results">(
    "analysis"
  );
  const { data, isLoading } = useQuery({
    queryKey: ["testOrSheetData", lessonId],
    queryFn: async () => {
      const data = await axios
        .get(`/api/admin_tests_and_sheets/${courseId}/${lessonId}`)
        .then((res) => res.data);
      return data;
    },
  });

  const numOfTestsUserData = data?.lesson?._count?.TestUserData;

  return (
    <div className="py-8 px-5 md:px-10">
      <div className="flex items-center gap-10 mb-8">
        <Button asChild variant="outline">
          <Link
            href={`/admin/tests_and_sheets/${courseId}`}
            className="flex items-center"
          >
            <ArrowRight size={17} className="ml-2" />
            <span>العودة للخلف</span>
          </Link>
        </Button>
        <h2 className="md:text-3xl text-xl border-b-2 border-first pb-1">
          {!isLoading && data && data?.lesson?.title}
        </h2>
      </div>

      {/* switch buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 border p-2 rounded-lg border-secondary/50">
        <Button
          variant={switchData === "analysis" ? "secondary" : "outline"}
          onClick={() => setSwitchData("analysis")}
        >
          تحليل أجابات الطلاب
        </Button>
        <Button
          variant={switchData === "results" ? "secondary" : "outline"}
          onClick={() => setSwitchData("results")}
        >
          نتائج الطلاب
        </Button>
      </div>

      {/* showing data */}
      {switchData === "analysis" && (
        <QuestionsAnalysis
          data={data}
          numOfTestsUserData={numOfTestsUserData}
          isLoading={isLoading}
        />
      )}

      {switchData === "results" && (
        <StudentsResultData lessonId={lessonId} courseId={courseId} />
      )}
    </div>
  );
}
