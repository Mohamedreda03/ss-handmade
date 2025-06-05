"use client";

import { Button } from "@/components/ui/button";
import {
  BadgeCheck,
  BadgeInfo,
  Key,
  LoaderCircle,
  Mail,
  User2,
} from "lucide-react";
import Link from "next/link";
import CustomInput from "@/components/CustomInput";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useTransition } from "react";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import { signIn } from "next-auth/react";
import { GoogleButton } from "@/components/GoogleButton";
import { Separator } from "@/components/ui/separator";

const SigninSchema = z.object({
  email: z.string().email("البريد الالكتروني غير صحيح"),
  password: z
    .string()
    .min(8, "كلمة المرور يجب ان تكون 8 احرف علي الاقل")
    .max(50, "كلمة المرور يجب ان تكون 50 حرف علي الاكثر"),
});

export const dynamic = "force-dynamic";
export default function SignIn() {
  const [isPanding, startTransition] = useTransition();
  const form = useForm<z.infer<typeof SigninSchema>>({
    resolver: zodResolver(SigninSchema),
  });
  const onSubmit = async (data: z.infer<typeof SigninSchema>) => {
    startTransition(async () => {
      await axios
        .post("/api/auth/sign-in", {
          email: data.email,
          password: data.password,
        })
        .then(async (res: any) => {
          if (res.data.error) {
            // عرض رسائل مخصصة حسب حالة الكونستراكتور
            const contractorStatus = res.data.contractorStatus;
            let description = res.data.message;
            let variant: "destructive" | "default" = "destructive";

            if (contractorStatus === "PENDING") {
              description = (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BadgeInfo size={18} className="text-amber-500" />
                    <span className="font-semibold">طلبك قيد المراجعة</span>
                  </div>{" "}
                  <p className="text-sm">
                    حسابك ككونستراكتور لا زال تحت المراجعة من قبل الإدارة. يرجى
                    المحاولة مرة أخرى لاحقاً.
                  </p>
                </div>
              );
              variant = "default";
            } else if (contractorStatus === "REJECTED") {
              description = (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BadgeInfo size={18} className="text-red-500" />
                    <span className="font-semibold">تم رفض الطلب</span>
                  </div>{" "}
                  <p className="text-sm">
                    تم رفض طلب التسجيل ككونستراكتور. يمكنك مراجعة بياناتك وإعادة
                    التقديم أو التواصل مع الإدارة للحصول على مزيد من التفاصيل.
                  </p>
                </div>
              );
            } else if (contractorStatus === "SUSPENDED") {
              description = (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BadgeInfo size={18} className="text-orange-500" />
                    <span className="font-semibold">الحساب معلق مؤقتاً</span>
                  </div>{" "}
                  <p className="text-sm">
                    تم تعليق حسابك ككونستراكتور مؤقتاً. يرجى التواصل مع الإدارة
                    لمعرفة أسباب التعليق وخطوات إعادة التفعيل.
                  </p>
                </div>
              );
            } else {
              description = (
                <div className="flex items-center gap-3">
                  <BadgeInfo size={18} className="mr-2 text-red-500" />
                  <span>{res.data.message}</span>
                </div>
              );
            }

            toast({
              description,
              variant,
              duration: contractorStatus ? 8000 : 5000, // مدة أطول للرسائل المفصلة
            });
            return;
          } else {
            await signIn("credentials", {
              email: data.email,
              password: data.password,
              redirectTo: "/",
            });

            toast({
              description: (
                <div className="flex items-center gap-3">
                  <BadgeCheck size={18} className="mr-2 text-green-500" />
                  <span>{res.data.message}</span>
                </div>
              ),
            });
          }
        });
    });
  };

  return (
    <div
      className="min-h-screen bg-[#F4F4F0] relative overflow-hidden"
      dir="rtl"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-[#6F7354]/20 to-[#888C69]/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-32 left-20 w-48 h-48 bg-gradient-to-br from-[#888C69]/20 to-[#6F7354]/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-[#6F7354]/10 to-[#888C69]/10 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#6F7354] to-[#888C69] rounded-full mb-6 shadow-lg">
              <User2 className="w-8 h-8 text-white" />
            </div>{" "}
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#6F7354] to-[#888C69] bg-clip-text text-transparent">
                تسجيل
              </span>{" "}
              <span className="bg-gradient-to-r from-[#6F7354] to-[#888C69] bg-clip-text text-transparent">
                الدخول
              </span>
            </h1>
            <p className="text-lg text-[#585858] max-w-md mx-auto">
              ادخل على حسابك بإدخال البريد الإلكتروني وكلمة المرور
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
            <Card
              className="border-0 shadow-none bg-transparent rounded-none overflow-visible"
              dir="rtl"
            >
              <CardHeader className="text-center pb-6 px-0">
                <CardTitle className="text-2xl font-bold text-[#3D402C] mb-2">
                  أهلاً بك مرة أخرى
                </CardTitle>
                <CardDescription className="text-[#585858] text-base">
                  قم بتسجيل الدخول للوصول إلى حسابك
                </CardDescription>
              </CardHeader>

              <CardContent className="px-0">
                <div className="mb-6">
                  <GoogleButton callbackUrl="/" />
                </div>

                <div className="flex items-center my-6">
                  <Separator className="flex-1 bg-[#BEB4DA]/30" />
                  <span className="mx-6 bg-gradient-to-r from-[#6F7354] to-[#888C69] text-white text-base font-medium px-4 py-2 rounded-full shadow-sm">
                    أو
                  </span>
                  <Separator className="flex-1 bg-[#BEB4DA]/30" />
                </div>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <CustomInput
                      Icon={Mail}
                      placeholder="البريد الإلكتروني"
                      name="email"
                      control={form.control}
                      error={form.formState.errors.email?.message}
                      dir="ltr"
                    />

                    <CustomInput
                      Icon={Key}
                      placeholder="كلمة المرور"
                      type="password"
                      name="password"
                      control={form.control}
                      error={form.formState.errors.password?.message}
                      dir="ltr"
                    />

                    <Button
                      type="submit"
                      className="w-full h-14 text-xl font-semibold bg-gradient-to-r from-[#6F7354] to-[#888C69] hover:from-[#5A5F44] hover:to-[#6F7354] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                      disabled={isPanding}
                      dir="rtl"
                    >
                      {isPanding ? (
                        <>
                          <LoaderCircle className="animate-spin ml-3 h-6 w-6" />
                          جاري تسجيل الدخول...
                        </>
                      ) : (
                        <>
                          <User2 className="ml-3 h-6 w-6" />
                          تسجيل الدخول
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Sign Up Link */}
            <div className="text-center mt-8">
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <p className="text-lg text-[#3D402C] mb-3">
                  ليس لديك حساب بعد؟
                </p>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6F7354] to-[#888C69] hover:from-[#5A5F44] hover:to-[#6F7354] text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <User2 className="w-5 h-5" />
                  أنشئ حسابك الآن
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
