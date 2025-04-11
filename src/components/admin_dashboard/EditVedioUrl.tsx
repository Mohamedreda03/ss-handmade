"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const FormSchema = z.object({
  videoUrl: z.string().min(2, {
    message: "يجب أن يحتوي العنوان على 2 حرف على الأقل",
  }),
});

import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { BadgeCheck, BadgeInfo } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function EditVedioUrl({
  videoUrl,
  courseId,
  chapterId,
  lessonId,
}: {
  videoUrl: string;
  courseId: string;
  chapterId: string;
  lessonId: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      videoUrl,
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    let vedioId = data.videoUrl.split("/").slice(-1)[0];

    const newVideoUrl = `https://www.youtube.com/embed/${vedioId}`;

    await axios
      .patch(
        `/api/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`,
        {
          videoUrl: newVideoUrl,
        }
      )
      .then(() => {
        toast({
          description: (
            <div className="flex items-center gap-3">
              <BadgeCheck size={18} className="mr-2 text-green-500" />
              <span>تم تعديل الفيديو بنجاح</span>
            </div>
          ),
        });
        router.refresh();
        setIsEditing(false);
      })
      .catch((error) => {
        console.log("error while updating vedio", error);
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
          <p className="text-gray-500 mb-3">الفيديو</p>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>تعديل</Button>
          )}
        </div>
        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="لينك الفيديو من اليوتيوب"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">حفظ</Button>
              <Button
                variant="outline"
                className="mr-3"
                onClick={() => setIsEditing(false)}
              >
                الغاء
              </Button>
            </form>
          </Form>
        ) : (
          <div className="flex items-center justify-between">
            {videoUrl && (
              <iframe
                className="w-full h-[400px]"
                src={videoUrl}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              ></iframe>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
