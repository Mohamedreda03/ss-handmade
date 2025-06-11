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
import { useQuery, useMutation, useQueryClient } from "react-query";
import { LoaderCircle } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(3, "اسم المنتج لا يقل عن 3 أحرف"),
  description: z.string().optional(),
  price: z.union([
    z.string().transform((val) => parseFloat(val)),
    z.number()
  ]).refine((val) => val > 0, "السعر يجب أن يكون رقم موجب"),
  stock: z.union([
    z.string().transform((val) => parseInt(val)),
    z.number()
  ]).refine((val) => val >= 0, "الكمية يجب أن تكون رقم موجب أو صفر"),
  imageUrl: z.string().optional().or(z.literal("")),
  isAvailable: z.boolean().default(true),
});

const EditProductPage = ({ params }: { params: { productId: string } }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
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

  // Fetch product data using React Query
  const {
    data: product,
    isLoading: isLoadingProduct,
    error: productError,
  } = useQuery(
    ["product", params.productId],
    async () => {
      const response = await axios.get(
        `/api/admin/products/${params.productId}`
      );
      return response.data;
    },
    {
      onSuccess: (data) => {
        form.reset({
          name: data.name,
          description: data.description || "",
          price: data.price,
          stock: data.stock,
          imageUrl: data.imageUrl || "",
          isAvailable: data.isAvailable,
        });

        // Set image preview if the product has an image
        if (data.imageUrl) {
          setImagePreview(data.imageUrl);
        }
      },
      onError: (error) => {
        console.error("Error fetching product:", error);
        toast.error("خطأ في جلب بيانات المنتج");
      },
    }
  );  // Update product mutation
  const updateProductMutation = useMutation(
    async (values: z.infer<typeof formSchema>) => {
      console.log("🚀 Mutation started with values:", values);
      let finalValues = { 
        ...values,
        // تأكد من أن الأرقام يتم إرسالها كـ numbers وليس strings
        price: typeof values.price === 'string' ? parseFloat(values.price) : values.price,
        stock: typeof values.stock === 'string' ? parseInt(values.stock) : values.stock,
      };

      // If there's a new image file, upload it to Supabase and get the URL
      if (imageFile) {
        console.log("Uploading new image...");
        // Only delete old image if it exists and it's a Supabase URL
        if (finalValues.imageUrl && finalValues.imageUrl.includes("supabase")) {
          await deleteImageFromSupabase(finalValues.imageUrl);
        }
        const url = await uploadImageToSupabase(imageFile);
        finalValues.imageUrl = url;
        console.log("New image URL:", url);
      }

      console.log("🌐 Sending PATCH request to:", `/api/admin/products/${params.productId}`);
      console.log("🌐 With data:", finalValues);

      const response = await axios.patch(
        `/api/admin/products/${params.productId}`,
        finalValues
      );
      
      console.log("✅ Response received:", response.data);
      return response.data;
    },
    {
      onMutate: (variables) => {
        console.log("🔄 Mutation started with variables:", variables);
      },
      onSuccess: (data) => {
        console.log("✅ Mutation successful:", data);
        toast.success("تم تعديل المنتج بنجاح");
        // Invalidate and refetch products list
        queryClient.invalidateQueries(["products"]);
        queryClient.invalidateQueries(["product", params.productId]);
        router.push("/admin/products");
      },
      onError: (error: any) => {
        console.error("❌ Submit error:", error);
        if (error.response) {
          console.error("❌ Error response:", error.response.data);
          toast.error(
            `خطأ: ${error.response.data.message || "حدث خطأ في الخادم"}`
          );
        } else {
          toast.error("حدث خطأ ما");
        }
      },
    }
  );
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("🔥 onSubmit called with values:", values);
    console.log("🔥 Form state:", form.formState);
    console.log("🔥 Form values:", form.getValues());
    console.log("🔥 Mutation state:", updateProductMutation);
    updateProductMutation.mutate(values);
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

  if (isLoadingProduct) {
    return <Loading className="h-[600px]" />;
  }

  if (productError) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            ⚠️ خطأ في تحميل البيانات
          </h2>
          <p className="text-muted-foreground">
            يرجى التحقق من اتصال قاعدة البيانات والمحاولة مرة أخرى
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-screen-md mx-auto">
      {" "}
      <div className="flex items-center justify-between">
        <Heading title="تعديل المنتج" description="تعديل بيانات المنتج" />
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
                  <FormLabel>اسم المنتج</FormLabel>{" "}
                  <FormControl>
                    <Input
                      disabled={updateProductMutation.isLoading}
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
                  <FormLabel>الوصف</FormLabel>{" "}
                  <FormControl>
                    <Textarea
                      disabled={updateProductMutation.isLoading}
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
                    <FormLabel>السعر</FormLabel>{" "}
                    <FormControl>
                      <Input
                        disabled={updateProductMutation.isLoading}
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
                    <FormLabel>الكمية</FormLabel>{" "}
                    <FormControl>
                      <Input
                        disabled={updateProductMutation.isLoading}
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
                        {" "}
                        <Input
                          disabled={updateProductMutation.isLoading}
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
                          <span>أو</span>{" "}
                          <Input
                            disabled={updateProductMutation.isLoading}
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
                  </div>{" "}
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={updateProductMutation.isLoading}
                      dir="ltr"
                    />
                  </FormControl>
                </FormItem>
              )}
            />{" "}            <div className="flex gap-2">
              <Button 
                disabled={updateProductMutation.isLoading} 
                type="submit"
              >
                {updateProductMutation.isLoading ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  "تعديل المنتج"
                )}
              </Button>
              <Button
                disabled={updateProductMutation.isLoading}
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/products")}
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
