"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { Button } from "./button";
import axios from "axios";
import { toast } from "react-hot-toast";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export const ImageUpload = ({
  value,
  onChange,
  disabled,
}: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];

    // التحقق من نوع الملف
    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة صالح");
      return;
    }

    // التحقق من حجم الملف (5 ميجابايت كحد أقصى)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // استخدام نقطة نهاية Supabase API
      const response = await axios.post("/api/upload/supabase", formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          }
        },
      });

      if (response.data.success) {
        onChange(response.data.path);
        toast.success("تم رفع الصورة بنجاح");
      } else {
        toast.error(response.data.error || "حدث خطأ أثناء رفع الصورة");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("حدث خطأ أثناء رفع الصورة");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = async () => {
    // هنا يمكن إضافة منطق حذف الصورة من Supabase إذا لزم الأمر
    onChange("");
    toast.success("تم إزالة الصورة");
  };

  return (
    <div className="relative">
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*"
        disabled={disabled || isUploading}
      />

      {value ? (
        <div className="relative w-full h-40 mb-4">
          <Image
            src={value}
            alt="Uploaded image"
            fill
            className="object-cover rounded-md"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white"
            type="button"
            disabled={disabled}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className="border-2 border-dashed border-gray-300 rounded-md p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition mb-4"
        >
          <Upload className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 text-center">
            اضغط هنا لرفع صورة
            <br />
            <span className="text-xs">
              (JPG, JPEG, PNG، بحد أقصى 5 ميجابايت)
            </span>
          </p>
          {isUploading && (
            <div className="mt-4 w-full">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-center mt-1 text-gray-500">
                {uploadProgress}%
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
