"use client";

import React, { useState } from "react";
import { useQuery } from "react-query";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, AlertCircle, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Credit card validation schema
const paymentFormSchema = z.object({
  cardNumber: z
    .string()
    .min(16, "يجب أن يحتوي رقم البطاقة على 16 رقم على الأقل")
    .max(19, "رقم البطاقة غير صحيح")
    .regex(/^[0-9\s]+$/, "رقم البطاقة يجب أن يحتوي على أرقام فقط"),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "صيغة غير صحيحة، استخدم MM/YY")
    .refine(
      (value) => {
        const [month, year] = value.split("/");
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;
        const expYear = parseInt(year, 10);
        const expMonth = parseInt(month, 10);

        return (
          expYear > currentYear ||
          (expYear === currentYear && expMonth >= currentMonth)
        );
      },
      { message: "البطاقة منتهية الصلاحية" }
    ),
  cvv: z
    .string()
    .min(3, "CVV يجب أن يحتوي على 3 أرقام على الأقل")
    .max(4, "CVV يجب أن لا يزيد عن 4 أرقام")
    .regex(/^[0-9]+$/, "CVV يجب أن يحتوي على أرقام فقط"),
  cardholderName: z
    .string()
    .min(3, "اسم صاحب البطاقة يجب أن يحتوي على 3 أحرف على الأقل")
    .max(50, "اسم صاحب البطاقة طويل جدًا"),
});

