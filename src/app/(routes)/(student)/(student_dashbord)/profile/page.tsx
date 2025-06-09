"use client";

import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import { useQuery } from "react-query";
import { useState } from "react";
import { Lock, Eye, EyeOff, User, Mail, Shield, Hash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Schema for password update with complex validation
const PasswordUpdateSchema = z
  .object({
    newPassword: z
      .string()
      .nonempty("كلمة السر مطلوبة")
      .min(8, "كلمة السر يجب ان تكون 8 احرف على الاقل")
      .max(100, "كلمة السر يجب ان تكون اقل من 100 حرف")
      .regex(/[a-z]/, "كلمة السر يجب ان تحتوي على حرف صغير واحد على الاقل")
      .regex(/[A-Z]/, "كلمة السر يجب ان تحتوي على حرف كبير واحد على الاقل")
      .regex(/[0-9]/, "كلمة السر يجب ان تحتوي على رقم واحد على الاقل")
      .regex(
        /[^a-zA-Z0-9]/,
        "كلمة السر يجب ان تحتوي على رمز خاص واحد على الاقل"
      ),
    confirmPassword: z
      .string()
      .nonempty("تأكيد كلمة السر مطلوبة")
      .min(8, "كلمة السر يجب ان تكون 8 احرف على الاقل"),
  })
  .superRefine(({ confirmPassword, newPassword }, ctx) => {
    if (confirmPassword !== newPassword) {
      ctx.addIssue({
        code: "custom",
        message: "كلمة السر غير متطابقة",
        path: ["confirmPassword"],
      });
    }
  });

export const dynamic = "force-dynamic";
export default function ProfilePage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  // Initialize form with react-hook-form and zod validation
  const form = useForm({
    resolver: zodResolver(PasswordUpdateSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const data = await axios
        .get("/api/auth_user_data")
        .then((res) => res.data);

      return data.user;
    },
  });
  // التحقق من نوع تسجيل الدخول
  const isGoogleUser = data?.accounts?.some(
    (account: any) => account.provider === "google"
  );
  const hasPassword = data?.password !== null && data?.password !== undefined;
  // إخفاء قسم كلمة المرور إذا كان المستخدم مسجل بـ Google فقط ولا يملك كلمة مرور
  const shouldShowPasswordSection = !isGoogleUser || hasPassword;

  const handlePasswordUpdate = async (
    values: z.infer<typeof PasswordUpdateSchema>
  ) => {
    setIsUpdatingPassword(true);
    try {
      await axios.post("/api/update-password", {
        newPassword: values.newPassword,
      });
      toast({
        title: "تم بنجاح",
        description: hasPassword
          ? "تم تحديث كلمة المرور بنجاح"
          : "تم إنشاء كلمة المرور بنجاح",
      });

      form.reset();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description:
          error?.response?.data?.message || "حدث خطأ أثناء تحديث كلمة المرور",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (isLoading) {
    return <Loading className="h-[70vh]" />;
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mb-6">
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {data?.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">{data?.email}</p>
              <Badge
                variant={isGoogleUser ? "default" : "secondary"}
                className="text-xs"
              >
                {isGoogleUser && hasPassword
                  ? "حساب مختلط"
                  : isGoogleUser
                  ? "حساب Google"
                  : "حساب عادي"}
              </Badge>
            </div>
          </div>
        </div>
        {/* Personal Information */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-right flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              المعلومات الشخصية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  الاسم
                </Label>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {data?.name || "غير محدد"}
                  </span>
                </div>
              </div>
              {/* User ID */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  معرف المستخدم
                </Label>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="font-mono text-sm text-gray-600 dark:text-gray-300">
                    {data?.id}
                  </span>
                </div>
              </div>{" "}
              {/* Email */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  البريد الإلكتروني
                </Label>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {data?.email || "غير محدد"}
                  </span>
                </div>
              </div>
              {/* Account Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  نوع الحساب
                </Label>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Badge
                    variant={isGoogleUser ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {isGoogleUser && hasPassword
                      ? "حساب مختلط"
                      : isGoogleUser
                      ? "حساب Google"
                      : "حساب عادي"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* تغيير كلمة المرور - يظهر فقط للمستخدمين العاديين أو المستخدمين Google الذين لديهم كلمة مرور */}
        {shouldShowPasswordSection && (
          <Card className="border-l-4 border-l-primary/50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
              <CardTitle className="text-right flex items-center gap-3 text-lg">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <span className="text-gray-800 dark:text-gray-200">
                  {hasPassword ? "تغيير كلمة المرور" : "إنشاء كلمة مرور"}
                </span>
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-right mt-2">
                {hasPassword
                  ? "قم بإدخال كلمة مرور جديدة لحسابك (يجب أن تحتوي على حرف صغير، حرف كبير، رقم، ورمز خاص)"
                  : "قم بإنشاء كلمة مرور لحسابك (يجب أن تحتوي على حرف صغير، حرف كبير، رقم، ورمز خاص)"}
              </p>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handlePasswordUpdate)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            {hasPassword
                              ? "كلمة المرور الجديدة"
                              : "كلمة المرور"}
                          </FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <Input
                                {...field}
                                type={showPassword ? "text" : "password"}
                                placeholder={
                                  hasPassword
                                    ? "أدخل كلمة المرور الجديدة"
                                    : "أدخل كلمة المرور"
                                }
                                className="pr-12 h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-primary rounded-lg transition-all duration-200 bg-gray-50/50 dark:bg-gray-800/50"
                                dir="rtl"
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Lock className="h-4 w-4 text-gray-500" />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 hover:bg-primary/10 rounded-md transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-500" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-right" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            {hasPassword
                              ? "تأكيد كلمة المرور الجديدة"
                              : "تأكيد كلمة المرور"}
                          </FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <Input
                                {...field}
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder={
                                  hasPassword
                                    ? "أعد إدخال كلمة المرور الجديدة"
                                    : "أعد إدخال كلمة المرور"
                                }
                                className="pr-12 h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-primary rounded-lg transition-all duration-200 bg-gray-50/50 dark:bg-gray-800/50"
                                dir="rtl"
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Lock className="h-4 w-4 text-gray-500" />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 hover:bg-primary/10 rounded-md transition-colors"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-500" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-right" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Password Requirements */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3 text-right">
                      متطلبات كلمة المرور:
                    </h4>
                    <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-2 text-right">
                      <li className="flex items-center justify-end gap-2">
                        <span>8 أحرف على الأقل</span>
                        {form.watch("newPassword")?.length >= 8 ? (
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        ) : (
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                        )}
                      </li>
                      <li className="flex items-center justify-end gap-2">
                        <span>حرف صغير واحد على الأقل (a-z)</span>
                        {/[a-z]/.test(form.watch("newPassword") || "") ? (
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        ) : (
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                        )}
                      </li>
                      <li className="flex items-center justify-end gap-2">
                        <span>حرف كبير واحد على الأقل (A-Z)</span>
                        {/[A-Z]/.test(form.watch("newPassword") || "") ? (
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        ) : (
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                        )}
                      </li>
                      <li className="flex items-center justify-end gap-2">
                        <span>رقم واحد على الأقل (0-9)</span>
                        {/[0-9]/.test(form.watch("newPassword") || "") ? (
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        ) : (
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                        )}
                      </li>
                      <li className="flex items-center justify-end gap-2">
                        <span>رمز خاص واحد على الأقل (!@#$%^&*)</span>
                        {/[^a-zA-Z0-9]/.test(
                          form.watch("newPassword") || ""
                        ) ? (
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        ) : (
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                        )}
                      </li>
                      <li className="flex items-center justify-end gap-2">
                        <span>تطابق كلمتي المرور</span>
                        {form.watch("newPassword") &&
                        form.watch("confirmPassword") &&
                        form.watch("newPassword") ===
                          form.watch("confirmPassword") ? (
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        ) : (
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                        )}
                      </li>
                    </ul>
                  </div>

                  <div className="flex justify-center pt-2">
                    <Button
                      type="submit"
                      disabled={isUpdatingPassword}
                      className="px-8 py-3 h-12 text-sm font-semibold bg-primary hover:bg-primary/90 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
                    >
                      {isUpdatingPassword ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          جاري التحديث...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          {hasPassword
                            ? "تحديث كلمة المرور"
                            : "إنشاء كلمة المرور"}
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
