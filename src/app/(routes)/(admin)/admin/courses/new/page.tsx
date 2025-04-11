"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { useMutation, useQueryClient } from "react-query";

const FormSchema = z.object({
  name: z.string().min(2, {
    message: "العنوان يجب أن يحتوي على 2 حرف على الأقل",
  }),
});

export default function NewCoursePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  // const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
    },
  });

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: async (data: z.infer<typeof FormSchema>) => {
      const res = await axios.post("/api/courses", data);
      router.push(`/admin/courses/${res.data.data.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["courses"]);
      toast({
        description: (
          <div className="flex items-center gap-3">
            <BadgeCheck size={18} className="mr-2 text-green-500" />
            <span>تم إنشاء الكورس بنجاح</span>
          </div>
        ),
      });
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    await mutateAsync(data);
  }
  return (
    <div className="p-5 min-h-[calc(100vh-300px)] flex items-center justify-center">
      <div className="max-w-screen-lg w-full">
        <h1 className="md:text-3xl text-xl font-bold mb-2">
          أختر أسم مناسب <span className="text-primary">للكورس</span>
        </h1>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="md:max-w-screen-md w-full space-y-6 mt-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  {/* <FormLabel className="text-lg">عنوان الكورس</FormLabel> */}
                  <FormControl>
                    <Input placeholder="اسم الكورس" {...field} />
                  </FormControl>
                  <FormDescription>
                    يجب أن يكون العنوان مميز ويحتوي على معلومات عن الكورس
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isLoading} type="submit" className="ml-4">
              إنشاء الكورس
            </Button>

            <Button disabled={isLoading} type="submit" variant="outline">
              الغاء
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
