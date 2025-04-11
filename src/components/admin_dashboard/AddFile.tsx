"use client";

import { Button } from "@/components/ui/button";
// import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { BadgeCheck, Download, File, LoaderCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { deleteFile, uploadFile } from "@/utils/upload";
import { useMutation, useQueryClient } from "react-query";
import {
  deleteFileFromSupabase,
  uploadFileToSupabase,
} from "@/utils/uploadToSupabase";

export default function AddFile({
  fileUrl,
  lessonId,
  courseId,
  chapterId,
}: {
  fileUrl: string;
  lessonId: string;
  courseId: string;
  chapterId: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // const [isLoading, setIsLoading] = useState(false);
  const [progress2, setProgress2] = useState<number | null>(null);
  const [file, setFile] = useState<{ url: string; file: File | null }>({
    url: "",
    file: null,
  });
  // const router = useRouter();
  const queryClient = useQueryClient();

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: async () => {
      if (fileUrl) {
        await deleteFileFromSupabase(fileUrl);
      }
      const filePath = await uploadFileToSupabase(file.file!);

      await axios.patch(
        `/api/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`,
        { fileUrl: filePath }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries("lessons");
      toast({
        description: (
          <div className="flex items-center gap-3">
            <BadgeCheck size={18} className="mr-2 text-green-500" />
            <span>تم رفغ الملف بنجاح.</span>
          </div>
        ),
      });
      setIsEditing(false);
    },
  });

  async function onSubmit() {
    await mutateAsync();
  }

  return (
    <div className="border dark:border-secondary/30 border-secondary/50 w-full rounded-md p-5">
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <p className="text-gray-500 mb-3">الملف</p>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>تعديل</Button>
          )}
        </div>
        {isEditing ? (
          <>
            {progress2 !== null && (
              <div className="mb-4 flex gap-4">
                <span>{progress2.toFixed(0)}%</span>
                <div className="border w-full h-6 flex items-start rounded-full overflow-hidden">
                  <span
                    className={`h-[22px] bg-green-500`}
                    style={{ width: `${progress2}%` }}
                  ></span>
                </div>
              </div>
            )}
            <input
              type="file"
              className="w-full border rounded-md p-2 mb-4"
              ref={inputRef}
              onChange={(e) => {
                setFile({
                  url: URL.createObjectURL(e.target.files![0]),
                  file: e.target.files![0],
                });
              }}
            />

            <div className="mt-auto">
              <Button onClick={onSubmit} disabled={isLoading}>
                {isLoading ? "جاري تحميل الملف" : "حفظ"}
                {isLoading && (
                  <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                )}
              </Button>
              <Button
                variant="outline"
                className="mr-3"
                onClick={() => setIsEditing(false)}
              >
                الغاء
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between">
            {fileUrl ? (
              <div className="relative w-full mt-4">
                <div className="flex items-center justify-between px-4 py-2 border rounded">
                  <div className="flex items-center gap-2">
                    <File className="h-7 w-7 text-sky-400" />
                    <p className="line-clamp-1">{fileUrl.split("/").pop()}</p>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={fileUrl}>
                      <Download className="h-4 w-4 ml-2 cursor-pointer" />
                      <span>قم بتنزيل الملف</span>
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <p>لا يوجد ملف</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
