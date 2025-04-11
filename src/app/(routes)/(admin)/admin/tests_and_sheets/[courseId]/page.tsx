"use client";

import Loading from "@/components/Loading";
import LessonLinkData from "@/components/tests_and_sheets_dashboard/LessonLinkData";
import { Button } from "@/components/ui/button";
import { Lesson } from "@prisma/client";
import axios from "axios";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "react-query";

export default function CourseTests({
  params: { courseId },
}: {
  params: { courseId: string };
}) {
  const { data: course, isLoading } = useQuery({
    queryKey: ["courseTestsAndSheets", courseId],
    queryFn: async () => {
      const data = await axios
        .get(`/api/admin_tests_and_sheets/${courseId}`)
        .then((res) => res.data);
      return data;
    },
  });

  if (isLoading) {
    return <Loading className="h-[300px]" />;
  }

  return (
    <div className="px-5 md:px-10 pb-10 pt-7">
      <div className="flex items-center gap-10 mb-8">
        <Button asChild variant="outline">
          <Link href="/admin/tests_and_sheets" className="flex items-center">
            <ArrowRight size={17} className="ml-2" />
            <span>العودة للخلف</span>
          </Link>
        </Button>
        <h2 className="md:text-3xl text-xl border-b-2 border-first pb-1">
          الامتحانات و الواجبات
        </h2>
      </div>
      <div className="border border-second p-4 rounded-xl">
        <div className="flex items-center gap-4">
          <Image
            src={course?.image!}
            width={100}
            height={100}
            alt={course?.title}
            className="rounded-lg object-cover border"
          />
          <h3 className="text-xl">{course?.title}</h3>
        </div>
      </div>
      <div className="w-full h-[1px] bg-secondary my-6" />
      <div className="flex flex-col gap-4">
        {course?.chapters?.map((chapter: any) => (
          <div className="border border-second rounded-xl p-3" key={chapter.id}>
            <h2 className="text-2xl mb-5 mt-3 text-center border-b pb-3">
              {chapter?.title}
            </h2>
            <div className="flex flex-col gap-3">
              {chapter?.Lesson?.map((lesson: Lesson) => (
                <LessonLinkData
                  key={lesson?.id}
                  lesson={lesson}
                  courseId={courseId}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
