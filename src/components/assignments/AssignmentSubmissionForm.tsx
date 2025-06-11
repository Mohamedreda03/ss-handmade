"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  FileText,
  Image as ImageIcon,
  Video,
  Upload,
  X,
  Check,
} from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import Image from "next/image";

const submissionSchema = z.object({
  submissionType: z.enum(["FILE", "IMAGE", "VIDEO"], {
    required_error: "يجب اختيار نوع الإجابة",
  }),
  studentNote: z.string().optional(),
});

interface AssignmentSubmissionFormProps {
  assignment: {
    id: string;
    title: string;
    allowFileSubmission: boolean;
    allowImageSubmission: boolean;
    allowVideoSubmission: boolean;
    dueDate?: Date;
  };
  existingSubmission?: {
    id: string;
    submissionType: string;
    fileUrl?: string;
    imageUrl?: string;
    videoUrl?: string;
    studentNote?: string;
    isSubmitted: boolean;
  };
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AssignmentSubmissionForm({
  assignment,
  existingSubmission,
  onSubmit,
  onCancel,
  isLoading = false,
}: AssignmentSubmissionFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>(
    existingSubmission?.fileUrl ||
      existingSubmission?.imageUrl ||
      existingSubmission?.videoUrl ||
      ""
  );
  const [uploadingFile, setUploadingFile] = useState(false);

  const form = useForm<z.infer<typeof submissionSchema>>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      submissionType:
        (existingSubmission?.submissionType as "FILE" | "IMAGE" | "VIDEO") ||
        undefined,
      studentNote: existingSubmission?.studentNote || "",
    },
  });

  const selectedType = form.watch("submissionType");

  // التحقق من انتهاء الموعد
  const isDeadlinePassed =
    assignment.dueDate && new Date() > new Date(assignment.dueDate);
  const isAlreadySubmitted = existingSubmission?.isSubmitted;

  const getAvailableTypes = () => {
    const types = [];
    if (assignment.allowFileSubmission) {
      types.push({
        value: "FILE",
        label: "ملف",
        icon: FileText,
        accept: ".pdf,.doc,.docx,.txt,.zip,.rar",
      });
    }
    if (assignment.allowImageSubmission) {
      types.push({
        value: "IMAGE",
        label: "صورة",
        icon: ImageIcon,
        accept: "image/*",
      });
    }
    if (assignment.allowVideoSubmission) {
      types.push({
        value: "VIDEO",
        label: "فيديو",
        icon: Video,
        accept: "video/*",
      });
    }
    return types;
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("submissionType", selectedType);

      const response = await axios.post("/api/upload/submission", formData);

      if (response.data.success) {
        setUploadedFileUrl(response.data.fileUrl);
        toast.success("تم رفع الملف بنجاح");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("فشل في رفع الملف");
    } finally {
      setUploadingFile(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadedFileUrl("");
  };

  const handleSubmit = async (data: z.infer<typeof submissionSchema>) => {
    try {
      if (!uploadedFileUrl) {
        toast.error("يجب رفع ملف للإجابة");
        return;
      }

      const submitData = {
        submissionType: data.submissionType,
        studentNote: data.studentNote,
        fileUrl: data.submissionType === "FILE" ? uploadedFileUrl : null,
        imageUrl: data.submissionType === "IMAGE" ? uploadedFileUrl : null,
        videoUrl: data.submissionType === "VIDEO" ? uploadedFileUrl : null,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("حدث خطأ في إرسال الإجابة");
    }
  };

  if (isDeadlinePassed && !isAlreadySubmitted) {
    return (
      <Card dir="rtl">
        <CardContent className="text-center py-8">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-600 mb-2">
            انتهت مهلة تسليم المهمة
          </h3>
          <p className="text-gray-600">
            انتهت مهلة تسليم هذه المهمة في{" "}
            {new Date(assignment.dueDate!).toLocaleString("ar")}
          </p>
          <Button onClick={onCancel} variant="outline" className="mt-4">
            العودة
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isAlreadySubmitted) {
    return (
      <Card dir="rtl">
        <CardContent className="text-center py-8">
          <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-600 mb-2">
            تم إرسال الإجابة
          </h3>
          <p className="text-gray-600 mb-4">
            تم إرسال إجابتك بنجاح وهي الآن في انتظار التقييم
          </p>
          <div className="space-y-2">
            <p className="text-sm">
              <strong>نوع الإجابة:</strong>{" "}
              {existingSubmission?.submissionType === "FILE"
                ? "ملف"
                : existingSubmission?.submissionType === "IMAGE"
                ? "صورة"
                : existingSubmission?.submissionType === "VIDEO"
                ? "فيديو"
                : ""}
            </p>
            {existingSubmission?.studentNote && (
              <p className="text-sm">
                <strong>الملاحظة:</strong> {existingSubmission.studentNote}
              </p>
            )}
          </div>
          <Button onClick={onCancel} variant="outline" className="mt-4">
            العودة
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div dir="rtl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إرسال الإجابة - {assignment.title}</CardTitle>
              <p className="text-sm text-gray-600">
                اختر نوع الإجابة وارفع الملف المطلوب
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* اختيار نوع الإجابة */}
              <FormField
                control={form.control}
                name="submissionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع الإجابة *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                      >
                        {getAvailableTypes().map(
                          ({ value, label, icon: Icon }) => (
                            <div
                              key={value}
                              className="flex items-center space-x-2 space-x-reverse"
                            >
                              <RadioGroupItem value={value} id={value} />
                              <label
                                htmlFor={value}
                                className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 flex-1"
                              >
                                <Icon className="w-5 h-5" />
                                <span>{label}</span>
                              </label>
                            </div>
                          )
                        )}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* رفع الملف */}
              {selectedType && (
                <div className="space-y-4">
                  <h4 className="font-medium">
                    ارفع{" "}
                    {selectedType === "FILE"
                      ? "الملف"
                      : selectedType === "IMAGE"
                      ? "الصورة"
                      : "الفيديو"}
                  </h4>

                  {uploadedFileUrl ? (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {selectedType === "FILE" && (
                            <FileText className="w-5 h-5 text-blue-600" />
                          )}{" "}
                          {selectedType === "IMAGE" && (
                            <ImageIcon className="w-5 h-5 text-green-600" />
                          )}
                          {selectedType === "VIDEO" && (
                            <Video className="w-5 h-5 text-purple-600" />
                          )}
                          <span>
                            تم رفع{" "}
                            {selectedType === "FILE"
                              ? "الملف"
                              : selectedType === "IMAGE"
                              ? "الصورة"
                              : "الفيديو"}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeFile}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>{" "}
                      {/* معاينة المحتوى */}
                      {selectedType === "IMAGE" && (
                        <Image
                          src={uploadedFileUrl}
                          alt="معاينة الصورة"
                          width={600}
                          height={300}
                          className="max-w-full max-h-48 object-contain rounded"
                        />
                      )}
                      {selectedType === "VIDEO" && (
                        <video
                          controls
                          className="max-w-full max-h-48 rounded"
                          preload="metadata"
                        >
                          <source src={uploadedFileUrl} />
                        </video>
                      )}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <div className="space-y-2">
                        <Input
                          type="file"
                          accept={
                            getAvailableTypes().find(
                              (t) => t.value === selectedType
                            )?.accept
                          }
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setSelectedFile(file);
                              handleFileUpload(file);
                            }
                          }}
                          disabled={uploadingFile}
                          className="max-w-xs mx-auto"
                        />
                        {uploadingFile && (
                          <p className="text-sm text-blue-600">
                            جاري رفع الملف...
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ملاحظة الطالب */}
              <FormField
                control={form.control}
                name="studentNote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ملاحظة إضافية (اختياري)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="أضف أي ملاحظات أو توضيحات لإجابتك..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* أزرار الإجراءات */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading || !uploadedFileUrl || uploadingFile}
                  className="flex-1"
                >
                  {isLoading ? "جاري الإرسال..." : "إرسال الإجابة"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  إلغاء
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
