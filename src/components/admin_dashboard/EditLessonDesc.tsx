"use client";

import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import axios from "axios";
import TipTap from "../TipTap";
import { BadgeCheck, BadgeInfo } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function EditLessonDesc({
  desc,
  courseId,
  chapterId,
  lessonId,
}: {
  desc: string;
  courseId: string;
  chapterId: string;
  lessonId: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const [content, setContent] = useState(desc);

  async function onSubmit() {
    if (content.length < 10) {
      toast({
        description: (
          <div className="flex items-center gap-3">
            <BadgeInfo size={18} className="mr-2 text-red-500" />
            <span>يجب أن يحتوي الوصف على 2 حرف على الأقل</span>
          </div>
        ),
      });
      return;
    }
    await axios
      .patch(
        `/api/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`,
        {
          description: content,
        }
      )
      .then(() => {
        router.refresh();
        toast({
          description: (
            <div className="flex items-center gap-3">
              <BadgeCheck size={18} className="mr-2 text-green-500" />
              <span>تم تعديل الوصف بنجاح</span>
            </div>
          ),
        });
        setIsEditing(false);
      })
      .catch((error) => {
        console.log("error while updating desc", error);
        toast({
          variant: "destructive",
          description: (
            <div className="flex items-center gap-3">
              <BadgeInfo size={18} className="mr-2 text-red-500" />
              <span>حدث خطأ ما، الرجاء المحاولة مرة اخرى.</span>
            </div>
          ),
        });
      });
  }

  return (
    <div className="border dark:border-secondary/30 border-secondary/50 w-full rounded-md p-5">
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <p className="text-gray-500 mb-3">الوصف</p>
          {isEditing ? (
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                الغاء
              </Button>
              <Button onClick={onSubmit}>حفظ</Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)}>تعديل</Button>
          )}
        </div>
        {isEditing ? (
          <TipTap content={content} onChange={(value) => setContent(value)} />
        ) : (
          <div>
            <div
              className="html-content"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
