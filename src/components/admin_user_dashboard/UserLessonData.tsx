"use client";

import {
  FileUserData,
  Lesson,
  TestUserData,
  VideoUserData,
} from "@prisma/client";
import React from "react";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import UserTestsAndSheetsTable from "./UserTestsAndSheetsTable";

interface UserLessonDataProps {
  lesson: Lesson & {
    FileUserData: FileUserData[];
    VideoUserData: VideoUserData[];
    TestUserData: TestUserData[];
    _count: {
      testQuestions: number;
    };
  };
}

export default function UserLessonData({ lesson }: UserLessonDataProps) {
  return (
    <div>
      <div className="py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div>{lesson?.title}</div>
          <Badge
            className={cn({
              "bg-blue-500 hover:bg-blue-400": lesson?.type === "file",
              "bg-yellow-500 hover:bg-yellow-400": lesson?.type === "video",
              "bg-indigo-500 hover:bg--indigo-400": lesson?.type === "sheet",
              "bg-rose-500 hover:bg-rose-400": lesson?.type === "test",
            })}
          >
            {lesson?.type === "video" && "فيديو"}

            {lesson?.type === "file" && "ملف"}
            {lesson?.type === "sheet" && "واجب"}
            {lesson?.type === "test" && "اختبار"}
          </Badge>
        </div>
        {/* user lesson data */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {lesson?.type === "video" && (
              <div className="flex items-center gap-2">
                <p className="text-sm">عدد مرات المشاهدة</p>
                <p className="bg-yellow-500 text-white px-2 py-1 rounded-lg">
                  {lesson?.VideoUserData[0]?.isCompleted || 0}
                </p>
              </div>
            )}
            {lesson?.type === "file" && (
              <div className="flex items-center gap-2">
                <p className="text-sm">عدد مرات فتح الملف</p>
                <p className="bg-blue-500 text-white px-2 py-1 rounded-lg">
                  {lesson?.FileUserData[0]?.isCompleted || 0}
                </p>
              </div>
            )}
            {lesson?.type === "sheet" && (
              <div className="flex items-center gap-2">
                <p className="text-sm">عدد مرات دخول الواجب</p>
                <p className="bg-indigo-500 text-white px-2 py-1 rounded-lg">
                  {lesson?.TestUserData?.length}
                </p>
              </div>
            )}
            {lesson?.type === "test" && (
              <div className="flex items-center gap-2">
                <p className="text-sm">عدد مرات دخول الامتحان</p>
                <p className="bg-rose-500 text-white px-2 py-1 rounded-lg">
                  {lesson?.TestUserData?.length}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* test data */}
      {(lesson?.type === "test" || lesson?.type === "sheet") && (
        <div>
          <UserTestsAndSheetsTable lesson={lesson} />
        </div>
      )}
    </div>
  );
}
