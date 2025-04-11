"use client";

import { format } from "date-fns";
import { FolderPlus, RefreshCcw } from "lucide-react";
import { ar } from "date-fns/locale";
import { Course } from "@prisma/client";

export default function StudentCourseHeader({
  course,
  isLoading,
}: {
  course: Course;
  isLoading: boolean;
}) {
  if (isLoading) return null;
  return (
    <div className="min-h-[350px] w-full px-5 md:px-10 pt-12 pb-20 md:pb-10 bg-gradient-to-l from-primary/90 to-primary/50 rounded-lg flex">
      <div className="md:flex-[1.3] w-full flex items-center">
        <div>
          <h2 className="md:text-5xl text-3xl font-bold text-white">
            {course?.title}
          </h2>
          {/* <p className="text-lg text-black/80 mt-4">{course?.description}</p> */}
          <div
            className="text-lg text-white mt-4 html-content"
            dangerouslySetInnerHTML={{
              __html: course?.description || "",
            }}
          />

          <div className="flex md:items-center gap-6 flex-col md:flex-row mt-5">
            <div className="flex items-center gap-2 flex-col md:flex-row">
              <div className="flex items-center gap-2">
                <FolderPlus
                  size={16}
                  className="text-sky-400 text-sm sm:text-md"
                />
                <span className="underline text-white">تاريخ انشاء الكورس</span>
              </div>
              <span className="bg-sky-400 py-1 px-3 rounded-full text-sm">
                {format(new Date(course?.createdAt), "eeee, do MMM yyyy", {
                  locale: ar,
                })}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-col md:flex-row">
              <div className="flex items-center gap-2">
                <RefreshCcw size={16} className="text-rose-500" />
                <span className="underline text-white">آخر تحديث للكورس</span>
              </div>
              <span className="bg-rose-500 py-1 px-3 rounded-full text-sm">
                {format(new Date(course?.updatedAt), "eeee, do MMM yyyy", {
                  locale: ar,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="md:flex-[0.7] md:w-full"></div>
    </div>
  );
}
