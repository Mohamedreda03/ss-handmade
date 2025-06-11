"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Image as ImageIcon,
  Video,
  Calendar,
  Save,
} from "lucide-react";
import {
  uploadFileToSupabase,
  uploadImageToSupabase,
  uploadVideoToSupabase,
} from "@/utils/uploadToSupabase";
import { cn } from "@/lib/utils";

const assignmentSchema = z.object({
  title: z.string().min(3, "العنوان يجب أن يكون 3 أحرف على الأقل"),
  description: z.string().optional(),
  questionText: z.string().optional(),
  dueDate: z.string().optional(),
  maxGrade: z.number().min(1).max(1000).default(100),
  allowFileSubmission: z.boolean().default(true),
  allowImageSubmission: z.boolean().default(true),
  allowVideoSubmission: z.boolean().default(true),
  courseId: z.string().optional(),
  chapterId: z.string().optional(),
  lessonId: z.string().optional(),
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

interface NewAssignmentPageProps {
  courseId: string;
}

export default function NewAssignmentForm({
  courseId,
}: NewAssignmentPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [questionType, setQuestionType] = useState<
    "text" | "file" | "image" | "video"
  >("text");
  const [questionFile, setQuestionFile] = useState<File | null>(null);
  const [questionImageFile, setQuestionImageFile] = useState<File | null>(null);
  const [questionVideoFile, setQuestionVideoFile] = useState<File | null>(null);

  const form = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: "",
      description: "",
      questionText: "",
      maxGrade: 100,
      allowFileSubmission: true,
      allowImageSubmission: true,
      allowVideoSubmission: true,
      courseId: courseId,
    },
  });

  const onSubmit = async (data: AssignmentFormData) => {
    try {
      setIsLoading(true);

      // التحقق من وجود سؤال
      if (
        !data.questionText &&
        !questionFile &&
        !questionImageFile &&
        !questionVideoFile
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

      // رفع الملفات إذا كانت موجودة
      let questionFileUrl = "";
      let questionImageUrl = "";
      let questionVideoUrl = "";

      if (questionFile) {
        questionFileUrl = await uploadFileToSupabase(questionFile);
      }
      if (questionImageFile) {
        questionImageUrl = await uploadImageToSupabase(questionImageFile);
      }
      if (questionVideoFile) {
        questionVideoUrl = await uploadVideoToSupabase(questionVideoFile);
      }

      const assignmentData = {
        ...data,
        questionFileUrl,
        questionImageUrl,
        questionVideoUrl,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
      };

      await axios.post("/api/assignments", assignmentData);

      toast.success("تم إنشاء المهمة بنجاح");
      router.push(`/admin/courses/${courseId}`);
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast.error("حدث خطأ أثناء إنشاء المهمة");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "file" | "image" | "video"
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      switch (type) {
        case "file":
          setQuestionFile(file);
          break;
        case "image":
          setQuestionImageFile(file);
          break;
        case "video":
          setQuestionVideoFile(file);
          break;
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            إنشاء مهمة جديدة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* معلومات المهمة الأساسية */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عنوان المهمة *</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل عنوان المهمة" {...field} />
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
                      <FormLabel>الدرجة الكاملة</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="1000"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وصف المهمة</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="أدخل وصف المهمة (اختياري)"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>موعد التسليم</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="datetime-local"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      اتركه فارغاً إذا لم تكن هناك حاجة لموعد محدد
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* قسم السؤال */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">محتوى السؤال</Label>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Button
                    type="button"
                    variant={questionType === "text" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setQuestionType("text")}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    نص
                  </Button>
                  <Button
                    type="button"
                    variant={questionType === "file" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setQuestionType("file")}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    ملف
                  </Button>
                  <Button
                    type="button"
                    variant={questionType === "image" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setQuestionType("image")}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    صورة
                  </Button>
                  <Button
                    type="button"
                    variant={questionType === "video" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setQuestionType("video")}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    فيديو
                  </Button>
                </div>

                {questionType === "text" && (
                  <FormField
                    control={form.control}
                    name="questionText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نص السؤال</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="اكتب السؤال هنا..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {questionType === "file" && (
                  <div className="space-y-2">
                    <Label>ملف السؤال</Label>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange(e, "file")}
                    />
                    {questionFile && (
                      <p className="text-sm text-green-600">
                        تم اختيار الملف: {questionFile.name}
                      </p>
                    )}
                  </div>
                )}

                {questionType === "image" && (
                  <div className="space-y-2">
                    <Label>صورة السؤال</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "image")}
                    />
                    {questionImageFile && (
                      <p className="text-sm text-green-600">
                        تم اختيار الصورة: {questionImageFile.name}
                      </p>
                    )}
                  </div>
                )}

                {questionType === "video" && (
                  <div className="space-y-2">
                    <Label>فيديو السؤال</Label>
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileChange(e, "video")}
                    />
                    {questionVideoFile && (
                      <p className="text-sm text-green-600">
                        تم اختيار الفيديو: {questionVideoFile.name}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              {/* إعدادات الإجابة */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">
                  أنواع الإجابات المسموحة
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="allowFileSubmission"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <FormLabel className="font-normal">ملف</FormLabel>
                          <FormDescription className="text-sm">
                            السماح بإرسال ملفات
                          </FormDescription>
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
                      <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <FormLabel className="font-normal">صورة</FormLabel>
                          <FormDescription className="text-sm">
                            السماح بإرسال صور
                          </FormDescription>
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
                      <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <FormLabel className="font-normal">فيديو</FormLabel>
                          <FormDescription className="text-sm">
                            السماح بإرسال فيديوهات
                          </FormDescription>
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
                </div>
              </div>

              <Separator />

              {/* أزرار الحفظ */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? "جاري الحفظ..." : "إنشاء المهمة"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
