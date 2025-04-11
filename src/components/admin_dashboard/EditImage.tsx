"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Image from "next/image";
import { BadgeCheck, BadgeInfo, LoaderCircle, Upload } from "lucide-react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "react-query";
import {
  deleteImageFromSupabase,
  uploadImageToSupabase,
} from "@/utils/uploadToSupabase";

export default function EditImage({
  image,
  courseId,
}: {
  image: string;
  courseId: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [img, setImg] = useState<{ url: string; file: File | null }>({
    url: "",
    file: null,
  });
  const queryClient = useQueryClient();
  const router = useRouter();

  const upladImage = async (file: File) => {
    return await uploadImageToSupabase(file);
  };

  const deleteImage = async (url: string) => {
    await deleteImageFromSupabase(url);
  };

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: async (data: File) => {
      const imageUrl = await upladImage(data);

      if (image) {
        await deleteImage(image);
      }

      await axios.patch(`/api/courses/${courseId}`, { image: imageUrl });
    },
    onSuccess: () => {
      setIsEditing(false);
      toast({
        description: (
          <div className="flex items-center gap-3">
            <BadgeCheck size={18} className="mr-2 text-green-500" />
            <span>تم تحديث الصورة</span>
          </div>
        ),
      });

      queryClient.invalidateQueries("courses");
    },
  });

  async function onSubmit() {
    await mutateAsync(img.file!);
  }

  return (
    <div className="border dark:border-secondary/30 border-secondary/50 w-full rounded-md p-5 shadow-sm">
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <p className="text-gray-500 mb-3">الصورة</p>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>تعديل</Button>
          )}
        </div>
        {isEditing ? (
          <>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              ref={inputRef}
              onChange={(e) => {
                setImg({
                  url: URL.createObjectURL(e.target.files![0]),
                  file: e.target.files![0],
                });
              }}
            />

            {img.url.length > 0 && (
              <Image
                src={img.url}
                width={250}
                height={200}
                alt="image"
                className="mb-3"
              />
            )}

            <Button
              onClick={() => inputRef.current?.click()}
              variant="outline"
              className="w-60 mb-5"
              disabled={isLoading}
            >
              <Upload size={15} className="ml-2" />
              اختر صورة
            </Button>
            <div className="mt-auto">
              <Button onClick={onSubmit} disabled={isLoading}>
                <span>{isLoading ? "جاري رفع الصوره" : "حفظ"}</span>
                {isLoading && (
                  <LoaderCircle size={20} className="mr-2 animate-spin" />
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
            {image ? (
              <div className="relative w-full mt-4">
                <Image
                  src={image}
                  height={200}
                  width={800}
                  alt="image"
                  className="object-cover rounded"
                />
              </div>
            ) : (
              <p>لا يوجد صورة</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
