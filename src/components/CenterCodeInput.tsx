"use client";

import { LoaderCircle, QrCode, Wallet } from "lucide-react";
import { Button } from "./ui/button";
import axios from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "./ui/form";
import CustomInput from "./CustomInput";

import { useMutation, useQueryClient } from "react-query";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const SigninSchema = z.object({
  code: z
    .string()
    .min(18, {
      message: "يجب أن يكون الكود مكونًا من 18 حرفًا ورقم.",
    })
    .max(18, {
      message: "يجب ألا يزيد الكود عن 18 حرفًا ورقمًا.",
    }),
});

export default function CenterCodeInput() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const form = useForm<z.infer<typeof SigninSchema>>({
    resolver: zodResolver(SigninSchema),
  });

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: async (code: string) => {
      const res = await axios.patch(`/api/coupons`, {
        code,
      });

      if (res.data.success === false) {
        toast.error(res.data.message as string);
      }

      if (res.data.success === true) {
        toast.success(res.data.message as string);
        form.reset({
          code: "",
        });
        queryClient.invalidateQueries(["sub"]);
      }
    },
  });

  const onSubmit = async (dataI: z.infer<typeof SigninSchema>) => {
    await mutateAsync(dataI.code);
  };

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col-reverse lg:flex-row lg:gap-7 gap-3"
        >
          <Button className="h-12 text-lg mt-3 lg:mt-0" disabled={isLoading}>
            شحن كود السنتر
            {isLoading && (
              <LoaderCircle className="animate-spin text-white mr-2" />
            )}
          </Button>
          <div className="flex flex-col w-full">
            <CustomInput
              disabled={isLoading}
              className=""
              Icon={QrCode}
              placeholder="الكود"
              name="code"
              control={form.control}
              error={form.formState.errors.code?.message}
            />
          </div>
        </form>
      </Form>
    </div>
  );
}
