"use client";

import { Lesson } from "@prisma/client";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CoursesLinkDataProps {
  lesson: Lesson;
  courseId: string;
}

export default function LessonLinkData({
  lesson,
  courseId,
}: CoursesLinkDataProps) {
  return (
    <Link
      href={`/admin/tests_and_sheets/${courseId}/${lesson.id}`}
      className="p-4 border border-first rounded-xl flex items-center justify-between group hover:bg-first/10 transition-all"
    >
      <div className="flex items-center gap-3">
        <h3 className="text-lg">{lesson.title}</h3>
      </div>
      <ArrowLeft
        size={20}
        className="group-hover:transform group-hover:translate-x-3 transition duration-200 md:ml-4"
      />
    </Link>
  );
}
