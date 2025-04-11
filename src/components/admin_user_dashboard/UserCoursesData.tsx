"use client";

import axios from "axios";
import React from "react";
import { useQuery } from "react-query";
import Loading from "../Loading";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import UserCourseChapters from "./UserCourseChapters";

interface UserCoursesDataProps {
  userId: string;
}

export default function UserCoursesData({ userId }: UserCoursesDataProps) {
  const [currentCourse, setCurrentCourse] = React.useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["userCoursesData", userId],
    queryFn: async () => {
      const res = await axios
        .get(`/api/admin_user_courses_data/${userId}`)
        .then((res) => res.data);

      return res;
    },
  });

  const openCourseChapters = (courseId: string) => {
    if (currentCourse === courseId) {
      setCurrentCourse(null);
      return;
    }
    setCurrentCourse(courseId);
  };

  if (isLoading) {
    return <Loading className="h-[160px] border border-first-100 rounded-xl" />;
  }

  if (!data?.Subscription?.length) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-center">
          لم يشترك في اي كورسات بعد
        </h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {data &&
        data?.Subscription?.map((sub: any) => (
          <div
            key={sub?.id}
            className="border border-first-100 rounded-xl p-3 md:p-5"
          >
            <div
              className="flex gap-3 justify-between items-center cursor-pointer"
              onClick={() => openCourseChapters(sub?.course?.id)}
            >
              <div className="flex items-center gap-4">
                <Image
                  src={sub?.course?.image}
                  width={100}
                  height={100}
                  className="border rounded-lg"
                  onClick={() => openCourseChapters(sub?.course?.id)}
                  alt={sub?.course?.title}
                />
                <div
                  className="text-lg"
                  onClick={() => openCourseChapters(sub?.course?.id)}
                >
                  {sub?.course?.title}
                </div>
              </div>

              <ChevronDown
                onClick={() => openCourseChapters(sub?.course?.id)}
                className={`cursor-pointer transform transition-all ${
                  currentCourse === sub?.course?.id ? "rotate-180" : ""
                }`}
              />
            </div>
            {/* chapters data */}
            <div>
              {/* open course chapters */}
              {currentCourse === sub?.course?.id && (
                <UserCourseChapters
                  courseId={sub?.course?.id}
                  userId={userId}
                />
              )}
            </div>
          </div>
        ))}
    </div>
  );
}
