"use client";

import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import axios from "axios";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Video,
  Calendar,
  Star,
  CheckCircle,
  AlertCircle,
  Send,
  Download,
  MessageSquare,
  Clock,
} from "lucide-react";
import { SecureVideoPlayer } from "@/components/SecureVideoPlayer";
import Image from "next/image";

interface StudentAssignmentViewProps {
  lessonId: string;
  courseId: string;
}

export default function StudentAssignmentView({
  lessonId,
  courseId,
}: StudentAssignmentViewProps) {
  const [fileAnswer, setFileAnswer] = useState<File | null>(null);
  const [imageAnswer, setImageAnswer] = useState<File | null>(null);
  const [videoAnswer, setVideoAnswer] = useState<File | null>(null);
  const [studentNote, setStudentNote] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();
  // جلب بيانات الدرس والواجب
  const { data: lessonData, isLoading } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: async () => {
      const res = await axios.get(`/api/student-lessons/${lessonId}`);
      return res.data;
    },
  });

  const assignment = lessonData?.lesson?.assignment;
  const submission = assignment?.submissions?.[0]; // أول تسليم للطالب

  const submitAssignmentMutation = useMutation({
    mutationFn: async (submissionData: FormData) => {
      const res = await axios.post(
        `/api/assignments/${assignment.id}/submit`,
        submissionData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["lesson", lessonId]);
      // إعادة جلب البيانات فوراً لضمان التحديث
      queryClient.refetchQueries(["lesson", lessonId]);

      toast({
        title: "تم إرسال الإجابة بنجاح ✅",
        description: "تم إرسال إجابتك للمهمة بنجاح وستظهر أدناه",
        duration: 5000,
      }); // مسح الإجابات
      setFileAnswer(null);
      setImageAnswer(null);
      setVideoAnswer(null);
      setStudentNote("");
      setSubmitting(false);
    },
    onError: () => {
      toast({
        title: "خطأ في إرسال الإجابة",
        description: "حدث خطأ أثناء إرسال الإجابة، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
      setSubmitting(false);
    },
  });
  const handleSubmit = async () => {
    if (!assignment) return;

    // التحقق من وجود إجابة واحدة على الأقل
    const hasAnswer = fileAnswer || imageAnswer || videoAnswer;

    if (!hasAnswer) {
      toast({
        title: "إجابة مطلوبة",
        description: "يرجى تقديم إجابة للمهمة (ملف، صورة، أو فيديو)",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    const formData = new FormData();

    // إضافة الإجابات المتاحة
    if (fileAnswer) {
      formData.append("fileAnswer", fileAnswer);
    }
    if (imageAnswer) {
      formData.append("imageAnswer", imageAnswer);
    }
    if (videoAnswer) {
      formData.append("videoAnswer", videoAnswer);
    }

    // إضافة ملاحظة الطالب إذا كانت متاحة
    if (studentNote.trim()) {
      formData.append("studentNote", studentNote.trim());
    }

    submitAssignmentMutation.mutate(formData);
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "TEXT":
        return <FileText className="h-4 w-4" />;
      case "FILE":
        return <Upload className="h-4 w-4" />;
      case "IMAGE":
        return <ImageIcon className="h-4 w-4" />;
      case "VIDEO":
        return <Video className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };
  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "TEXT":
        return "نص";
      case "FILE":
        return "ملف";
      case "IMAGE":
        return "صورة";
      case "VIDEO":
        return "فيديو";
      default:
        return type;
    }
  };

  // دالة لتحديد ألوان التقييم حسب النسبة المئوية
  const getGradeColors = (percentage: number) => {
    if (percentage < 50) {
      return {
        bgGradient:
          "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20",
        border: "border-red-200 dark:border-red-800",
        iconBg: "bg-red-100 dark:bg-red-900/40",
        iconColor: "text-red-600 dark:text-red-400",
        titleColor: "text-red-800 dark:text-red-200",
        textColor: "text-red-600 dark:text-red-300",
        badgeColor: "bg-red-600 hover:bg-red-700",
        progressBg: "bg-red-100 dark:bg-red-900/40",
        progressGradient: "bg-gradient-to-r from-red-500 to-rose-500",
      };
    } else if (percentage < 75) {
      return {
        bgGradient:
          "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20",
        border: "border-yellow-200 dark:border-yellow-800",
        iconBg: "bg-yellow-100 dark:bg-yellow-900/40",
        iconColor: "text-yellow-600 dark:text-yellow-400",
        titleColor: "text-yellow-800 dark:text-yellow-200",
        textColor: "text-yellow-600 dark:text-yellow-300",
        badgeColor: "bg-yellow-600 hover:bg-yellow-700",
        progressBg: "bg-yellow-100 dark:bg-yellow-900/40",
        progressGradient: "bg-gradient-to-r from-yellow-500 to-amber-500",
      };
    } else {
      return {
        bgGradient:
          "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
        border: "border-green-200 dark:border-green-800",
        iconBg: "bg-green-100 dark:bg-green-900/40",
        iconColor: "text-green-600 dark:text-green-400",
        titleColor: "text-green-800 dark:text-green-200",
        textColor: "text-green-600 dark:text-green-300",
        badgeColor: "bg-green-600 hover:bg-green-700",
        progressBg: "bg-green-100 dark:bg-green-900/40",
        progressGradient: "bg-gradient-to-r from-green-500 to-emerald-500",
      };
    }
  };
  const hasSubmitted = !!submission;
  if (isLoading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  if (!assignment) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            لا توجد مهمة
          </h3>
          <p className="text-muted-foreground">
            لا توجد مهمة مرتبطة بهذا الدرس.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* معلومات المهمة */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">
                {assignment.title}
              </CardTitle>
              {assignment.description && (
                <CardDescription className="text-base leading-relaxed">
                  {assignment.description}
                </CardDescription>
              )}
            </div>
            {hasSubmitted && (
              <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                <CheckCircle className="h-4 w-4 mr-1" />
                تم الإرسال
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">الدرجة القصوى</p>
                <p className="text-sm text-muted-foreground">
                  {assignment.maxGrade} نقطة
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getQuestionTypeIcon(assignment.questionType)}
              <div>
                <p className="text-sm font-medium">نوع السؤال</p>
                <p className="text-sm text-muted-foreground">
                  {getQuestionTypeLabel(assignment.questionType)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* السؤال */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getQuestionTypeIcon(assignment.questionType)}
            السؤال
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignment.questionType === "TEXT" && assignment.questionText && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="whitespace-pre-wrap">{assignment.questionText}</p>
            </div>
          )}
          {assignment.questionType === "FILE" && assignment.questionFileUrl && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <a
                href={assignment.questionFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <FileText className="h-4 w-4" />
                عرض ملف السؤال
              </a>
            </div>
          )}
          {assignment.questionType === "IMAGE" &&
            assignment.questionImageUrl && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <Image
                  src={assignment.questionImageUrl}
                  alt="صورة السؤال"
                  width={600}
                  height={400}
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            )}{" "}
          {assignment.questionType === "VIDEO" &&
            assignment.questionVideoUrl && (
              <div className="p-4 bg-muted/30 rounded-lg">
                {" "}
                <div className="w-full max-w-full">
                  {/* YouTube video support only */}
                  {(() => {
                    const videoUrl = assignment.questionVideoUrl;

                    // YouTube detection
                    if (
                      videoUrl.includes("youtube.com") ||
                      videoUrl.includes("youtu.be")
                    ) {
                      let videoId = "";
                      if (videoUrl.includes("youtube.com/embed/")) {
                        videoId =
                          videoUrl.split("/embed/")[1]?.split("?")[0] || "";
                      } else if (videoUrl.includes("youtube.com/watch?v=")) {
                        videoId = videoUrl.split("v=")[1]?.split("&")[0] || "";
                      } else if (videoUrl.includes("youtu.be/")) {
                        videoId =
                          videoUrl.split("youtu.be/")[1]?.split("?")[0] || "";
                      }

                      return (
                        <SecureVideoPlayer
                          videoId={videoId}
                          title="فيديو السؤال"
                        />
                      );
                    }

                    // Fallback to HTML video for other formats
                    return (
                      <video
                        src={videoUrl}
                        controls
                        className="max-w-full h-auto rounded-lg"
                      />
                    );
                  })()}
                </div>
              </div>
            )}
        </CardContent>
      </Card>{" "}
      {/* عرض الإجابة المرسلة إذا كانت موجودة */}
      {hasSubmitted && submission && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              إجابتك المرسلة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                تم الإرسال في:
                <span className="font-medium text-foreground">
                  {format(
                    new Date(submission.submittedAt),
                    "dd/MM/yyyy HH:mm",
                    {
                      locale: ar,
                    }
                  )}
                </span>
              </div>{" "}
              {/* عرض الدرجة والتقييم إذا كانت متاحة */}
              {submission.grade &&
                (() => {
                  const percentage = Math.round(
                    (submission.grade.grade / assignment.maxGrade) * 100
                  );
                  const colors = getGradeColors(percentage);

                  return (
                    <div className="space-y-4">
                      {/* عرض الدرجة */}
                      <div
                        className={`${colors.bgGradient} p-4 rounded-lg border ${colors.border}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 ${colors.iconBg} rounded-full`}
                            >
                              <Star className={`h-6 w-6 ${colors.iconColor}`} />
                            </div>
                            <div>
                              <h4
                                className={`text-lg font-semibold ${colors.titleColor}`}
                              >
                                تم تقييم إجابتك
                              </h4>
                              <p className={`text-sm ${colors.textColor}`}>
                                تم التقييم في:{" "}
                                {format(
                                  new Date(submission.grade.gradedAt),
                                  "dd/MM/yyyy HH:mm",
                                  { locale: ar }
                                )}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="default"
                            className={`text-xl py-2 px-4 ${colors.badgeColor}`}
                          >
                            {submission.grade.grade} / {assignment.maxGrade}
                          </Badge>
                        </div>

                        {/* شريط التقدم للدرجة */}
                        <div className="mt-4">
                          <div
                            className={`flex justify-between text-sm ${colors.textColor} mb-2`}
                          >
                            <span>النسبة المئوية</span>
                            <span className="font-semibold">
                              {percentage}%{percentage < 50 && " - يحتاج تحسين"}
                              {percentage >= 50 && percentage < 75 && " - جيد"}
                              {percentage >= 75 && " - ممتاز"}
                            </span>
                          </div>
                          <div
                            className={`w-full ${colors.progressBg} rounded-full h-3`}
                          >
                            <div
                              className={`${colors.progressGradient} h-3 rounded-full transition-all duration-500`}
                              style={{
                                width: `${percentage}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* عرض تعليق المدرس إذا كان متاحاً */}
                      {submission.grade.feedback && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-full mt-1">
                              <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                                ملاحظات وتعليقات المدرس:
                              </h5>
                              <p className="text-blue-700 dark:text-blue-300 leading-relaxed whitespace-pre-wrap">
                                {submission.grade.feedback}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              {/* حالة عدم التقييم بعد */}
              {!submission.grade && (
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-full">
                      <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-800 dark:text-amber-200">
                        في انتظار التقييم
                      </h4>
                      <p className="text-sm text-amber-600 dark:text-amber-300">
                        تم استلام إجابتك وسيتم تقييمها قريباً من قِبل المدرس
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {/* عرض الإجابات المُرسلة */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground border-b pb-2">
                  الإجابات المُرسلة:
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  {/* عرض ملف الإجابة */}
                  {submission.submissionType.includes("FILE") &&
                    submission.fileUrl && (
                      <div className="border border-border rounded-lg p-4 bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">
                              ملف الإجابة
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {submission.fileUrl.split("/").pop()}
                            </p>
                          </div>
                          <Button asChild variant="outline" size="sm">
                            <a
                              href={submission.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2"
                            >
                              <Download className="h-4 w-4" />
                              تحميل
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}

                  {/* عرض صورة الإجابة */}
                  {submission.submissionType.includes("IMAGE") &&
                    submission.imageUrl && (
                      <div className="border border-border rounded-lg p-4 bg-muted/30">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                              <ImageIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-foreground">
                                صورة الإجابة
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {submission.imageUrl.split("/").pop()}
                              </p>
                            </div>
                            <Button asChild variant="outline" size="sm">
                              <a
                                href={submission.imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                              >
                                <Download className="h-4 w-4" />
                                عرض
                              </a>
                            </Button>{" "}
                          </div>
                          <div className="max-w-md">
                            <Image
                              src={submission.imageUrl}
                              alt="صورة الإجابة"
                              width={400}
                              height={300}
                              className="w-full h-auto rounded-lg shadow-sm border"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                  {/* عرض فيديو الإجابة */}
                  {submission.submissionType.includes("VIDEO") &&
                    submission.videoUrl && (
                      <div className="border border-border rounded-lg p-4 bg-muted/30">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                              <Video className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-foreground">
                                فيديو الإجابة
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {submission.videoUrl.split("/").pop()}
                              </p>
                            </div>
                            <Button asChild variant="outline" size="sm">
                              <a
                                href={submission.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                              >
                                <Download className="h-4 w-4" />
                                تحميل
                              </a>
                            </Button>
                          </div>
                          <div className="max-w-md">
                            <video
                              src={submission.videoUrl}
                              controls
                              className="w-full h-auto rounded-lg shadow-sm border"
                            >
                              متصفحك لا يدعم عرض الفيديو.
                            </video>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* نموذج الإجابة */}
      {!hasSubmitted && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">إجابتك</CardTitle>
            <CardDescription>
              يمكنك الإجابة بأكثر من طريقة حسب الخيارات المتاحة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* رفع الملفات */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* رفع ملف */}
              {assignment.allowFileSubmission && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    رفع ملف:
                  </Label>
                  <Input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf,.doc,.docx,.txt,.rtf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      setFileAnswer(file || null);
                    }}
                  />
                  {fileAnswer && (
                    <p className="text-sm text-primary">
                      تم اختيار: {fileAnswer.name}
                    </p>
                  )}
                </div>
              )}
              {/* رفع صورة */}
              {assignment.allowImageSubmission && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    رفع صورة:
                  </Label>
                  <Input
                    type="file"
                    ref={imageInputRef}
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      setImageAnswer(file || null);
                    }}
                  />
                  {imageAnswer && (
                    <p className="text-sm text-primary">
                      تم اختيار: {imageAnswer.name}
                    </p>
                  )}
                </div>
              )}
              {/* رفع فيديو */}
              {assignment.allowVideoSubmission && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    رفع فيديو:
                  </Label>
                  <Input
                    type="file"
                    ref={videoInputRef}
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      setVideoAnswer(file || null);
                    }}
                  />
                  {videoAnswer && (
                    <p className="text-sm text-primary">
                      تم اختيار: {videoAnswer.name}
                    </p>
                  )}
                </div>
              )}{" "}
            </div>

            {/* ملاحظة اختيارية من الطالب */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                ملاحظة إضافية (اختيارية):
              </Label>
              <Textarea
                value={studentNote}
                onChange={(e) => setStudentNote(e.target.value)}
                placeholder="أضف أي ملاحظات أو توضيحات تريد إرسالها مع إجابتك..."
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                يمكنك إضافة أي توضيحات أو ملاحظات تساعد المدرس على فهم إجابتك
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="min-w-32"
              >
                {submitting ? (
                  "جاري الإرسال..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    إرسال الإجابة
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
