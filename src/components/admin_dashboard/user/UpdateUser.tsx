"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PasswordInput } from "@/components/ui/password-input";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { BadgeCheck, BadgeInfo } from "lucide-react";
import { User } from "@prisma/client";
import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { ActionTypes } from "@/utils/actionsTypes";

const FormSchema = z.object({
  role: z.string({
    required_error: "الرجاء اختيار صلاحية المستخدم.",
  }),
  password: z.string().optional(),
});

interface UpdateUserRoleProps {
  user: User;
}

const roles = [
  { value: "STUDENT", label: "طالب" },
  { value: "CONSTRUCTOR", label: "مدرب" },
  { value: "ADMIN", label: "مدير" },
];

export default function UpdateUser({ user }: UpdateUserRoleProps) {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      role: user?.role,
      password: "",
    },
  });
  const {
    mutateAsync: updateUserData,
    isLoading,
    isSuccess,
  } = useMutation({
    mutationFn: async (data: z.infer<typeof FormSchema>) => {
      const response = await axios.patch(`/api/users/${user?.id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["users"]);
      queryClient.invalidateQueries(["users", user?.id]);

      toast({
        description: (
          <div className="flex items-center gap-3">
            <BadgeCheck size={18} className="mr-2 text-green-500" />
            <span>تم تحديث البيانات بنجاح.</span>
          </div>
        ),
      });
    },
    onError: (error: any) => {
      console.error("خطأ في تحديث المستخدم:", error);

      const errorMessage =
        error?.response?.data?.message ||
        "حدث خطأ ما، الرجاء المحاولة مرة أخرى.";

      toast({
        description: (
          <div className="flex items-center gap-3">
            <BadgeInfo size={18} className="mr-2 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        ),
        variant: "destructive",
      });
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      await updateUserData(data);
    } catch (error) {
      console.log("update user role:", error);
    }
  }

  useEffect(() => {
    form.reset({
      role: user?.role,
      password: "",
    });
  }, [isSuccess, form, user?.role]);
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4 text-primary">
            تحديث بيانات المستخدم
          </h3>

          <div className="grid gap-5 lg:grid-cols-2 grid-cols-1">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>كلمة المرور الجديدة (اختياري)</FormLabel>
                  <PasswordInput
                    disabled={isLoading}
                    {...field}
                    placeholder="اتركه فارغاً إذا لم تريد تغيير كلمة المرور"
                    dir="rtl"
                    className="text-right"
                  />
                  <p className="text-xs text-muted-foreground">
                    * اتركه فارغاً إذا لم تريد تغيير كلمة المرور
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>صلاحية المستخدم</FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    value={field.value}
                    dir="rtl"
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الصلاحية" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-6 max-w-[250px] w-full text-lg h-12"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                جاري الحفظ...
              </div>
            ) : (
              "حفظ التغييرات"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
