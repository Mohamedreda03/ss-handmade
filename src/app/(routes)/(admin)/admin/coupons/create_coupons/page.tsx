"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Download, LoaderCircle, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const CreateCouponsSchema = z
  .object({
    couponType: z.enum(["course", "discount", "product"]),
    discountType: z.enum(["PERCENTAGE", "FIXED"]).default("PERCENTAGE"),
    value: z.coerce.number().min(0),
    numberOfCoupons: z.coerce.number().min(1),
    courseId: z.string().optional(),
    productId: z.string().optional(),
    maxUses: z.coerce.number().min(1).default(1),
    expiresAt: z.date().optional(),
  })
  .superRefine((data, ctx) => {
    // If couponType is product, productId is required
    if (data.couponType === "product" && !data.productId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "يجب اختيار المنتج",
        path: ["productId"],
      });
    }

    // If couponType is course, courseId is required
    if (data.couponType === "course" && !data.courseId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "يجب اختيار الكورس",
        path: ["courseId"],
      });
    }
  });

const CreateCoupons = () => {
  const queryClient = useQueryClient();
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);

  const form = useForm<z.infer<typeof CreateCouponsSchema>>({
    resolver: zodResolver(CreateCouponsSchema),
    defaultValues: {
      couponType: "course",
      discountType: "PERCENTAGE",
      maxUses: 1,
      numberOfCoupons: 1,
    },
  });

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: async (data: z.infer<typeof CreateCouponsSchema>) => {
      const response = await axios.post("/api/coupons", data, {
        responseType: "blob",
      });

      // إنشاء رابط لتنزيل الملف
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadLink(url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["coupons"]);
    },
  });

  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await axios.get("/api/coupons/courses");
      return res.data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await axios.get("/api/products/coupons");
      setSession(res.data.session);
      return res.data.data;
    },
  });

  async function onSubmit(data: z.infer<typeof CreateCouponsSchema>) {
    // Validate that productId is provided if couponType is product
    if (data.couponType === "product" && !data.productId) {
      form.setError("productId", {
        type: "manual",
        message: "يجب اختيار المنتج",
      });
      return;
    }

    // Validate that courseId is provided if couponType is course
    if (data.couponType === "course" && !data.courseId) {
      form.setError("courseId", {
        type: "manual",
        message: "يجب اختيار الكورس",
      });
      return;
    }

    await mutateAsync(data);
  }

  const couponType = form.watch("couponType");

  return (
    <div className="min-h-[70vh] flex flex-col gap-5 items-center justify-center py-8">
      <div className="flex items-center justify-center">
        <h2 className="text-3xl dark:text-white text-first-100 border-b-2 border-first pb-2">
          إنشاء كوبون
        </h2>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="max-w-[400px] w-full space-y-6"
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="couponType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الكوبون</FormLabel>
                  <Select
                    dir="rtl"
                    onValueChange={(value) => {
                      // Reset productId error when type changes
                      if (field.value === "product") {
                        form.clearErrors("productId");
                      }
                      field.onChange(value);
                    }}
                    defaultValue={
                      session?.user?.role === "ADMIN"
                        ? field.value
                        : session?.user?.role === "constructor"
                        ? "product"
                        : "course"
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {session && session.user.role === "ADMIN" && (
                        <>
                          <SelectItem value="discount">خصم عام</SelectItem>
                          <SelectItem value="product">منتج محدد</SelectItem>
                        </>
                      )}
                      {session?.user?.role === "constructor" ? (
                        <SelectItem value="product">منتج محدد</SelectItem>
                      ) : (
                        <SelectItem value="course">كورس محدد</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discountType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الخصم</FormLabel>
                  <Select
                    dir="rtl"
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">نسبة مئوية (%)</SelectItem>
                      <SelectItem value="FIXED">قيمة ثابتة (جنيه)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {form.watch("discountType") === "PERCENTAGE"
                      ? "نسبة الخصم (%)"
                      : "قيمة الخصم (جنيه)"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={
                        form.watch("discountType") === "PERCENTAGE"
                          ? "مثال: 10 ل 10%"
                          : "مثال: 50 جنيه"
                      }
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {couponType === "course" && (
              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الكورس</FormLabel>
                    <Select
                      dir="rtl"
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الكورس" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses?.map((course: any) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {couponType === "product" && (
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      المنتج <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      dir="rtl"
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المنتج" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products?.map((product: any) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    <FormDescription className="text-red-500">
                      حقل إلزامي
                    </FormDescription>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="numberOfCoupons"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عدد الكوبونات</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="العدد"
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
              name="maxUses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الحد الأقصى للاستخدام</FormLabel>
                  <FormDescription>
                    عدد مرات استخدام الكوبون الواحد
                  </FormDescription>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="1"
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
              name="expiresAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>تاريخ انتهاء الصلاحية</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ar })
                          ) : (
                            <span>اختر تاريخ</span>
                          )}
                          <Calendar className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    اختياري - إذا لم يتم تحديد تاريخ، فلن ينتهي الكوبون
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "جاري الإنشاء" : "إنشاء الكوبون"}
            {isLoading && (
              <LoaderCircle size={18} className="animate-spin mr-2" />
            )}
          </Button>
        </form>
      </Form>
      {downloadLink && (
        <Button variant="outline" asChild>
          <a href={downloadLink} download={`coupons-${Date.now()}.txt`}>
            <span>تحميل الكوبونات</span>
            <Download size={18} />
          </a>
        </Button>
      )}
    </div>
  );
};

export default CreateCoupons;
