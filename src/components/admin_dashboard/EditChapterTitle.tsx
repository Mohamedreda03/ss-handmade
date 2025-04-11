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
  title: z.string().min(2, {
    message: "يجب أن يحتوي العنوان على 2 حرف على الأقل",
  }),
});

import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import ActionButton from "../ActionButton";
import { BadgeCheck, BadgeInfo } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function EditChapterTitle({
  title,
  courseId,
  chapterId,
}: {
  title: string;
  courseId: string;
  chapterId: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: title,
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    await axios
      .patch(`/api/courses/${courseId}/chapters/${chapterId}`, data)
      .then(() => {
        router.refresh();
        toast({
          description: (
            <div className="flex items-center gap-3">
              <BadgeCheck size={18} className="mr-2 text-green-500" />
              <span>تم تعديل العنوان بنجاح</span>
            </div>
          ),
        });
        setIsEditing(false);
      })
      .catch((error) => {
        console.log("error while updating title", error);
        toast({
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
  }

  return (
    <div className="border dark:border-secondary/30 border-secondary/50 w-full rounded-md p-5">
      <div className="flex flex-col">
        <p className="text-gray-500 mb-3">العنوان</p>
        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <ActionButton type="submit" isLoading={isLoading} />

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
            <h3 className="text-xl font-semibold">{title}</h3>
            <Button onClick={() => setIsEditing(true)}>تعديل</Button>
          </div>
        )}
      </div>
    </div>
  );
}
