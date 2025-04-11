"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BookOpenText } from "lucide-react";
import ChapterLesson from "./ChapterLesson";

export default function CourseChapter({
  chapter,
  courseId,
  isOwned,
  isUserAuth,
  isUserAdmin,
}: {
  chapter: any;
  courseId: string;
  isOwned: boolean;
  isUserAuth: boolean;
  isUserAdmin: boolean;
}) {
  const lessons = chapter.Lesson;

  return (
    <AccordionItem
      value={chapter?.id}
      className="border rounded-lg shadow-md md:p-5 p-3"
    >
      <AccordionTrigger className="bg-slate-100 dark:bg-slate-800 md:py-6 px-5 rounded-lg">
        <div className="flex items-center gap-3">
          <BookOpenText className="text-rose-400 h-8 w-8" />
          <h3 className="text-xl md:text-2xl font-semibold">
            {chapter?.title}
          </h3>
        </div>
      </AccordionTrigger>
      <AccordionContent className="mt-5 bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
        <Accordion type="single" collapsible className="w-full space-y-3">
          {lessons?.map((lesson: any) => (
            <ChapterLesson
              key={lesson?.id}
              lesson={lesson}
              courseId={courseId}
              isOwned={isOwned}
              isUserAuth={isUserAuth}
              isUserAdmin={isUserAdmin}
            />
          ))}
        </Accordion>
      </AccordionContent>
    </AccordionItem>
  );
}
