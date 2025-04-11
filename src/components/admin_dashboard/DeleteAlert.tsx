"use client";

import axios from "axios";
import { Alert } from "../models/Alert";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { BadgeCheck, BadgeInfo } from "lucide-react";
import { useMutation, useQueryClient } from "react-query";
import { useState } from "react";

export default function DeleteAlert({
  buttonTitle,
  dialogTitle,
  dialogDescription,
  apiEndpoint,
  toastMessage,
  redirect,
  queryKey,
}: {
  buttonTitle: string;
  dialogTitle: string;
  dialogDescription: string;
  apiEndpoint: string;
  toastMessage: string;
  redirect: string;
  queryKey?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { mutateAsync } = useMutation({
    mutationFn: async () => {
      await axios.delete(apiEndpoint).catch((error) => {
        setIsLoading(false);
      });
    },
    onSuccess: () => {
      toast({
        description: (
          <div className="flex items-center gap-3">
            <BadgeCheck size={18} className="mr-2 text-green-500" />
            <span>{toastMessage}</span>
          </div>
        ),
      });
      queryClient.invalidateQueries(queryKey);
      router.push(redirect);
    },
    onError: () => {
      toast({
        description: (
          <div className="flex items-center gap-3">
            <BadgeInfo size={18} className="mr-2 text-red-500" />
            <span>حدث خطأ ما، الرجاء المحاولة مرة اخرى.</span>
          </div>
        ),
      });
    },
  });

  const handleAction = async () => {
    setIsLoading(true);
    await mutateAsync();
  };

  return (
    <Alert
      buttonTitle={buttonTitle}
      dialogTitle={dialogTitle}
      dialogDescription={dialogDescription}
      dialogCancel="الغاء"
      dialogAction="مسح"
      action={handleAction}
      isLoading={isLoading}
    />
  );
}
