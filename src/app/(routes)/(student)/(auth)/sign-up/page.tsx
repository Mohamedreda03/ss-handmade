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

import { useForm } from "react-hook-form";
import CustomInput from "@/components/CustomInput";
import { Form } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import { GoogleButton } from "@/components/GoogleButton";
import { Separator } from "@/components/ui/separator";

const SignupSchema = z
  .object({
    name: z.string().min(3, "الاسم مطلوب"),
    email: z.string().email("البريد الالكتروني غير صحيح"),
    password: z
      .string()
      .nonempty("كلمة السر مطلوبة")
      .min(8, "كلمة السر يجب ان تكون 8 احرف على الاقل"),
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

export const dynamic = "force-dynamic";
export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof SignupSchema>>({
    resolver: zodResolver(SignupSchema),
  });

  const onSubmit = async (data: z.infer<typeof SignupSchema>) => {
    setIsLoading(true);
    await axios
      .post("/api/auth/sign-up", data)
      .then((res: any) => {
        if (res.data.error) {
          toast({
            description: (
              <div className="flex items-center gap-3">
                <BadgeInfo size={18} className="mr-2 text-red-500" />
                <span>{res.data.message}</span>
              </div>
            ),
          });
          return;
        } else {
          router.push("/sign-in");
          toast({
            description: (
              <div className="flex items-center gap-3">
                <BadgeCheck size={18} className="mr-2 text-green-500" />
                <span>{res.data.message}</span>
              </div>
            ),
          });
        }
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      <div className="bg-[url(/img/sin.png)] bg-top lg:min-h-screen h-[50vh] w-full lg:max-w-[500px] xl:max-w-[700px]  bg-cover bg-no-repeat" />

      <div className="md:flex-[1.2] mx-auto md:p-10 px-5 py-10 flex items-center justify-center h-full mt-8">
        <div className="max-w-screen-sm w-full h-full text-lg">
          <h1 className="text-4xl font-bold mb-4 text-first">
            انشئ <span> حسابك الآن</span>
          </h1>
          <p className="mb-10 mt-5 text-muted-foreground">
            ادخل بياناتك بشكل صحيح للحصول علي افضل تجربة داخل الموقع
          </p>

          <GoogleButton isSignUp={true} callbackUrl="/" />

          <div className="flex items-center my-6">
            <Separator className="flex-1" />
            <span className="mx-4 text-muted-foreground text-sm">أو</span>
            <Separator className="flex-1" />
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 h-full md:mx-auto"
            >
              <div className="flex flex-col md:flex-row gap-8">
                <div className="group w-full">
                  <CustomInput
                    error={form.formState.errors.name?.message}
                    control={form.control}
                    name="name"
                    Icon={User2}
                    placeholder="الاسم"
                  />
                </div>
              </div>

              <CustomInput
                error={form.formState.errors.email?.message}
                control={form.control}
                name="email"
                Icon={Mail}
                placeholder="البريد الالكتروني"
              />

              <div className="flex flex-col md:flex-row gap-8">
                <div className="group w-full">
                  <CustomInput
                    error={form.formState.errors.password?.message}
                    control={form.control}
                    name="password"
                    Icon={Key}
                    placeholder="كلمة السر"
                    type="password"
                  />
                </div>

                <div className="group w-full">
                  <CustomInput
                    error={form.formState.errors.re_password?.message}
                    control={form.control}
                    name="re_password"
                    Icon={Key}
                    placeholder="تأكيد كلمة السر"
                    type="password"
                  />
                </div>
              </div>

              <div className="w-full flex flex-col gap-3">
                <Button
                  className="h-12 w-full text-lg flex items-center gap-3"
                  disabled={isLoading}
                >
                  {isLoading ? "جاري انشاء الحساب" : "انشاء الحساب !"}

                  {isLoading && (
                    <LoaderCircle className="animate-spin h-5 w-5" />
                  )}
                </Button>

                <Link href="/sign-in" className="w-fit text-sm">
                  يوجد لديك حساب بالفعل؟<span className="mx-1"></span>
                  <span className="text-primary/80">ادخل إلى حسابك الآن !</span>
                </Link>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
