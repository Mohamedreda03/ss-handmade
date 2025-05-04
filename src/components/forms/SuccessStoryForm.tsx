"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/image-upload";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "يجب أن يحتوي الاسم على حرفين على الأقل",
  }),
  profession: z.string().min(2, {
    message: "يجب إدخال المهنة",
  }),
  story: z.string().min(20, {
    message: "يجب أن تحتوي القصة على 20 حرفًا على الأقل",
  }),
  achievement: z.string().min(3, {
    message: "يجب إدخال الإنجاز",
  }),
  course: z.string().optional(),
  imageUrl: z.string().optional(),
});

type SuccessStoryFormValues = z.infer<typeof formSchema>;

interface SuccessStoryFormProps {
  initialData?: any;
}

export const SuccessStoryForm = ({ initialData }: SuccessStoryFormProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SuccessStoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      profession: "",
      story: "",
      achievement: "",
      course: "",
      imageUrl: "",
    },
  });

  const onSubmit = async (values: SuccessStoryFormValues) => {
    try {
      setIsSubmitting(true);

      if (initialData) {
        // تحديث قصة موجودة
        await axios.put(`/api/user/success-stories`, {
          id: initialData.id,
          ...values,
        });

        if (initialData.status === "APPROVED") {
          toast.success(
            "تم تحديث قصة النجاح بنجاح! تم إعادتها إلى قيد المراجعة وستظهر مجدداً بعد موافقة المشرف."
          );
        } else {
          toast.success("تم تحديث قصة النجاح بنجاح! ستبقى قيد المراجعة.");
        }
      } else {
        // إنشاء قصة جديدة
        await axios.post("/api/success-stories", values);
        toast.success(
          "تم إضافة قصة النجاح بنجاح! ستكون قيد المراجعة وستظهر بعد موافقة المشرف."
        );
        form.reset();
      }

      router.refresh();
    } catch (error) {
      toast.error("حدث خطأ أثناء حفظ قصة النجاح");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-6 text-right">
        {initialData ? "تعديل قصة النجاح" : "أضف قصة نجاحك"}
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 rtl">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-right block">الاسم</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isSubmitting} dir="rtl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="profession"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-right block">
                  المهنة / التخصص
                </FormLabel>
                <FormControl>
                  <Input {...field} disabled={isSubmitting} dir="rtl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="achievement"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-right block">
                  الإنجاز الرئيسي
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isSubmitting}
                    dir="rtl"
                    placeholder="مثال: زيادة الدخل 200%"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="course"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-right block">
                  الدورة التعليمية (اختياري)
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isSubmitting}
                    dir="rtl"
                    placeholder="اسم الدورة التي ساعدتك"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="story"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-right block">قصة نجاحك</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    disabled={isSubmitting}
                    dir="rtl"
                    rows={8}
                    placeholder="شارك قصتك وكيف ساعدتك المنصة في تحقيق أهدافك..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-right block">
                  صورتك الشخصية
                </FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value || ""}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جار الحفظ...
                </>
              ) : initialData ? (
                "تحديث قصة النجاح"
              ) : (
                "إضافة قصة النجاح"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
