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
  name: z.string().min(2, {
    message: "يجب أن يحتوي العنوان على 2 حرف على الأقل",
  }),
});

import { useState } from "react";
import axios from "axios";
import { BadgeCheck, BadgeInfo } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "react-query";

export default function EditTitle({
  title,
  courseId,
}: {
  title: string;
  courseId: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: title,
    },
  });

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: async (data: z.infer<typeof FormSchema>) => {
      await axios.patch(`/api/courses/${courseId}`, {
        title: data.name,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries("courses");
      toast({
        description: (
          <div className="flex items-center gap-3">
            <BadgeCheck size={18} className="mr-2 text-green-500" />
            <span>تم تعديل العنوان بنجاح</span>
          </div>
        ),
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
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
    <div className="border dark:border-secondary/30 border-secondary/50 w-full rounded-md p-5 shadow-sm">
      <div className="flex flex-col">
        <p className="text-gray-500 mb-3">العنوان</p>
        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                حفظ
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
            <h3 className="text-xl font-semibold">{title}</h3>
            <Button onClick={() => setIsEditing(true)}>تعديل</Button>
          </div>
        )}
      </div>
    </div>
  );
}
