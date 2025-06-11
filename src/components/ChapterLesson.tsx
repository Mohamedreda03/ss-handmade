"use client";

import { File, FlaskConical, Video, FileText } from "lucide-react";
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
      className="bg-card dark:bg-card border border-primary/20 px-5 py-1 border-b-0 rounded-lg hover:bg-accent/20 dark:hover:bg-accent/10 transition-colors"
    >
      {" "}
      <AccordionTrigger className="py-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            {lesson?.type === "file" && (
              <File size={27} className="text-primary" />
            )}
            {lesson?.type === "video" && (
              <Video size={27} className="text-secondary" />
            )}
            {lesson?.type === "assignment" && (
              <FileText size={27} className="text-primary/80" />
            )}
            {lesson?.type === "test" && (
              <FlaskConical size={27} className="text-destructive" />
            )}
            {lesson?.type === "sheet" && (
              <FlaskConical size={27} className="text-muted-foreground" />
            )}
            <h4 className="md:text-lg font-semibold">{lesson?.title}</h4>
          </div>
          <div className="flex items-center gap-5">
            {" "}
            <p
              className={cn("px-2 py-1 border border-primary rounded-full", {
                "text-primary bg-primary/10": lesson?.isFree,
                hidden: !lesson?.isFree,
              })}
            >
              {lesson?.isFree && "مجاني"}
            </p>{" "}
            <Button
              asChild
              className={cn(
                "ml-4 no-underline bg-primary hover:bg-primary/90 text-primary-foreground"
              )}
            >
              {isUserAuth && (isUserAdmin || isOwned || lesson.isFree) && (
                <Link href={`/courses/${courseId}/${lesson.id}`}>
                  {lesson?.type === "file" && "فتح الملف"}
                  {lesson?.type === "video" && "شاهد الفيديو"}
                  {lesson?.type === "assignment" && "عرض المهمة"}
                  {lesson?.type === "test" && "ابدأ الاختبار"}
                  {lesson?.type === "sheet" && "فتح الواجب"}
                </Link>
              )}
            </Button>
          </div>
        </div>
      </AccordionTrigger>
      {isUserAuth && isOwned && (
        <AccordionContent className="bg-accent/20 dark:bg-accent/10 py-4 rounded-lg px-4 mb-2 border border-primary/20">
          {lesson?.type === "file" && (
            <div className="flex items-center gap-2">
              <span>عدد مرات فتح الملف</span>
              <span className="mr-3 bg-primary px-3 py-1 rounded-lg text-primary-foreground">
                {lesson?.FileUserData[0]?.isCompleted || 0}
              </span>
            </div>
          )}{" "}
          {lesson?.type === "video" && (
            <div className="flex items-center gap-2">
              <span>عدد مرات المشاهدة</span>
              <span className="mr-3 bg-secondary px-3 py-1 rounded-lg text-secondary-foreground">
                {lesson?.VideoUserData[0]?.isCompleted || 0}
              </span>
            </div>
          )}{" "}
          {lesson?.type === "assignment" && (
            <div className="flex items-center gap-2">
              <span>عدد الإجابات المرسلة</span>
              <span className="mr-3 bg-primary/80 px-3 py-1 rounded-lg text-primary-foreground">
                {lesson?._count?.submissions || 0}
              </span>
            </div>
          )}
          {lesson?.type === "test" && (
            <div className="flex items-center gap-2">
              <span>عدد مرات أكمال الختبار</span>
              <span className="mr-3 bg-destructive px-3 py-1 rounded-lg text-destructive-foreground">
                {lesson?._count?.TestUserData || 0}
              </span>
            </div>
          )}
          {lesson?.type === "sheet" && (
            <div className="flex items-center gap-2">
              <span>عدد مرات أكمال الواجب</span>
              <span className="mr-3 bg-muted px-3 py-1 rounded-lg text-muted-foreground">
                {lesson?._count?.TestUserData || 0}
              </span>
            </div>
          )}
        </AccordionContent>
      )}
    </AccordionItem>
  );
}
