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
      className="border border-primary/30 rounded-lg shadow-md md:p-5 p-3 bg-card hover:shadow-lg transition-shadow hover:border-primary/50"
    >
      {" "}
      <AccordionTrigger className="bg-primary/10 dark:bg-primary/20 md:py-6 px-5 rounded-lg hover:bg-primary/15 dark:hover:bg-primary/25 transition-colors">
        <div className="flex items-center gap-3">
          <BookOpenText className="text-primary h-8 w-8" />
          <h3 className="text-xl md:text-2xl font-semibold text-primary">
            {chapter?.title}
          </h3>
        </div>
      </AccordionTrigger>{" "}
      <AccordionContent className="mt-5 bg-accent/30 dark:bg-accent/10 p-4 rounded-lg border border-primary/20">
        {lessons && lessons.length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-3">
            {lessons.map((lesson: any) => (
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
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              لا توجد دروس متاحة في هذا الفصل حالياً
            </p>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
