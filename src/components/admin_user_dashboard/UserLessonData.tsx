"use client";

import { FileUserData, Lesson, VideoUserData } from "@prisma/client";
import React from "react";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

interface UserLessonDataProps {
  lesson: Lesson & {
    FileUserData: FileUserData[];
    VideoUserData: VideoUserData[];
  };
}

export default function UserLessonData({ lesson }: UserLessonDataProps) {
  return (
    <div>
      <div className="py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div>{lesson?.title}</div>{" "}
          <Badge
            className={cn({
              "bg-blue-500 hover:bg-blue-400": lesson?.type === "file",
              "bg-yellow-500 hover:bg-yellow-400": lesson?.type === "video",
            })}
          >
            {lesson?.type === "video" && "فيديو"}
            {lesson?.type === "file" && "ملف"}
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
            )}{" "}
            {lesson?.type === "file" && (
              <div className="flex items-center gap-2">
                <p className="text-sm">عدد مرات فتح الملف</p>
                <p className="bg-blue-500 text-white px-2 py-1 rounded-lg">
                  {lesson?.FileUserData[0]?.isCompleted || 0}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
