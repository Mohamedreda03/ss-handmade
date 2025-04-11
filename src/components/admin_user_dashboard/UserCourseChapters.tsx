"use client";

import { Chapter } from "@prisma/client";
import axios from "axios";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useQuery } from "react-query";
import UserChapterLessons from "./UserChapterLessons";

interface UserCourseChaptersProps {
  userId: string;
  courseId: string;
}

export default function UserCourseChapters({
  userId,
  courseId,
}: UserCourseChaptersProps) {
  const [currentChapter, setCurrentChapter] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["userCourseChapters", userId, courseId],
    queryFn: async () => {
      const res = await axios
        .get(`/api/admin_user_courses_data/${userId}/${courseId}`)
        .then((res) => res.data);

      return res;
    },
  });

  const openChapter = (chapterId: string) => {
    if (currentChapter === chapterId) {
      setCurrentChapter(null);
      return;
    }
    setCurrentChapter(chapterId);
  };

  return (
    <div className="pt-5 border-t dark:border-first/60 mt-3 flex flex-col gap-3">
      {isLoading && (
        <>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-center rounded-xl h-16 bg-slate-200 animate-pulse dark:bg-slate-800"
            />
          ))}
        </>
      )}
      {data &&
        data?.map((chapter: Chapter) => (
          <div
            key={chapter?.id}
            className="border border-first rounded-xl p-3 md:p-5"
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => openChapter(chapter?.id)}
            >
              <div
                className="text-lg cursor-pointer"
                onClick={() => openChapter(chapter?.id)}
              >
                {chapter?.title}
              </div>
              <ChevronDown
                onClick={() => openChapter(chapter?.id)}
                className={`cursor-pointer transform transition-all ${
                  currentChapter === chapter?.id ? "rotate-180" : ""
                }`}
              />
            </div>

            {/* show chapter lessons */}
            {currentChapter === chapter?.id && (
              <UserChapterLessons
                userId={userId}
                chapterId={chapter?.id}
                courseId={courseId}
              />
            )}
          </div>
        ))}
    </div>
  );
}
