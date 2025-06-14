"use client";

import { Button } from "@/components/ui/button";
import {
  BadgeCheck,
  BadgeInfo,
  Key,
  LoaderCircle,
  Mail,
  User2,
  Briefcase,
  FileText,
  Upload,
  Link2,
  Users,
} from "lucide-react";
import Link from "next/link";

import { useForm } from "react-hook-form";
import CustomInput from "@/components/CustomInput";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import { GoogleButton } from "@/components/GoogleButton";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { uploadFileToSupabase } from "@/utils/uploadToSupabase";

// Schema for regular user signup
const UserSignupSchema = z
  .object({
    name: z.string().min(3, "الاسم مطلوب"),
    email: z.string().email("البريد الالكتروني غير صحيح"),
    password: z
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
    re_password: z
      .string()
      .nonempty("تأكيد كلمة السر مطلوبة")
      .min(8, "كلمة السر يجب ان تكون 8 احرف على الاقل"),
  })
  .superRefine(({ re_password, password }, ctx) => {
    if (re_password !== password) {
      ctx.addIssue({
        code: "custom",
        message: "كلمة السر غير متطابقة",
        path: ["re_password"],
      });
    }
  });

// Schema for contractor signup
const ContractorSignupSchema = z
  .object({
    name: z.string().min(3, "الاسم مطلوب"),
    email: z.string().email("البريد الالكتروني غير صحيح"),
    password: z
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
    re_password: z
      .string()
      .nonempty("تأكيد كلمة السر مطلوبة")
      .min(8, "كلمة السر يجب ان تكون 8 احرف على الاقل"),
    bio: z.string().min(50, "النبذة يجب أن تكون 50 حرف على الأقل"),
    specialization: z.string().min(3, "التخصص مطلوب"),
    experience: z.string().min(1, "سنوات الخبرة مطلوبة"),
    linkedinUrl: z
      .string()
      .url("رابط LinkedIn غير صحيح")
      .optional()
      .or(z.literal("")),
    portfolioUrl: z
      .string()
      .url("رابط الموقع الشخصي غير صحيح")
      .optional()
      .or(z.literal("")),
  })
  .superRefine(({ re_password, password }, ctx) => {
    if (re_password !== password) {
      ctx.addIssue({
        code: "custom",
        message: "كلمة السر غير متطابقة",
        path: ["re_password"],
      });
    }
  });

