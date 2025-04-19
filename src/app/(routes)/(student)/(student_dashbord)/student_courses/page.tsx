"use client";

import CourseCard from "@/components/CourseCard";
import Loading from "@/components/Loading";
import axios from "axios";
import { useQuery } from "react-query";

export const dynamic = "force-dynamic";
export default function StudentCourses() {
  const { data, isLoading } = useQuery({
    queryKey: "subscriptions",
    queryFn: async () => {
      return await axios
        .get("/api/courses/get_student_owned_courses")
        .then((res) => res.data);
    },
  });

  if (isLoading) {
    return <Loading className="h-[70vh]" />;
  }

  return (
    <div className="p-5">
      {data?.subscriptions?.length === 0 ? (
        <div className="flex items-center justify-center h-[50vh]">
          <h1 className="text-2xl text-gray-400">أنت غير مشترك في اي كورسات</h1>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5">
          {data?.subscriptions.map((subscription: any) => (
            <div key={subscription?.course.id}>
              <CourseCard
                key={subscription?.course.id}
                course={subscription.course}
                isOwned={true}
                isUserAuth={true}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
