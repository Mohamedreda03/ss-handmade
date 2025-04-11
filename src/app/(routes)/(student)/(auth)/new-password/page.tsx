"use client";

import { Button } from "@/components/ui/button";
import { Key } from "lucide-react";
import Link from "next/link";
import CustomInput from "@/components/CustomInput";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";

import toast from "react-hot-toast";

import { Suspense, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

const SigninSchema = z.object({
  password: z.string().min(8),
});

export const dynamic = "force-dynamic";
function NewPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [isPanding, startTransition] = useTransition();
  const form = useForm<z.infer<typeof SigninSchema>>({
    resolver: zodResolver(SigninSchema),
  });

  const onSubmit = async (data: z.infer<typeof SigninSchema>) => {
    startTransition(async () => {
      await axios
        .patch("/api/auth/new_password", {
          token: token,
          password: data.password,
        })
        .then((res: any) => {
          if (res.data.error) {
            toast.error(res.message);
            return;
          } else {
            toast.success(res.message);
            router.push("/sign-in");
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
            اعادة تعيين <span className="text-secondary mb-5">كلمة المرور</span>
          </h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="">
                <div className="flex flex-col gap-1 mb-6 mt-10">
                  <CustomInput
                    Icon={Key}
                    placeholder="كلمة المرور الجديدة"
                    type="password"
                    name="password"
                    control={form.control}
                    error={form.formState.errors.password?.message}
                  />
                </div>
              </div>

              <div className="flex w-full flex-col gap-2">
                <Button className="h-12 w-full" disabled={isPanding}>
                  تعيين كلمة المرور الجديدة
                </Button>
                <Link href="/sign-up" className="w-fit">
                  العودة لتسجيل الدخول
                </Link>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default function NewPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewPasswordContent />
    </Suspense>
  );
}
