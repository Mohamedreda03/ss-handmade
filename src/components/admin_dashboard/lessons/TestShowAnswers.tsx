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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const FormSchema = z.object({
  show_answers: z.boolean().optional(),
});

import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";

import { BadgeCheck, BadgeInfo } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "react-query";
import { Checkbox } from "@/components/ui/checkbox";
export default function TestShowAnswers({
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
      show_answers: lesson?.show_answers,
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
      queryClient.invalidateQueries(["lessons", courseId, chapterId, lessonId]);
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
        <p className="text-gray-500 mb-3">
          السماح برؤية الاجابات بعد الامتحان مباشرة
        </p>
        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="show_answers"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="ml-2"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>رؤية الاجابات بعد الامتحان مباشرة</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

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
              {lesson?.show_answers
                ? "سيتم عرض الاجابات بعد انتهاء الامتحان مباشرة"
                : "لن يتم عرض الاجابات الي بعد انتهاء فترة الامتحان"}
            </h3>
            <Button onClick={() => setIsEditing(true)}>تعديل</Button>
          </div>
        )}
      </div>
    </div>
  );
}