export const dynamic = "force-dynamic";
export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<"user" | "contractor">("user");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const router = useRouter();

  const userForm = useForm<z.infer<typeof UserSignupSchema>>({
    resolver: zodResolver(UserSignupSchema),
  });

  const contractorForm = useForm<z.infer<typeof ContractorSignupSchema>>({
    resolver: zodResolver(ContractorSignupSchema),
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setCvFile(file);
    } else {
      toast({
        description: (
          <div className="flex items-center gap-3" dir="rtl">
            <BadgeInfo size={18} className="ml-2 text-red-500" />
            <span>يجب اختيار ملف PDF فقط</span>
          </div>
        ),
      });
    }
  };
  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileUrl = await uploadFileToSupabase(file);
      return fileUrl;
    } catch (error) {
      console.error("File upload error:", error);
      return null;
    }
  };

  const onUserSubmit = async (data: z.infer<typeof UserSignupSchema>) => {
    setIsLoading(true);
    await axios
      .post("/api/auth/sign-up", data)
      .then((res: any) => {
        if (res.data.error) {
          toast({
            description: (
              <div className="flex items-center gap-3" dir="rtl">
                <BadgeInfo size={18} className="ml-2 text-red-500" />
                <span>{res.data.message}</span>
              </div>
            ),
          });
          return;
        } else {
          router.push("/sign-in");
          toast({
            description: (
              <div className="flex items-center gap-3" dir="rtl">
                <BadgeCheck size={18} className="ml-2 text-green-500" />
                <span>{res.data.message}</span>
              </div>
            ),
          });
        }
      })
      .finally(() => setIsLoading(false));
  };

  const onContractorSubmit = async (
    data: z.infer<typeof ContractorSignupSchema>
  ) => {
    if (!cvFile) {
      toast({
        description: (
          <div className="flex items-center gap-3" dir="rtl">
            <BadgeInfo size={18} className="ml-2 text-red-500" />
            <span>السيرة الذاتية مطلوبة</span>
          </div>
        ),
      });
      return;
    }

    setIsLoading(true);

    try {
      // Upload CV file first
      const cvUrl = await uploadFile(cvFile);
      if (!cvUrl) {
        throw new Error("فشل في رفع السيرة الذاتية");
      }

      // Prepare contractor data
      const contractorData = {
        ...data,
        role: "CONSTRUCTOR",
        contractorProfile: {
          bio: data.bio,
          specialization: data.specialization,
          experience: data.experience,
          linkedinUrl: data.linkedinUrl || null,
          portfolioUrl: data.portfolioUrl || null,
          cvUrl: cvUrl,
          cvFileName: cvFile.name,
        },
      };

      const response = await axios.post(
        "/api/contractors/register",
        contractorData
      );
      if (response.data.error) {
        toast({
          description: (
            <div className="flex items-center gap-3" dir="rtl">
              <BadgeInfo size={18} className="ml-2 text-red-500" />
              <span>{response.data.message}</span>
            </div>
          ),
        });
        return;
      }

      router.push("/sign-in");
      toast({
        description: (
          <div className="flex items-center gap-3" dir="rtl">
            <BadgeCheck size={18} className="ml-2 text-green-500" />
            <span>تم التسجيل بنجاح. سيتم مراجعة طلبك خلال 48 ساعة</span>
          </div>
        ),
      });
    } catch (error: any) {
      toast({
        description: (
          <div className="flex items-center gap-3" dir="rtl">
            <BadgeInfo size={18} className="ml-2 text-red-500" />
            <span>{error.response?.data?.message || "حدث خطأ في التسجيل"}</span>
          </div>
        ),
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div
      className="min-h-screen bg-[#F4F4F0] relative overflow-hidden"
      dir="rtl"
    >
      {/* Background decorative elements */}
      {/* <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 right-20 w-32 h-32 bg-[#6F7354]/20 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-[#BEB4DA]/30 rounded-full opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-[#F0D8C3]/40 rounded-full opacity-40 animate-pulse delay-500"></div>
        <div className="absolute top-10 left-1/2 w-20 h-20 bg-[#6F7354]/15 rounded-full opacity-30 animate-pulse delay-700"></div>
      </div> */}

      {/* Main content container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#6F7354] to-[#888C69] rounded-full mb-6 shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#6F7354] to-[#888C69] bg-clip-text text-transparent">
                انشئ
              </span>{" "}
              <span className="bg-gradient-to-r from-[#6F7354] to-[#888C69] bg-clip-text text-transparent">
                حسابك الآن
              </span>
            </h1>
            <p className="text-xl text-[#585858] max-w-2xl mx-auto">
              اختر نوع الحساب المناسب لك وانضم إلى مجتمعنا الإبداعي
            </p>
          </div>
          {/* Tabs Container */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
            <Tabs
              value={userType}
              onValueChange={(value) =>
                setUserType(value as "user" | "contractor")
              }
              className="w-full"
              dir="rtl"
            >
              <TabsList className="grid w-full grid-cols-2 mb-10 h-16 bg-gradient-to-r from-[#6F7354]/20 to-[#888C69]/20 backdrop-blur-sm rounded-2xl p-2">
                <TabsTrigger
                  value="user"
                  className="flex items-center gap-3 h-12 text-lg font-medium rounded-xl text-gray-700 hover:text-gray-900 bg-transparent hover:bg-white/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6F7354] data-[state=active]:to-[#888C69] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 ease-out will-change-transform"
                  style={{ backgroundColor: "transparent" }}
                >
                  <Users className="w-5 h-5" />
                  مستخدم عادي
                </TabsTrigger>
                <TabsTrigger
                  value="contractor"
                  className="flex items-center gap-3 h-12 text-lg font-medium rounded-xl text-gray-700 hover:text-gray-900 bg-transparent hover:bg-white/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6F7354] data-[state=active]:to-[#888C69] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 ease-out will-change-transform"
                  style={{ backgroundColor: "transparent" }}
                >
                  <Briefcase className="w-5 h-5" />
                  مُنسق
                </TabsTrigger>
              </TabsList>
              <TabsContent value="user" className="mt-0">
                <Card
                  className="border-0 shadow-xl bg-white/90 rounded-2xl overflow-hidden backdrop-blur-sm"
                  dir="rtl"
                >
                  <CardHeader className="text-right bg-gradient-to-r from-[#6F7354] to-[#888C69] text-white p-8">
                    <CardTitle className="flex items-center gap-3 justify-start text-2xl font-bold">
                      <div className="p-2 bg-white/20 rounded-full">
                        <Users className="w-6 h-6" />
                      </div>
                      تسجيل مستخدم عادي
                    </CardTitle>
                    <CardDescription className="text-[#F4F4F0] text-lg mt-2">
                      للمستخدمين الذين يريدون شراء المنتجات والدورات واستكشاف
                      عالم الحرف اليدوية
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="mb-8">
                      <GoogleButton isSignUp={true} callbackUrl="/" />
                    </div>
                    <div className="flex items-center my-8">
                      <Separator className="flex-1 bg-[#BEB4DA]/30" />
                      <span className="mx-6 bg-gradient-to-r from-[#6F7354] to-[#888C69] text-white text-lg font-medium px-4 py-2 rounded-full shadow-sm">
                        أو
                      </span>
                      <Separator className="flex-1 bg-[#BEB4DA]/30" />
                    </div>
                    <Form {...userForm}>
                      <form
                        onSubmit={userForm.handleSubmit(onUserSubmit)}
                        className="space-y-8"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <CustomInput
                            error={userForm.formState.errors.name?.message}
                            control={userForm.control}
                            name="name"
                            Icon={User2}
                            placeholder="الاسم الكامل"
                          />
                          <CustomInput
                            error={userForm.formState.errors.email?.message}
                            control={userForm.control}
                            name="email"
                            Icon={Mail}
                            placeholder="البريد الالكتروني"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <CustomInput
                            error={userForm.formState.errors.password?.message}
                            control={userForm.control}
                            name="password"
                            Icon={Key}
                            placeholder="كلمة السر"
                            type="password"
                          />
                          <CustomInput
                            error={
                              userForm.formState.errors.re_password?.message
                            }
                            control={userForm.control}
                            name="re_password"
                            Icon={Key}
                            placeholder="تأكيد كلمة السر"
                            type="password"
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full h-14 text-xl font-semibold bg-gradient-to-r from-[#6F7354] to-[#888C69] hover:from-[#5A5F44] hover:to-[#6F7354] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                          disabled={isLoading}
                          dir="rtl"
                        >
                          {isLoading ? (
                            <>
                              <LoaderCircle className="animate-spin ml-3 h-6 w-6" />
                              جاري إنشاء الحساب...
                            </>
                          ) : (
                            <>
                              <Users className="ml-3 h-6 w-6" />
                              إنشاء حساب مستخدم
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="contractor" className="mt-0">
                <Card
                  className="border-0 shadow-xl bg-gradient-to-br from-white/90 to-[#F0D8C3]/50 rounded-2xl overflow-hidden backdrop-blur-sm"
                  dir="rtl"
                >
                  <CardHeader className="text-right bg-gradient-to-r from-[#6F7354] to-[#888C69] text-white p-8">
                    <CardTitle className="flex items-center gap-3 justify-start text-2xl font-bold">
                      <div className="p-2 bg-white/20 rounded-full">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      تسجيل مُنسق
                    </CardTitle>
                    <CardDescription className="text-[#F4F4F0] text-lg mt-2">
                      للحرفيين والمصنعين الذين يريدون بيع منتجاتهم على المنصة
                      ومشاركة خبراتهم
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <Form {...contractorForm}>
                      <form
                        onSubmit={contractorForm.handleSubmit(
                          onContractorSubmit
                        )}
                        className="space-y-10"
                      >
                        {/* Basic Information */}
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-gradient-to-r from-[#6F7354] to-[#888C69] rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                1
                              </span>
                            </div>
                            <h3 className="font-bold text-xl text-[#3D402C]">
                              البيانات الأساسية
                            </h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <CustomInput
                              error={
                                contractorForm.formState.errors.name?.message
                              }
                              control={contractorForm.control}
                              name="name"
                              Icon={User2}
                              placeholder="الاسم الكامل"
                            />
                            <CustomInput
                              error={
                                contractorForm.formState.errors.email?.message
                              }
                              control={contractorForm.control}
                              name="email"
                              Icon={Mail}
                              placeholder="البريد الالكتروني"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <CustomInput
                              error={
                                contractorForm.formState.errors.password
                                  ?.message
                              }
                              control={contractorForm.control}
                              name="password"
                              Icon={Key}
                              placeholder="كلمة السر"
                              type="password"
                            />
                            <CustomInput
                              error={
                                contractorForm.formState.errors.re_password
                                  ?.message
                              }
                              control={contractorForm.control}
                              name="re_password"
                              Icon={Key}
                              placeholder="تأكيد كلمة السر"
                              type="password"
                            />
                          </div>
                        </div>
                        {/* Professional Information */}
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-gradient-to-r from-[#6F7354] to-[#888C69] rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                2
                              </span>
                            </div>
                            <h3 className="font-bold text-xl text-[#3D402C]">
                              المعلومات المهنية
                            </h3>
                          </div>
                          <FormField
                            control={contractorForm.control}
                            name="bio"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-right text-lg font-semibold text-[#3D402C] flex items-center gap-2">
                                  <FileText className="w-5 h-5 text-[#6F7354]" />
                                  نبذة عنك *
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="اكتب نبذة مفصلة عن خبراتك ومهاراتك في مجال الأعمال اليدوية... (50 حرف على الأقل)"
                                    className="min-h-[120px] text-right text-lg border-2 border-[#F0E0D9] focus:border-[#6F7354] rounded-xl p-4 resize-none transition-all duration-300 bg-white/70 backdrop-blur-sm"
                                    dir="rtl"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={contractorForm.control}
                              name="specialization"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-right text-lg font-semibold text-[#3D402C] flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-[#6F7354]" />
                                    التخصص *
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="مثال: صناعة الفخار، النسيج، الأعمال الخشبية"
                                      className="text-right text-lg border-2 border-[#F0E0D9] focus:border-[#6F7354] rounded-xl p-4 h-14 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                                      dir="rtl"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={contractorForm.control}
                              name="experience"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-right text-lg font-semibold text-[#3D402C] flex items-center gap-2">
                                    <BadgeCheck className="w-5 h-5 text-[#6F7354]" />
                                    سنوات الخبرة *
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="مثال: 5 سنوات"
                                      className="text-right text-lg border-2 border-[#F0E0D9] focus:border-[#6F7354] rounded-xl p-4 h-14 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                                      dir="rtl"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        {/* Links and CV */}
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-gradient-to-r from-[#6F7354] to-[#888C69] rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                3
                              </span>
                            </div>
                            <h3 className="font-bold text-xl text-[#3D402C]">
                              الروابط والسيرة الذاتية
                            </h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={contractorForm.control}
                              name="linkedinUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-right text-lg font-semibold text-[#3D402C] flex items-center gap-2">
                                    <Link2 className="w-5 h-5 text-[#6F7354]" />
                                    رابط LinkedIn (اختياري)
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="https://linkedin.com/in/username"
                                      className="text-left text-lg border-2 border-[#F0E0D9] focus:border-[#6F7354] rounded-xl p-4 h-14 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={contractorForm.control}
                              name="portfolioUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-right text-lg font-semibold text-[#3D402C] flex items-center gap-2">
                                    <Link2 className="w-5 h-5 text-[#6F7354]" />
                                    رابط الموقع الشخصي (اختياري)
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="https://your-portfolio.com"
                                      className="text-left text-lg border-2 border-[#F0E0D9] focus:border-[#6F7354] rounded-xl p-4 h-14 transition-all duration-300 bg-white/70 backdrop-blur-sm"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          {/* CV Upload Section */}
                          <div className="space-y-4">
                            <FormLabel className="text-right text-lg font-semibold text-[#3D402C] flex items-center gap-2">
                              <FileText className="w-5 h-5 text-[#6F7354]" />
                              السيرة الذاتية (PDF) *
                            </FormLabel>
                            <div className="relative">
                              <div
                                className="border-2 border-dashed border-[#BEB4DA] hover:border-[#6F7354] rounded-2xl p-8 text-center bg-gradient-to-br from-[#F0E0D9]/30 to-[#F0D8C3]/30 hover:from-[#F0E0D9]/50 hover:to-[#F0D8C3]/50 transition-all duration-300 cursor-pointer group backdrop-blur-sm"
                                dir="rtl"
                              >
                                <input
                                  type="file"
                                  accept=".pdf"
                                  onChange={handleFileUpload}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  id="cv-upload"
                                />
                                <div className="flex flex-col items-center">
                                  <div className="w-16 h-16 bg-gradient-to-r from-[#6F7354] to-[#888C69] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <Upload className="w-8 h-8 text-white" />
                                  </div>
                                  <p className="text-lg font-semibold text-[#3D402C] mb-2">
                                    {cvFile
                                      ? "تم اختيار الملف"
                                      : "اضغط لرفع السيرة الذاتية"}
                                  </p>
                                  <p className="text-sm text-[#585858]">
                                    {cvFile ? (
                                      <span className="flex items-center gap-2 text-[#6F7354]">
                                        <BadgeCheck className="w-4 h-4" />
                                        {cvFile.name}
                                      </span>
                                    ) : (
                                      "PDF فقط، حد أقصى 10 ميجابايت"
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Notice Section */}
                        <div
                          className="bg-gradient-to-r from-[#F0E0D9]/60 to-[#F0D8C3]/60 border-r-4 border-r-[#6F7354] rounded-xl p-6 shadow-sm backdrop-blur-sm"
                          dir="rtl"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <BadgeInfo className="w-6 h-6 text-[#6F7354] mt-1" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-[#3D402C] mb-2">
                                معلومات مهمة
                              </h4>
                              <p className="text-[#3D402C]/80 text-right leading-relaxed">
                                سيتم مراجعة طلبك من قبل الإدارة خلال
                                <strong className="text-[#6F7354]">
                                  48 ساعة
                                </strong>
                                . ستصلك رسالة على البريد الإلكتروني بنتيجة
                                المراجعة مع تفاصيل الخطوات التالية.
                              </p>
                            </div>
                          </div>
                        </div>
                        {/* Submit Button */}
                        <Button
                          type="submit"
                          className="w-full h-16 text-xl font-bold bg-gradient-to-r from-[#6F7354] to-[#888C69] hover:from-[#5A5F44] hover:to-[#6F7354] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isLoading}
                          dir="rtl"
                        >
                          {isLoading ? (
                            <>
                              <LoaderCircle className="animate-spin ml-3 h-7 w-7" />
                              جاري التسجيل...
                            </>
                          ) : (
                            <>
                              <Briefcase className="ml-3 h-7 w-7" />
                              تقديم طلب تسجيل المُنسق
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            {/* Sign In Link */}
            <div className="text-center mt-10">
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <p className="text-lg text-[#3D402C] mb-3">
                  يوجد لديك حساب بالفعل؟
                </p>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6F7354] to-[#888C69] hover:from-[#5A5F44] hover:to-[#6F7354] text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <User2 className="w-5 h-5" />
                  ادخل إلى حسابك الآن
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
