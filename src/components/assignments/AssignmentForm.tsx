"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { FileText, Image as ImageIcon, Video, Upload, X } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";

const assignmentSchema = z.object({
  title: z.string().min(3, "العنوان يجب أن يكون 3 أحرف على الأقل"),
  description: z.string().optional(),
  questionText: z.string().optional(),
  courseId: z.string().optional(),
  chapterId: z.string().optional(),
  lessonId: z.string().optional(),
  dueDate: z.string().optional(),
  maxGrade: z
    .number()
    .min(1, "الدرجة يجب أن تكون أكبر من 0")
    .max(1000, "الدرجة لا يمكن أن تزيد عن 1000"),
  allowFileSubmission: z.boolean().default(true),
  allowImageSubmission: z.boolean().default(true),
  allowVideoSubmission: z.boolean().default(true),
});

interface AssignmentFormProps {
  initialData?: any;
  courses?: any[];
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AssignmentForm({
  initialData,
  courses = [],
  onSubmit,
  onCancel,
  isLoading = false,
}: AssignmentFormProps) {
  const [questionFiles, setQuestionFiles] = useState({
    file: null as File | null,
    image: null as File | null,
    video: null as File | null,
  });

  const [questionUrls, setQuestionUrls] = useState({
    fileUrl: initialData?.questionFileUrl || "",
    imageUrl: initialData?.questionImageUrl || "",
    videoUrl: initialData?.questionVideoUrl || "",
  });

  const [uploadingFile, setUploadingFile] = useState<string | null>(null);

  const form = useForm<z.infer<typeof assignmentSchema>>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      questionText: initialData?.questionText || "",
      courseId: initialData?.courseId || "",
      chapterId: initialData?.chapterId || "",
      lessonId: initialData?.lessonId || "",
      dueDate: initialData?.dueDate
        ? new Date(initialData.dueDate).toISOString().slice(0, 16)
        : "",
      maxGrade: initialData?.maxGrade || 100,
      allowFileSubmission: initialData?.allowFileSubmission ?? true,
      allowImageSubmission: initialData?.allowImageSubmission ?? true,
      allowVideoSubmission: initialData?.allowVideoSubmission ?? true,
    },
  });

  const handleFileUpload = async (
    file: File,
    type: "file" | "image" | "video"
  ) => {
    try {
      setUploadingFile(type);
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("/api/upload/assignment", formData);

      if (response.data.success) {
        setQuestionUrls((prev) => ({
          ...prev,
          [`${type}Url`]: response.data.fileUrl,
        }));
        toast.success("تم رفع الملف بنجاح");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("فشل في رفع الملف");
    } finally {
      setUploadingFile(null);
    }
  };

  const removeFile = (type: "file" | "image" | "video") => {
    setQuestionFiles((prev) => ({
      ...prev,
      [type]: null,
    }));
    setQuestionUrls((prev) => ({
      ...prev,
      [`${type}Url`]: "",
    }));
  };

  const handleSubmit = async (data: z.infer<typeof assignmentSchema>) => {
    try {
      // التحقق من وجود سؤال
      if (
        !data.questionText &&
        !questionUrls.fileUrl &&
        !questionUrls.imageUrl &&
        !questionUrls.videoUrl
      ) {
        toast.error("يجب إضافة سؤال واحد على الأقل");
        return;
      }

      // التحقق من السماح بنوع إجابة واحد على الأقل
      if (
        !data.allowFileSubmission &&
        !data.allowImageSubmission &&
        !data.allowVideoSubmission
      ) {
        toast.error("يجب السماح بنوع إجابة واحد على الأقل");
        return;
      }

      const submitData = {
        ...data,
        questionFileUrl: questionUrls.fileUrl || null,
        questionImageUrl: questionUrls.imageUrl || null,
        questionVideoUrl: questionUrls.videoUrl || null,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("حدث خطأ في إرسال البيانات");
    }
  };

  return (
    <div dir="rtl" className="max-w-4xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* معلومات أساسية */}
          <Card>
            <CardHeader>
              <CardTitle>المعلومات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان المهمة *</FormLabel>
                    <FormControl>
                      <Input placeholder="ادخل عنوان المهمة" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وصف المهمة</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="ادخل وصف المهمة (اختياري)"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ الانتهاء</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxGrade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الدرجة العظمى</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="1000"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 100)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* محتوى السؤال */}
          <Card>
            <CardHeader>
              <CardTitle>محتوى السؤال</CardTitle>
              <p className="text-sm text-gray-600">
                يمكنك إضافة السؤال كنص أو رفع ملف يحتوي على السؤال
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="questionText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>السؤال (نص)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="اكتب السؤال هنا..."
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* رفع ملفات السؤال */}
              <div className="space-y-4">
                <h4 className="font-medium">أو ارفع ملف السؤال</h4>

                {/* رفع ملف */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    ملف السؤال (PDF, DOC, etc.)
                  </label>
                  {questionUrls.fileUrl ? (
                    <div className="flex items-center gap-2 p-2 border rounded">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">تم رفع الملف</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile("file")}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setQuestionFiles((prev) => ({ ...prev, file }));
                            handleFileUpload(file, "file");
                          }
                        }}
                        disabled={uploadingFile === "file"}
                      />
                      {uploadingFile === "file" && (
                        <span className="text-sm">جاري الرفع...</span>
                      )}
                    </div>
                  )}
                </div>

                {/* رفع صورة */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">صورة السؤال</label>
                  {questionUrls.imageUrl ? (
                    <div className="flex items-center gap-2 p-2 border rounded">
                      <ImageIcon className="w-4 h-4" />
                      <span className="text-sm">تم رفع الصورة</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile("image")}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setQuestionFiles((prev) => ({
                              ...prev,
                              image: file,
                            }));
                            handleFileUpload(file, "image");
                          }
                        }}
                        disabled={uploadingFile === "image"}
                      />
                      {uploadingFile === "image" && (
                        <span className="text-sm">جاري الرفع...</span>
                      )}
                    </div>
                  )}
                </div>

                {/* رفع فيديو */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">فيديو السؤال</label>
                  {questionUrls.videoUrl ? (
                    <div className="flex items-center gap-2 p-2 border rounded">
                      <Video className="w-4 h-4" />
                      <span className="text-sm">تم رفع الفيديو</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile("video")}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setQuestionFiles((prev) => ({
                              ...prev,
                              video: file,
                            }));
                            handleFileUpload(file, "video");
                          }
                        }}
                        disabled={uploadingFile === "video"}
                      />
                      {uploadingFile === "video" && (
                        <span className="text-sm">جاري الرفع...</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* أنواع الإجابات المسموحة */}
          <Card>
            <CardHeader>
              <CardTitle>أنواع الإجابات المسموحة</CardTitle>
              <p className="text-sm text-gray-600">
                حدد أنواع الملفات التي يمكن للطلاب إرسالها كإجابة
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="allowFileSubmission"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div>
                      <FormLabel>السماح بإرسال ملفات</FormLabel>
                      <p className="text-sm text-gray-500">
                        PDF, DOC, TXT, etc.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allowImageSubmission"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div>
                      <FormLabel>السماح بإرسال صور</FormLabel>
                      <p className="text-sm text-gray-500">
                        JPG, PNG, GIF, etc.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allowVideoSubmission"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div>
                      <FormLabel>السماح بإرسال فيديوهات</FormLabel>
                      <p className="text-sm text-gray-500">
                        MP4, AVI, MOV, etc.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* أزرار الإجراءات */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading
                ? "جاري الحفظ..."
                : initialData
                ? "تحديث المهمة"
                : "إنشاء المهمة"}
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
        </form>
      </Form>
    </div>
  );
}