// Define the type for the form values
type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export default function CheckoutCoursePage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [discount, setDiscount] = useState(0);
  const [couponId, setCouponId] = useState<string | null>(null);

  // Get courseId from params
  const courseId = params.courseId as string;

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["checkout-course", courseId],
    queryFn: async () => {
      // If courseId is available, fetch the specific course
      if (courseId) {
        const response = await axios.get(`/api/courses/${courseId}`);
        return response.data.data;
      }
      return null;
    },
    enabled: !!courseId,
  });

  // Form handling
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
    },
  });

  const handleCheckout = async (values: PaymentFormValues) => {
    try {
      setIsLoading(true);
      // Create a random invoice ID
      const invoice_id = Math.floor(Math.random() * 1000000).toString();
      const invoice_ref =
        "REF-" + Math.floor(Math.random() * 1000000).toString();

      // Calculate final price after discount
      const finalPrice = course?.price - discount;

      // Create payment record
      await axios.post("/api/payment", {
        amount: finalPrice,
        invoice_id,
        invoice_ref,
        couponId: couponId,
        paymentDetails: {
          cardNumber: values.cardNumber.replace(/\s/g, ""),
          expiryDate: values.expiryDate,
          cvv: values.cvv,
          cardholderName: values.cardholderName,
        },
      });

      // After creating payment, redirect to success page or handle accordingly
      router.push("/success-payment");
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      setApplyingCoupon(true);
      setCouponMessage(null);

      const response = await axios.patch("/api/coupons", {
        code: couponCode,
        amount: course?.price,
        validateOnly: true, // دائماً نضيف هذا المعامل للتحقق من صلاحية الكوبون فقط دون تفعيله
      });

      if (response.data.success) {
        // استخدام قيمة الخصم التي تأتي من الخادم
        setDiscount(response.data.discount);
        setCouponId(response.data.couponId);
        setCouponMessage({
          type: "success",
          message: response.data.message,
        });
      }
    } catch (error: any) {
      console.error("Apply coupon error:", error);
      setCouponMessage({
        type: "error",
        message: error.response?.data?.message || "حدث خطأ أثناء تطبيق الكوبون",
      });
      setDiscount(0);
      setCouponId(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  // Card number formatting helper
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  if (courseLoading) {
    return <Loading className="h-[70vh]" />;
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-xl">الكورس غير متاح</p>
      </div>
    );
  }

  const finalPrice = course.price - discount;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-center mb-8 border-b pb-4 border-gray-200">
          إتمام عملية الشراء
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Course Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6 border-b pb-3">
              معلومات الكورس
            </h2>

            <div className="flex items-start gap-4 mb-6">
              {course.image ? (
                <div className="relative w-28 h-28">
                  <Image
                    src={course.image}
                    fill
                    alt={course.title}
                    className="rounded-md object-cover"
                  />
                </div>
              ) : (
                <div className="w-28 h-28 bg-gray-200 rounded-md flex items-center justify-center">
                  <span className="text-gray-400">لا توجد صورة</span>
                </div>
              )}

              <div className="flex-1">
                <h3 className="text-lg font-medium">{course.title}</h3>
                <div
                  className="inline mr-2 html-content line-clamp-2"
                  dangerouslySetInnerHTML={{
                    __html: course.description || "",
                  }}
                />
              </div>
            </div>

            {/* Coupon Code Input */}
            <div className="mt-6 mb-4">
              <h3 className="text-md font-semibold mb-2 flex items-center">
                <Tag size={18} className="ml-1" />
                هل لديك كوبون خصم؟
              </h3>
              <div className="flex gap-2">
                <Input
                  placeholder="أدخل كود الخصم"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="text-right flex-1"
                  disabled={applyingCoupon}
                  dir="ltr"
                />
                <Button
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon || !couponCode.trim()}
                  variant="outline"
                >
                  {applyingCoupon ? "جاري التطبيق..." : "تطبيق"}
                </Button>
              </div>

              {couponMessage && (
                <Alert
                  className={`mt-2 ${
                    couponMessage.type === "success"
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  <AlertCircle className="h-4 w-4 ml-2" />
                  <AlertDescription>{couponMessage.message}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <span className="text-gray-600">سعر الكورس</span>
                <span className="font-semibold">{course.price} جنيه</span>
              </div>

              {discount > 0 && (
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <span className="text-green-600">الخصم</span>
                  <span className="font-semibold text-green-600">
                    - {discount} جنيه
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <span className="text-gray-600">الضريبة</span>
                <span className="font-semibold">0 جنيه</span>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <span className="font-medium text-lg">الإجمالي</span>
                <span className="font-bold text-lg">
                  {finalPrice} جنيه
                  {discount > 0 && (
                    <span className="text-sm text-gray-500 line-through mr-2">
                      {course.price} جنيه
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6 border-b pb-3">
              اختر وسيلة الدفع
            </h2>

            <div className="space-y-4">
              {/* Credit Card Option */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="rounded-full h-6 w-6 flex items-center justify-center border-2 border-black">
                    <Check size={14} className="text-black" />
                  </div>
                  <CreditCard className="h-6 w-6 text-gray-800" />
                  <span className="font-medium">الدفع بالبطاقة البنكية</span>
                </div>

                <div className="mt-6">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(handleCheckout)}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="cardNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              رقم البطاقة
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="XXXX XXXX XXXX XXXX"
                                dir="ltr"
                                onChange={(e) => {
                                  field.onChange(
                                    formatCardNumber(e.target.value)
                                  );
                                }}
                                maxLength={19}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="expiryDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">
                                تاريخ الانتهاء
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="MM/YY"
                                  dir="ltr"
                                  maxLength={5}
                                  onChange={(e) => {
                                    let value = e.target.value.replace(
                                      /[^\d]/g,
                                      ""
                                    );
                                    if (value.length > 2) {
                                      value =
                                        value.substring(0, 2) +
                                        "/" +
                                        value.substring(2);
                                    }
                                    field.onChange(value.slice(0, 5));
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cvv"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">
                                رمز الأمان
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="password"
                                  placeholder="CVV"
                                  dir="ltr"
                                  maxLength={4}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(
                                      /[^\d]/g,
                                      ""
                                    );
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="cardholderName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              اسم صاحب البطاقة
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="الاسم كما هو على البطاقة"
                                className="text-right"
                                dir="ltr"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={isLoading || !form.formState.isValid}
                        className="w-full py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-md transition-colors mt-6"
                      >
                        {isLoading
                          ? "جاري المعالجة..."
                          : `إتمام الدفع - ${finalPrice} جنيه`}
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>

              <p className="text-sm text-gray-500 text-center mt-4">
                بالضغط على زر إتمام الدفع، أنت توافق على شروط الخدمة وسياسة
                الخصوصية
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
