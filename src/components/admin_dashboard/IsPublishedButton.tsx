"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { BadgeCheck, BadgeInfo, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "react-query";

export default function IsPublishedButton({
  isPublished,
  apiEndpoint,
  disabled,
  queryKeys,
}: {
  isPublished: boolean;
  apiEndpoint: string;
  disabled?: boolean;
  queryKeys?: string;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [isPublishedState, setIsPublishedState] = useState(isPublished);

  const { mutateAsync } = useMutation({
    mutationFn: async () => {
      await axios.patch(apiEndpoint, {
        isPublished: !isPublished,
      });
      setIsPublishedState(!isPublished);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys);
      router.refresh();

      if (isPublished) {
        toast({
          description: (
            <div className="flex items-center gap-3">
              <BadgeCheck size={18} className="mr-2 text-green-500" />
              <span>تم الغاء النشر بنجاح</span>
            </div>
          ),
        });
      }
      if (!isPublished) {
        toast({
          description: (
            <div className="flex items-center gap-3">
              <BadgeCheck size={18} className="mr-2 text-green-500" />
              <span>تم نشر الدرس بنجاح</span>
            </div>
          ),
        });
      }
    },
  });

  const handlePublish = async () => {
    try {
      await mutateAsync();
    } catch (error) {
      console.log("error while publishing lesson", error);
      toast({
        description: (
          <div className="flex items-center gap-3">
            <BadgeInfo size={18} className="mr-2 text-red-500" />
            <span>حدث خطأ ما، الرجاء المحاولة مرة اخرى.</span>
          </div>
        ),
      });
    }
  };

  return (
    <>
      {isPublishedState ? (
        <Button
          onClick={handlePublish}
          variant="outline"
          className="mr-5 disabled:opacity-50"
        >
          <EyeOff size={16} className="ml-1" />
          <span>الغاء النشر</span>
        </Button>
      ) : (
        <Button disabled={disabled} onClick={handlePublish} className="mr-5">
          <Eye size={16} className="ml-1" />
          <span>نشر</span>
        </Button>
      )}
    </>
  );
}
