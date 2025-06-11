"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  Plus,
  Save,
  Upload,
  FileText,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";

interface LessonAssignmentProps {
  courseId: string;
  chapterId: string;
  lessonId: string;
  lesson: any;
}

export default function LessonAssignment({
  courseId,
  chapterId,
  lessonId,
  lesson,
}: LessonAssignmentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxGrade, setMaxGrade] = useState<number>(100);
  const [questionType, setQuestionType] = useState<
    "TEXT" | "FILE" | "IMAGE" | "VIDEO"
  >("TEXT");
  const [questionText, setQuestionText] = useState("");
  const [questionFileUrl, setQuestionFileUrl] = useState("");
  const [questionImageUrl, setQuestionImageUrl] = useState("");
  const [questionVideoUrl, setQuestionVideoUrl] = useState("");
  const [allowFileSubmission, setAllowFileSubmission] = useState(true);
  const [allowImageSubmission, setAllowImageSubmission] = useState(true);
  const [allowVideoSubmission, setAllowVideoSubmission] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const queryClient = useQueryClient();

  // دالة استخراج ID فيديو YouTube
  const getYouTubeVideoId = (url: string): string => {
    if (url.includes("youtube.com/watch?v=")) {
      return url.split("v=")[1]?.split("&")[0] || "";
    }
    if (url.includes("youtu.be/")) {
      return url.split("youtu.be/")[1]?.split("?")[0] || "";
    }
    return "";
  };

  // جلب المهمة المرتبطة بالدرس
  const { data: assignment, isLoading } = useQuery({
    queryKey: ["lesson-assignment", lessonId],
    queryFn: async () => {
      const res = await axios.get(`/api/lessons/${lessonId}/assignment`);
      return res.data;
    },
    onSuccess: (data) => {
      if (data) {
        setTitle(data.title || "");
        setDescription(data.description || "");
        setMaxGrade(data.maxGrade || 100);
        setQuestionType(data.questionType || "TEXT");
        setQuestionText(data.questionText || "");
        setQuestionFileUrl(data.questionFileUrl || "");
        setQuestionImageUrl(data.questionImageUrl || "");
        setQuestionVideoUrl(data.questionVideoUrl || "");
        setAllowFileSubmission(data.allowFileSubmission ?? true);
        setAllowImageSubmission(data.allowImageSubmission ?? true);
        setAllowVideoSubmission(data.allowVideoSubmission ?? true);
      }
    },
  });

  const createAssignmentMutation = useMutation({
    mutationFn: async (assignmentData: any) => {
      const res = await axios.post(`/api/assignments`, {
        ...assignmentData,
        courseId,
        chapterId,
        lessonId,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["lesson-assignment", lessonId]);
      queryClient.invalidateQueries([
        "lessons",
        "chapters",
        courseId,
        chapterId,
        lessonId,
      ]);
      toast({
        title: "تم إنشاء المهمة بنجاح",
        description: "تم ربط المهمة بالدرس بنجاح",
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "خطأ في إنشاء المهمة",
        description: "حدث خطأ أثناء إنشاء المهمة، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const updateAssignmentMutation = useMutation({
    mutationFn: async (assignmentData: any) => {
      const res = await axios.put(
        `/api/assignments/${assignment.id}/update`,
        assignmentData
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["lesson-assignment", lessonId]);
      toast({
        title: "تم تحديث المهمة بنجاح",
        description: "تم حفظ التغييرات بنجاح",
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "خطأ في تحديث المهمة",
        description: "حدث خطأ أثناء تحديث المهمة، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  // دالة رفع الملفات للأسئلة
  const handleQuestionFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post("/api/upload/assignment", formData);
      return response.data.fileUrl;
    } catch (error) {
      toast({
        title: "خطأ في رفع الملف",
        description: "حدث خطأ أثناء رفع الملف، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast({
        title: "عنوان المهمة مطلوب",
        description: "يرجى إدخال عنوان للمهمة",
        variant: "destructive",
      });
      return;
    }

    // التحقق من وجود محتوى السؤال حسب النوع
    if (questionType === "TEXT" && !questionText.trim()) {
      toast({
        title: "نص السؤال مطلوب",
        description: "يرجى إدخال نص السؤال",
        variant: "destructive",
      });
      return;
    }

    if (questionType === "FILE" && !questionFileUrl.trim()) {
      toast({
        title: "ملف السؤال مطلوب",
        description: "يرجى رفع ملف السؤال",
        variant: "destructive",
      });
      return;
    }

    if (questionType === "IMAGE" && !questionImageUrl.trim()) {
      toast({
        title: "صورة السؤال مطلوبة",
        description: "يرجى رفع صورة السؤال",
        variant: "destructive",
      });
      return;
    }
    if (questionType === "VIDEO" && !questionVideoUrl.trim()) {
      toast({
        title: "رابط فيديو YouTube مطلوب",
        description: "يرجى إدخال رابط فيديو YouTube صحيح",
        variant: "destructive",
      });
      return;
    }

    // التحقق من صحة رابط YouTube
    if (questionType === "VIDEO" && questionVideoUrl.trim()) {
      const isValidYouTubeUrl =
        questionVideoUrl.includes("youtube.com/watch?v=") ||
        questionVideoUrl.includes("youtu.be/");

      if (!isValidYouTubeUrl) {
        toast({
          title: "رابط YouTube غير صحيح",
          description: "يرجى إدخال رابط YouTube صحيح",
          variant: "destructive",
        });
        return;
      }
    }
    const assignmentData = {
      title,
      description,
      maxGrade,
      questionType,
      questionText: questionType === "TEXT" ? questionText : null,
      questionFileUrl: questionType === "FILE" ? questionFileUrl : null,
      questionImageUrl: questionType === "IMAGE" ? questionImageUrl : null,
      questionVideoUrl: questionType === "VIDEO" ? questionVideoUrl : null,
      allowFileSubmission,
      allowImageSubmission,
      allowVideoSubmission,
    };

    if (assignment) {
      updateAssignmentMutation.mutate(assignmentData);
    } else {
      createAssignmentMutation.mutate(assignmentData);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>مهمة الدرس</CardTitle>
            <CardDescription>
              إنشاء وإدارة المهمة المرتبطة بهذا الدرس
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {!isEditing && assignment && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                تعديل المهمة
              </Button>
            )}
            {!assignment && !isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                <Plus className="h-4 w-4 mr-2" />
                إنشاء مهمة
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!assignment && !isEditing && (
          <div className="text-center py-8 text-gray-500">
            {" "}
            لا توجد مهمة مرتبطة بهذا الدرس بعد.
            <br />
            اضغط على &quot;إنشاء مهمة&quot; لإضافة مهمة جديدة.
          </div>
        )}

        {assignment && !isEditing && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">{assignment.title}</h3>
              <p className="text-gray-600 mb-4">{assignment.description}</p>
            </div>{" "}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label className="text-sm font-medium">الدرجة القصوى</Label>
                <p className="text-sm text-gray-600">{assignment.maxGrade}</p>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">نوع السؤال</Label>
              <div className="mt-1">
                <Badge variant="secondary">
                  {assignment.questionType === "TEXT" && "نص"}
                  {assignment.questionType === "FILE" && "ملف"}
                  {assignment.questionType === "IMAGE" && "صورة"}
                  {assignment.questionType === "VIDEO" && "فيديو"}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">السؤال</Label>
              <div className="p-3 border rounded-lg bg-gray-50">
                {assignment.questionType === "TEXT" && (
                  <p className="text-sm whitespace-pre-wrap">
                    {assignment.questionText}
                  </p>
                )}
                {assignment.questionType === "FILE" &&
                  assignment.questionFileUrl && (
                    <a
                      href={assignment.questionFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      عرض الملف
                    </a>
                  )}{" "}
                {assignment.questionType === "IMAGE" &&
                  assignment.questionImageUrl && (
                    <Image
                      src={assignment.questionImageUrl}
                      alt="صورة السؤال"
                      width={600}
                      height={400}
                      className="max-w-full h-auto rounded"
                    />
                  )}{" "}
                {assignment.questionType === "VIDEO" &&
                  assignment.questionVideoUrl && (
                    <div className="w-full max-w-md">
                      <iframe
                        src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                          assignment.questionVideoUrl
                        )}`}
                        title="فيديو السؤال"
                        frameBorder="0"
                        allowFullScreen
                        className="w-full h-48 rounded border"
                      />
                    </div>
                  )}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">
                أنواع الإجابة المسموحة
              </Label>
              <div className="flex gap-2 mt-1">
                {assignment.allowFileSubmission && (
                  <Badge variant="outline">الملفات</Badge>
                )}
                {assignment.allowImageSubmission && (
                  <Badge variant="outline">الصور</Badge>
                )}
                {assignment.allowVideoSubmission && (
                  <Badge variant="outline">الفيديوهات</Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {isEditing && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="title">عنوان المهمة *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="أدخل عنوان المهمة"
                />
              </div>
              <div>
                <Label htmlFor="description">وصف المهمة</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="أدخل وصف المهمة وتعليمات الطلاب"
                  rows={3}
                />
              </div>{" "}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="maxGrade">الدرجة القصوى</Label>
                  <Input
                    id="maxGrade"
                    type="number"
                    value={maxGrade}
                    onChange={(e) => setMaxGrade(Number(e.target.value))}
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* قسم السؤال */}
            <div className="space-y-4">
              <Label className="text-base font-medium">السؤال</Label>
              <div>
                <Label htmlFor="questionType">نوع السؤال *</Label>
                <Select
                  value={questionType}
                  onValueChange={(value: any) => {
                    setQuestionType(value);
                    // مسح المحتوى عند تغيير النوع
                    setQuestionText("");
                    setQuestionFileUrl("");
                    setQuestionImageUrl("");
                    setQuestionVideoUrl("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEXT">نص</SelectItem>
                    <SelectItem value="FILE">ملف</SelectItem>
                    <SelectItem value="IMAGE">صورة</SelectItem>
                    <SelectItem value="VIDEO">فيديو</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* محتوى السؤال حسب النوع */}
              {questionType === "TEXT" && (
                <div>
                  <Label htmlFor="questionText">نص السؤال *</Label>
                  <Textarea
                    id="questionText"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="أدخل نص السؤال"
                    rows={4}
                  />
                </div>
              )}
              {questionType === "FILE" && (
                <div>
                  <Label>ملف السؤال *</Label>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleQuestionFileUpload(file);
                          if (url) setQuestionFileUrl(url);
                        }
                      }}
                      disabled={isUploading}
                    />
                    {questionFileUrl && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <FileText className="h-4 w-4" />
                        تم رفع الملف بنجاح
                      </div>
                    )}
                  </div>
                </div>
              )}
              {questionType === "IMAGE" && (
                <div>
                  <Label>صورة السؤال *</Label>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleQuestionFileUpload(file);
                          if (url) setQuestionImageUrl(url);
                        }
                      }}
                      disabled={isUploading}
                    />
                    {questionImageUrl && (
                      <div className="space-y-2">
                        {" "}
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <ImageIcon className="h-4 w-4" />
                          تم رفع الصورة بنجاح
                        </div>
                        <Image
                          src={questionImageUrl}
                          alt="معاينة الصورة"
                          width={300}
                          height={200}
                          className="max-w-xs h-auto rounded border"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}{" "}
              {questionType === "VIDEO" && (
                <div>
                  <Label htmlFor="questionVideoUrl">رابط فيديو YouTube *</Label>
                  <div className="space-y-2">
                    <Input
                      id="questionVideoUrl"
                      type="url"
                      value={questionVideoUrl}
                      onChange={(e) => setQuestionVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    {questionVideoUrl && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <Video className="h-4 w-4" />
                          معاينة الفيديو
                        </div>{" "}
                        <div className="w-full max-w-md">
                          <iframe
                            src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                              questionVideoUrl
                            )}`}
                            title="معاينة الفيديو"
                            frameBorder="0"
                            allowFullScreen
                            className="w-full h-48 rounded border"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* قسم أنواع الإجابة المسموحة */}
            <div className="space-y-4">
              <Label className="text-base font-medium">
                أنواع الإجابة المسموحة
              </Label>
              <div className="space-y-3">
                {" "}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowFile"
                    checked={allowFileSubmission}
                    onCheckedChange={(checked) =>
                      setAllowFileSubmission(checked === true)
                    }
                  />
                  <Label htmlFor="allowFile" className="text-sm font-normal">
                    السماح برفع الملفات
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowImage"
                    checked={allowImageSubmission}
                    onCheckedChange={(checked) =>
                      setAllowImageSubmission(checked === true)
                    }
                  />
                  <Label htmlFor="allowImage" className="text-sm font-normal">
                    السماح برفع الصور
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowVideo"
                    checked={allowVideoSubmission}
                    onCheckedChange={(checked) =>
                      setAllowVideoSubmission(checked === true)
                    }
                  />
                  <Label htmlFor="allowVideo" className="text-sm font-normal">
                    السماح برفع الفيديوهات
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={
                  createAssignmentMutation.isLoading ||
                  updateAssignmentMutation.isLoading ||
                  isUploading
                }
              >
                <Save className="h-4 w-4 mr-2" />
                {createAssignmentMutation.isLoading ||
                updateAssignmentMutation.isLoading
                  ? "جاري الحفظ..."
                  : "حفظ المهمة"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={
                  createAssignmentMutation.isLoading ||
                  updateAssignmentMutation.isLoading ||
                  isUploading
                }
              >
                إلغاء
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
