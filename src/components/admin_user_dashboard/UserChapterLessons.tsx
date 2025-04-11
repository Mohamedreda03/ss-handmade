"use client";

import axios from "axios";
import React from "react";
import { useQuery } from "react-query";
import UserLessonData from "./UserLessonData";

interface UserChapterLessonsProps {
  userId: string;
  chapterId: string;
  courseId: string;
}

export default function UserChapterLessons({
  userId,
  chapterId,
  courseId,
}: UserChapterLessonsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["userChapterLessons", chapterId, userId],
    queryFn: async () => {
      const res = await axios
        .get(`/api/admin_user_courses_data/${userId}/${courseId}/${chapterId}`)
        .then((res) => res.data);

      return res;
    },
  });

  return (
    <div className="pt-3 border-t dark:border-first/60 mt-3 flex flex-col gap-2 divide-y divide-first/60">
      {data?.map((lesson: any) => (
        <UserLessonData key={lesson.id} lesson={lesson} />
      ))}
      {isLoading && (
        <>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-center h-14 bg-slate-200 animate-pulse dark:bg-slate-800"
            />
          ))}
        </>
      )}
    </div>
  );
}
