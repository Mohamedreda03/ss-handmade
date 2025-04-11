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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useState } from "react";
import axios from "axios";
import { BadgeCheck, BadgeInfo, LoaderCircle } from "lucide-react";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "@/hooks/use-toast";
import { Years_Banks } from "@/utils/years_data";

const FormSchema = z.object({
  year: z.string(),
});

export default function CourseYear({
  year,
  courseId,
}: {
  year: string;
  courseId: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      year: year,
    },
  });

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: async (data: z.infer<typeof FormSchema>) => {
      await axios.patch(`/api/courses/${courseId}`, {
        year: data.year,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["courses"]);
      toast({
        description: (
          <div className="flex items-center gap-3">
            <BadgeCheck size={18} className="mr-2 text-green-500" />
            <span>تم تعديل السنة الدرسية بنجاح</span>
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
        <p className="text-gray-500 mb-3">السنة الدرسية</p>
        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select
                        dir="rtl"
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="أختر السنة الدرسية" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Years_Banks.map((year) => (
                            <SelectItem key={year.year} value={year.year}>
                              {year.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "جاري التحميل..." : "حفظ"}
                {isLoading && (
                  <LoaderCircle className="animate-spin mr-2" size={18} />
                )}
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
              {Years_Banks.find((y) => y.year === year)?.name}
            </h3>
            <Button onClick={() => setIsEditing(true)}>تعديل</Button>
          </div>
        )}
      </div>
    </div>
  );
}
