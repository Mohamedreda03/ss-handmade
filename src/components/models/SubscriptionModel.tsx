"use client";

import { useRouter } from "next/navigation";
import { Alert } from "./Alert";
import axios from "axios";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";

export default function SubscriptionModel({
  courseId,
  coursePrice,
  className,
}: {
  courseId: string;
  coursePrice: number;
  className?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: async () => {
      await axios
        .post(`/api/courses/${courseId}/subscription`, {
          coursePrice,
        })
        .then((res) => {
          if (res.data.status === 400) {
            toast.error("لا يوجد مال كافي");

            return;
          }
          if (res.data.status === 404) {
            toast.error("يرجى تسجيل الدخول اولا");
            return;
          }

          toast.success("تم الاشتراك بنجاح");
          // router.refresh();
        })
        .catch((error) => {
          if (error.response.status === 400) {
            toast.error("لا يوجد مال كافي يرجى شحن الرصيد");
          } else if (error.response.status === 404) {
            toast.error("يرجى تسجيل الدخول اولا");
          }
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries("sub");
    },
  });

  const onClink = async () => {
    await mutateAsync();
    // await axios
    //   .post(`/api/courses/${courseId}/subscription`, {
    //     coursePrice,
    //   })
    //   .then((res) => {
    //     if (res.data.status === 400) {
    //       toast.error("لا يوجد مال كافي");
    //       return;
    //     }
    //     if (res.data.status === 404) {
    //       toast.error("يرجى تسجيل الدخول اولا");
    //       return;
    //     }

    //     toast.success("تم الاشتراك بنجاح");
    //     router.refresh();
    //   })
    //   .catch((error) => {
    //     if (error.response.status === 400) {
    //       toast.error("لا يوجد مال كافي يرجى شحن الرصيد");
    //     } else if (error.response.status === 404) {
    //       toast.error("يرجى تسجيل الدخول اولا");
    //     }
    //   });
  };
  return (
    <>
      <Alert
        dialogTitle="الاشتراك في الكورس"
        dialogDescription={`هل تريد الاشتراك في الكورس مقابل ${coursePrice} جنية ؟`}
        dialogCancel="إلغاء"
        dialogAction="نعم"
        buttonTitle="اشترك الآن !"
        action={onClink}
        isLoading={isLoading}
        buttonStyle={className}
      />
    </>
  );
}
