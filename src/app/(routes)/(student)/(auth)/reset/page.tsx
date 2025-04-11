"use client";

import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import Link from "next/link";
import CustomInput from "@/components/CustomInput";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";

import { reset } from "@/actions/reset";
import toast from "react-hot-toast";

import { useTransition } from "react";
import axios from "axios";

const SigninSchema = z.object({
  email: z
    .string()
    .email("البريد الالكتروني غير صحيح")
    .nonempty("البريد الالكتروني مطلوب"),
});

// export const dynamic = "force-dynamic";

export default function ResetPage() {
  const [isPanding, startTransition] = useTransition();
  const form = useForm<z.infer<typeof SigninSchema>>({
    resolver: zodResolver(SigninSchema),
  });

  const onSubmit = async (data: z.infer<typeof SigninSchema>) => {
    startTransition(async () => {
      await axios
        .post("/api/auth/reset", {
          email: data.email,
        })
        .then((res: any) => {
          if (res.data.error) {
            toast.error(res.message);
            return;
          } else {
            toast.success(res.message);
          }
        });
    });
  };

  return (
    <div className="h-[calc(100vh-81px)] w-full flex flex-col lg:flex-row">
      <div className="bg-[url(/img/sin.png)] bg-top lg:min-h-[90vh] h-[40vh] w-full lg:max-w-[700px] bg-cover bg-no-repeat" />
      <div className="flex-[1.2] md:p-10 px-5 py-10 flex items-center justify-center">
        <div className="max-w-screen-sm w-full min-h-[500px] text-lg">
          <h1 className="text-4xl font-bold mb-4">
            هل نسيت <span className="text-secondary">كلمة المرور</span>
          </h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-7">
                <div className="flex flex-col gap-1 my-5">
                  <CustomInput
                    Icon={Mail}
                    placeholder="البريد الالكتروني"
                    name="email"
                    control={form.control}
                    error={form.formState.errors.email?.message}
                  />
                </div>
              </div>

              <div className="flex w-full flex-col gap-2">
                <Button className="h-12 w-full md:text-lg" disabled={isPanding}>
                  إرسال بريد إلكتروني لإعادة التعيين
                </Button>
                <Button variant="link">
                  <Link href="/sign-up">العودة للتسجيل الدخول</Link>
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
