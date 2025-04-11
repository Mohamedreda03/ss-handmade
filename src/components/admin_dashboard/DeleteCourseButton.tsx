"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import ActionButton from "../ActionButton";
import { useState } from "react";
import { BadgeCheck, BadgeInfo } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function DeleteCourseButton({ courseId }: { courseId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const onDelete = async () => {
    setIsLoading(true);
    await axios
      .delete(`/api/courses/${courseId}`)
      .then(() => {
        toast({
          description: (
            <div className="flex items-center gap-3">
              <BadgeCheck size={18} className="mr-2 text-green-500" />
              <span>تم حذف الكورس بنجاح بنجاح.</span>
            </div>
          ),
        });
        router.refresh();
      })
      .catch(() => {
        toast({
          variant: "destructive",
          description: (
            <div className="flex items-center gap-3">
              <BadgeInfo size={18} className="mr-2 text-red-500" />
              <span>حدث خطأ ما، الرجاء المحاولة مرة اخرى.</span>
            </div>
          ),
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  return (
    <ActionButton
      onClick={onDelete}
      variant="outline"
      className="mr-2"
      title="حذف"
      loadingTitle="جاري الحذف"
      isLoading={isLoading}
    />
  );
}
