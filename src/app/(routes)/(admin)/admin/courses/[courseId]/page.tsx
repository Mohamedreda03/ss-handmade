"use client";

import CourseHead from "@/components/admin_dashboard/CourseHead";
import CourseYear from "@/components/admin_dashboard/CourseYear";
import EditChapters from "@/components/admin_dashboard/EditChapters";
import EditDesc from "@/components/admin_dashboard/EditDesc";
import EditImage from "@/components/admin_dashboard/EditImage";
import EditPrice from "@/components/admin_dashboard/EditPrice";
import EditTitle from "@/components/admin_dashboard/EditTitle";
import Loading from "@/components/Loading";
import axios from "axios";
import { useQuery } from "react-query";

// export const dynamic = "force-dynamic";
export default function CoursePage({
  params: { courseId },
}: {
  params: { courseId: string };
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["courses", "chapters", courseId],
    queryFn: async () => {
      const data = await axios
        .get(`/api/courses/${courseId}/course_admin`)
        .then((res) => res.data);
      return data;
    },
  });

  if (isLoading) {
    return <Loading className="h-[300px]" />;
  }

  return (
    <div className="p-5">
      <CourseHead course={data?.course} itemsCount={data?.itemsCount as any} />
      <div className="flex flex-col md:flex-row gap-5">
        <div className="md:flex-1 flex flex-col gap-5">
          {data && (
            <>
              <EditTitle title={data?.course?.title!} courseId={courseId} />
              <EditDesc desc={data?.course?.description!} courseId={courseId} />
              <EditImage image={data?.course?.image!} courseId={courseId} />
            </>
          )}
        </div>
        <div className="md:flex-1 flex flex-col gap-5">
          {data && (
            <>
              <EditPrice price={data?.course?.price!} courseId={courseId} />
              <EditChapters courseId={courseId} items={data?.items as any} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
