"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { toast } from "react-hot-toast";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Heading } from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import {
  deleteImageFromSupabase,
  uploadImageToSupabase,
} from "@/utils/uploadToSupabase";

const formSchema = z.object({
  name: z.string().min(3, "اسم المنتج لا يقل عن 3 أحرف"),
  description: z.string().optional(),
  price: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive("السعر يجب أن يكون رقم موجب")
  ),
  stock: z.preprocess(
    (a) => parseInt(z.string().parse(a)),
    z.number().nonnegative("الكمية يجب أن تكون رقم موجب أو صفر")
  ),
  imageUrl: z
    .string()
    .url("من فضلك أدخل رابط صحيح")
    .optional()
    .or(z.literal("")),
  isAvailable: z.boolean().default(true),
});

const NewProductPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      imageUrl: "",
      isAvailable: true,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      // If there's a new image file, upload it to Supabase and get the URL
      if (imageFile) {
        const url = await uploadImageToSupabase(imageFile);
        values.imageUrl = url;
      }

      await axios.post("/api/products", values);
      toast.success("تم إضافة المنتج بنجاح");
      router.push("/my-products");
    } catch (error) {
      toast.error("حدث خطأ ما");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    form.setValue("imageUrl", "");
  };

  return (
    <div className="p-6 max-w-screen-md mx-auto">
      <div className="flex items-center justify-between">
        <Heading
          title="إضافة منتج جديد"
          description="أضف منتجًا جديدًا إلى المتجر"
        />
      </div>
      <Separator className="my-4" />

      <div className="mt-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 max-w-2xl"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم المنتج</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="اسم المنتج"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوصف</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={loading}
                      placeholder="وصف المنتج"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>السعر</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الكمية</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        type="number"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>صورة المنتج</FormLabel>
                  <div className="space-y-4">
                    <FormControl>
                      <div className="flex flex-col space-y-4">
                        <Input
                          disabled={loading}
                          placeholder="https://..."
                          {...field}
                          className={imageFile ? "hidden" : "block"}
                        />
                        <div className={!imageFile ? "hidden" : "block"}>
                          {imagePreview && (
                            <div className="relative w-40 h-40 rounded-md overflow-hidden">
                              <Image
                                src={imagePreview}
                                alt="Product preview"
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleRemoveImage}
                            className="mt-2"
                          >
                            إزالة الصورة
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>أو</span>
                          <Input
                            disabled={loading}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      أدخل رابط صورة المنتج أو قم برفع صورة جديدة
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isAvailable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">متاح للبيع</FormLabel>
                    <FormDescription>
                      هل هذا المنتج متاح للبيع حاليًا؟
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                      dir="ltr"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <Button disabled={loading} type="submit">
                إضافة المنتج
              </Button>
              <Button
                disabled={loading}
                type="button"
                variant="outline"
                onClick={() => router.push("/my-products/")}
              >
                إلغاء
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default NewProductPage;
