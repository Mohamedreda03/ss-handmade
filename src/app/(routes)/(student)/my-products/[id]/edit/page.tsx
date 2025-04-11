"use client";

import { useEffect, useState } from "react";
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
import Loading from "@/components/Loading";
import { useMutation } from "react-query";
import { LoaderCircle } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(3, "اسم المنتج لا يقل عن 3 أحرف"),
  description: z.string().optional(),
  price: z.coerce.number().positive("السعر يجب أن يكون رقم موجب"),
  stock: z.coerce.number().positive("السعر يجب أن يكون رقم موجب"),
  imageUrl: z
    .string()
    .url("من فضلك أدخل رابط صحيح")
    .optional()
    .or(z.literal("")),
  isAvailable: z.boolean().default(true),
});

const EditProductPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
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

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      try {
        console.log("Form submitted with values:", values);

        // If there's a new image file, upload it to Supabase and get the URL
        if (imageFile) {
          // Only delete the previous image if it exists
          if (values.imageUrl && values.imageUrl.trim() !== "") {
            await deleteImageFromSupabase(values.imageUrl);
          }
          const url = await uploadImageToSupabase(imageFile);
          values.imageUrl = url;
        }

        const response = await axios.patch(
          `/api/products/${params.id}`,
          values
        );
        console.log("API response:", response.data);

        toast.success("تم تعديل المنتج بنجاح");
        router.refresh(); // Refresh the current route data
        router.push("/my-products");
      } catch (error: any) {
        console.error("Error updating product:", error);
        toast.error(
          error?.response?.data?.error || "حدث خطأ أثناء تحديث المنتج"
        );
      }
    },
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/products/${params.id}`);

        form.reset({
          name: res.data.name,
          description: res.data.description,
          price: res.data.price,
          stock: res.data.stock,
          imageUrl: res.data.imageUrl || "",
          isAvailable: res.data.isAvailable,
        });

        // Set image preview if the product has an image
        if (res.data.imageUrl) {
          setImagePreview(res.data.imageUrl);
        }
      } catch (error) {
        toast.error("خطأ في جلب بيانات المنتج");
        console.error(error);
      }
    };

    fetchProduct();
  }, [params.id, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await mutateAsync(values);
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
          title="تعديل المنتج"
          description="تعديل بيانات المنتج الحالي"
        />
      </div>
      <Separator className="my-4" />

      <div className="mt-6">
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit(onSubmit)(e);
            }}
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
                      disabled={isLoading}
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
                      disabled={isLoading}
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
                        disabled={isLoading}
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
                        disabled={isLoading}
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
                          disabled={isLoading}
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
                            disabled={isLoading}
                          >
                            إزالة الصورة
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>أو</span>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={isLoading}
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
                      disabled={isLoading}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      dir="ltr"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <Button
                disabled={isLoading}
                type="submit"
                onClick={() => {
                  const formState = form.getValues();
                  console.log("Button clicked, form state:", formState);
                  console.log("Form errors:", form.formState.errors);
                }}
              >
                {isLoading ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  "تعديل المنتج"
                )}
              </Button>
              <Button
                disabled={isLoading}
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

export default EditProductPage;
