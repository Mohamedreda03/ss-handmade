"use client";

import { File, FlaskConical, Video } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

export default function ChapterLesson({
  lesson,
  courseId,
  isOwned,
  isUserAuth,
  isUserAdmin,
}: {
  lesson: any;
  courseId: string;
  isOwned: boolean;
  isUserAuth: boolean;
  isUserAdmin: boolean;
}) {
  return (
    <AccordionItem
      value={lesson?.id}
      className="bg-white dark:bg-slate-700 px-5 py-1 border-b-0 rounded-lg"
    >
      <AccordionTrigger className="py-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            {lesson?.type === "file" && (
              <File size={27} className="text-blue-400" />
            )}
            {lesson?.type === "video" && (
              <Video size={27} className="text-yellow-400" />
            )}
            {lesson?.type === "test" && (
              <FlaskConical size={27} className="text-rose-400" />
            )}
            {lesson?.type === "sheet" && (
              <FlaskConical size={27} className="text-indigo-500" />
            )}
            <h4 className="md:text-lg font-semibold">{lesson?.title}</h4>
          </div>
          <div className="flex items-center gap-5">
            <p
              className={cn("px-2 py-1 border border-green-400 rounded-full", {
                "text-green-500": lesson?.isFree,
                hidden: !lesson?.isFree,
              })}
            >
              {lesson?.isFree && "مجاني"}
            </p>

            <Button
              asChild
              className={cn("text-white ml-4 no-underline", {
                "bg-blue-500 hover:bg-blue-400": lesson?.type === "file",
                "bg-yellow-500 hover:bg-yellow-400": lesson?.type === "video",
                "bg-indigo-500 hover:bg--indigo-400": lesson?.type === "sheet",
                "bg-rose-500 hover:bg-rose-400": lesson?.type === "test",
              })}
            >
              {isUserAuth && (isUserAdmin || isOwned || lesson.isFree) && (
                <Link href={`/course/${courseId}/${lesson.id}`}>
                  {lesson?.type === "file" && "فتح الملف"}
                  {lesson?.type === "video" && "شاهد الفيديو"}
                  {lesson?.type === "test" && "ابدأ الاختبار"}
                  {lesson?.type === "sheet" && "فتح الواجب"}
                </Link>
              )}
            </Button>
          </div>
        </div>
      </AccordionTrigger>
      {isUserAuth && isOwned && (
        <AccordionContent className="dark:bg-slate-800 bg-slate-100 py-4 rounded-lg px-4 mb-2">
          {lesson?.type === "file" && (
            <div>
              <span>عدد مرات فتح الملف</span>
              <span className="mr-3 bg-indigo-500 px-3 py-1 rounded-lg text-white">
                {lesson?.FileUserData[0]?.isCompleted || 0}
              </span>
            </div>
          )}
          {lesson?.type === "video" && (
            <div>
              <span>عدد مرات المشاهدة</span>
              <span className="mr-3 bg-yellow-500 px-3 py-1 rounded-lg text-white">
                {lesson?.VideoUserData[0]?.isCompleted || 0}
              </span>
            </div>
          )}
          {lesson?.type === "test" && (
            <div>
              <span>عدد مرات أكمال الختبار</span>
              <span className="mr-3 bg-red-500 px-3 py-1 rounded-lg text-white">
                {lesson?._count?.TestUserData || 0}
              </span>
            </div>
          )}
          {lesson?.type === "sheet" && (
            <div>
              <span>عدد مرات أكمال الواجب</span>
              <span className="mr-3 bg-indigo-500 px-3 py-1 rounded-lg text-white">
                {lesson?._count?.TestUserData || 0}
              </span>
            </div>
          )}
        </AccordionContent>
      )}
    </AccordionItem>
  );
}
