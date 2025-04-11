"use client";

import { Course } from "@prisma/client";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CoursesLinkDataProps {
  course: Course;
}

export default function CourseLinkData({ course }: CoursesLinkDataProps) {
  if (!course) return null;
  return (
    <Link
      href={`/admin/tests_and_sheets/${course?.id}`}
      className="p-4 border border-first rounded-xl flex items-center justify-between group hover:bg-first/10 transition-all"
    >
      <div className="flex items-center gap-3">
        <Image
          src={course?.image!}
          width={100}
          height={100}
          alt=""
          className="border rounded-lg object-cover"
        />
        <h3 className="text-lg">{course?.title}</h3>
      </div>
      <ArrowLeft
        size={20}
        className="group-hover:transform group-hover:translate-x-3 transition duration-200 md:ml-4"
      />
    </Link>
  );
}
