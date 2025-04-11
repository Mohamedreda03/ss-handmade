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
  exam_allowed_from: z.string().optional(),
  exam_allowed_to: z.string().optional(),
});

import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";

import { BadgeCheck, BadgeInfo } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "react-query";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
export default function TestFromTo({
  lessonId,
  courseId,
  chapterId,
  lesson,
}: {
  lessonId: string;
  courseId: string;
  chapterId: string;
  lesson: any;
}) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      exam_allowed_from: lesson?.exam_allowed_from || "",
      exam_allowed_to: lesson?.exam_allowed_to || "",
    },
  });

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: async (data: z.infer<typeof FormSchema>) => {
      await axios.patch(
        `/api/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`,
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries("lessons");
      toast({
        description: (
          <div className="flex items-center gap-3">
            <BadgeCheck size={18} className="mr-2 text-green-500" />
            <span>تم تعديل عدد مرات دخول الامتحان بنجاح</span>
          </div>
        ),
      });
      setIsEditing(false);
    },
    onError: (error) => {
      console.log("error while updating price", error);
      toast({
        variant: "destructive",
        description: (
          <div className="flex items-center gap-3">
            <BadgeInfo size={18} className="mr-2 text-red-500" />
            <span>حدث خطأ ما، الرجاء المحاولة مرة اخرى.</span>
          </div>
        ),
      });
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    await mutateAsync(data);
  }

  return (
    <div className="border dark:border-secondary/30 border-secondary/50 w-full rounded-md p-5">
      <div className="flex flex-col">
        <p className="text-gray-500 mb-3">الفترة المتاح بها الدخول للامتحان</p>
        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="flex items-center gap-8">
                <FormField
                  control={form.control}
                  name="exam_allowed_from"
                  render={({ field }) => (
                    <FormItem>
                      <Label>من</Label>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="exam_allowed_to"
                  render={({ field }) => (
                    <FormItem>
                      <Label>الي</Label>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "جاري الحفظ..." : "حفظ"}
              </Button>
              <Button
                variant="outline"
                className="mr-3"
                disabled={isLoading}
                onClick={() => setIsEditing(false)}
              >
                الغاء
              </Button>
            </form>
          </Form>
        ) : (
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">
              <span className="mx-3">من</span>{" "}
              {lesson.exam_allowed_from ? (
                <>
                  {format(
                    new Date(lesson.exam_allowed_from),
                    "eeee, do MMM yyyy, hh:mm a",
                    {
                      locale: ar,
                    }
                  )}{" "}
                </>
              ) : (
                "غير محدد"
              )}
              <span className="mx-3">الي</span>{" "}
              {lesson.exam_allowed_to ? (
                <>
                  {format(
                    new Date(lesson.exam_allowed_to),
                    "eeee, do MMM yyyy, hh:mm a",
                    {
                      locale: ar,
                    }
                  )}
                </>
              ) : (
                "غير محدد"
              )}
            </h3>
            <Button onClick={() => setIsEditing(true)}>تعديل</Button>
          </div>
        )}
      </div>
    </div>
  );
}
