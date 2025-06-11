"use client";

import { useState } from "react";
import { useQuery } from "react-query";
import axios from "axios";
import Loading from "@/components/Loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Image as ImageIcon,
  Video,
  Download,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  User,
  BookOpen,
  Filter,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";

interface SubmissionWithDetails {
  id: string;
  submissionType: "FILE" | "IMAGE" | "VIDEO";
  fileUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  studentNote?: string;
  isSubmitted: boolean;
  submittedAt: Date;
  student: {
    id: string;
    name: string;
    email: string;
  };
  assignment: {
    id: string;
    title: string;
    maxGrade: number;
    lesson: {
      id: string;
      title: string;
      Course: {
        id: string;
        title: string;
      };
    };
  };
  grade?: {
    id: string;
    grade: number;
    feedback?: string;
    gradedAt: Date;
    grader: {
      id: string;
      name: string;
    };
  };
}

export default function AssignmentSubmissionsPage() {
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedLesson, setSelectedLesson] = useState<string>("");
  const [gradeFilter, setGradeFilter] = useState<string>("all"); // all, graded, ungraded
  const [gradingSubmission, setGradingSubmission] = useState<string | null>(
    null
  );
  const [gradeInput, setGradeInput] = useState<number>(0);
  const [feedbackInput, setFeedbackInput] = useState<string>("");
  const [isGrading, setIsGrading] = useState<boolean>(false);

  // جلب جميع الكورسات
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const res = await axios.get("/api/admin/courses");
      return res.data;
    },
  });

  // جلب الدروس للكورس المحدد
  const { data: lessons, isLoading: lessonsLoading } = useQuery({
    queryKey: ["course-lessons", selectedCourse],
    queryFn: async () => {
      if (!selectedCourse) return [];
      const res = await axios.get(
        `/api/courses/${selectedCourse}/lessons-with-assignments`
      );
      return res.data;
    },
    enabled: !!selectedCourse,
  });
  // جلب الإجابات للدرس المحدد
  const {
    data: submissions,
    isLoading: submissionsLoading,
    refetch,
  } = useQuery({
    queryKey: ["lesson-submissions", selectedLesson, gradeFilter],
    queryFn: async () => {
      if (!selectedLesson) return [];
      const res = await axios.get(
        `/api/lessons/${selectedLesson}/submissions?graded=${gradeFilter}`
      );
      return res.data;
    },
    enabled: !!selectedLesson,
  });
  const handleGradeSubmission = async (submissionId: string) => {
    if (isGrading) return; // منع الضغط المتكرر

    // التحقق من صحة البيانات
    if (gradeInput < 0 || isNaN(gradeInput)) {
      toast({
        title: "خطأ في البيانات ⚠️",
        description: "يرجى إدخال درجة صحيحة",
        variant: "destructive",
      });
      return;
    }

    setIsGrading(true);

    try {
      await axios.post(`/api/submissions/${submissionId}/grade`, {
        grade: gradeInput,
        feedback: feedbackInput,
      });

      toast({
        title: "تم تقييم الإجابة بنجاح ✅",
        description: "تم حفظ الدرجة والملاحظات بنجاح",
      });

      setGradingSubmission(null);
      setGradeInput(0);
      setFeedbackInput("");
      refetch();
    } catch (error: any) {
      toast({
        title: "خطأ في التقييم ❌",
        description:
          error?.response?.data?.error || "حدث خطأ أثناء حفظ التقييم",
        variant: "destructive",
      });
    } finally {
      setIsGrading(false);
    }
  };
  const getSubmissionTypeIcon = (type: string) => {
    switch (type) {
      case "FILE":
        return <FileText className="h-4 w-4" />;
      case "IMAGE":
        return <ImageIcon className="h-4 w-4" />;
      case "VIDEO":
        return <Video className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getSubmissionTypeLabel = (type: string) => {
    switch (type) {
      case "FILE":
        return "ملف";
      case "IMAGE":
        return "صورة";
      case "VIDEO":
        return "فيديو";
      default:
        return "غير محدد";
    }
  };

  if (coursesLoading) return <Loading className="h-[70vh]" />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">إجابات المهام</h1>
        <Badge variant="outline" className="text-lg px-4 py-2">
          إدارة إجابات الطلاب
        </Badge>
      </div>
      {/* فلاتر الاختيار */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            الفلاتر
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* اختيار الكورس */}
          <div className="space-y-2">
            <Label>اختر الكورس</Label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="اختر كورس..." />
              </SelectTrigger>
              <SelectContent>
                {courses?.map((course: any) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* اختيار الدرس */}
          <div className="space-y-2">
            <Label>اختر الدرس</Label>
            <Select
              value={selectedLesson}
              onValueChange={setSelectedLesson}
              disabled={!selectedCourse || lessonsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر درس..." />
              </SelectTrigger>
              <SelectContent>
                {lessons?.map((lesson: any) => (
                  <SelectItem key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* فلتر التقييم */}
          <div className="space-y-2">
            <Label>حالة التقييم</Label>
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الإجابات</SelectItem>
                <SelectItem value="graded">تم التقييم</SelectItem>
                <SelectItem value="ungraded">لم يتم التقييم</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>{" "}
      {/* رسالة توضيحية */}
      {!selectedCourse && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-16 w-16 mx-auto text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              ابدأ بتصفح إجابات الطلاب
            </h3>
            <p className="text-muted-foreground mb-4">
              قم بتحديد الكورس أولاً من القائمة أعلاه لعرض الدروس المتاحة
            </p>
            <Badge variant="outline" className="text-sm">
              اختر كورس • ثم درس • لعرض الإجابات
            </Badge>
          </CardContent>
        </Card>
      )}
      {selectedCourse && !selectedLesson && (
        <Card>
          <CardContent className="py-12 text-center">
            <Filter className="h-16 w-16 mx-auto text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">اختر المهمة المطلوبة</h3>
            <p className="text-muted-foreground mb-4">
              الآن قم بتحديد الدرس الذي يحتوي على المهمة لعرض إجابات الطلاب
            </p>
            <Badge variant="outline" className="text-sm bg-blue-50">
              {lessons?.length || 0} درس متاح في هذا الكورس
            </Badge>
          </CardContent>
        </Card>
      )}
      {/* عرض الإجابات */}
      {submissionsLoading && <Loading className="h-40" />}
      {selectedLesson && !submissionsLoading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              الإجابات المرسلة ({submissions?.length || 0})
            </h2>
          </div>

          {submissions?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  لا توجد إجابات مرسلة بعد
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {submissions?.map((submission: SubmissionWithDetails) => (
                <Card key={submission.id} className="relative">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          {submission.student.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {submission.student.email}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            {getSubmissionTypeIcon(submission.submissionType)}
                            {getSubmissionTypeLabel(submission.submissionType)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(
                              submission.submittedAt
                            ).toLocaleDateString("ar-EG")}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {submission.grade ? (
                          <Badge
                            variant="default"
                            className="bg-green-100 text-green-800"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            تم التقييم
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            في انتظار التقييم
                          </Badge>
                        )}

                        {submission.grade && (
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="font-semibold">
                                {submission.grade.grade}/
                                {submission.assignment.maxGrade}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* عرض المحتوى المرسل */}
                    <div className="space-y-3">
                      <h4 className="font-medium">المحتوى المرسل:</h4>
                      {/* عرض الملف */}
                      {submission.submissionType === "FILE" &&
                        submission.fileUrl && (
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                <span>ملف مرفق</span>
                              </div>
                              <Button variant="outline" size="sm" asChild>
                                <a
                                  href={submission.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  تحميل
                                </a>
                              </Button>
                            </div>
                          </div>
                        )}{" "}
                      {/* عرض الصورة */}
                      {submission.submissionType === "IMAGE" &&
                        submission.imageUrl && (
                          <div className="p-3 bg-muted rounded-lg">
                            <Image
                              src={submission.imageUrl}
                              alt="إجابة الطالب"
                              width={400}
                              height={300}
                              className="max-w-full h-auto rounded border"
                              style={{ maxHeight: "300px" }}
                            />
                          </div>
                        )}
                      {/* عرض الفيديو */}
                      {submission.submissionType === "VIDEO" &&
                        submission.videoUrl && (
                          <div className="p-3 bg-muted rounded-lg">
                            <video
                              src={submission.videoUrl}
                              controls
                              className="max-w-full h-auto rounded"
                              style={{ maxHeight: "300px" }}
                            />
                          </div>
                        )}
                      {/* ملاحظة الطالب */}
                      {submission.studentNote && (
                        <div className="p-3 bg-muted rounded-lg">
                          <h5 className="font-medium mb-2">ملاحظة الطالب:</h5>
                          <p className="text-sm">{submission.studentNote}</p>
                        </div>
                      )}
                    </div>

                    {/* قسم التقييم */}
                    {gradingSubmission === submission.id ? (
                      <div className="border-t pt-4 space-y-4">
                        <h4 className="font-medium">تقييم الإجابة:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {" "}
                          <div className="space-y-2">
                            <Label>
                              الدرجة (من {submission.assignment.maxGrade})
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              max={submission.assignment.maxGrade}
                              value={gradeInput}
                              onChange={(e) =>
                                setGradeInput(Number(e.target.value))
                              }
                              placeholder="أدخل الدرجة..."
                              disabled={isGrading}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>الملاحظات (اختيارية)</Label>
                            <Textarea
                              value={feedbackInput}
                              onChange={(e) => setFeedbackInput(e.target.value)}
                              placeholder="أضف ملاحظات للطالب..."
                              rows={3}
                              disabled={isGrading}
                            />
                          </div>
                        </div>{" "}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleGradeSubmission(submission.id)}
                            disabled={isGrading}
                            className="min-w-32"
                          >
                            {isGrading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                جاري الحفظ...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                حفظ التقييم
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setGradingSubmission(null);
                              setGradeInput(0);
                              setFeedbackInput("");
                            }}
                            disabled={isGrading}
                          >
                            إلغاء
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-t pt-4">
                        {submission.grade ? (
                          <div className="space-y-2">
                            {" "}
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">التقييم:</h4>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setGradingSubmission(submission.id);
                                  setGradeInput(submission.grade?.grade || 0);
                                  setFeedbackInput(
                                    submission.grade?.feedback || ""
                                  );
                                }}
                                disabled={isGrading}
                              >
                                تعديل التقييم
                              </Button>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="font-semibold">
                                  {submission.grade.grade}/
                                  {submission.assignment.maxGrade}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                تم التقييم بواسطة:{" "}
                                {submission.grade.grader.name}
                              </div>
                            </div>
                            {submission.grade.feedback && (
                              <div className="p-3 bg-muted rounded-lg">
                                <h5 className="font-medium mb-1">
                                  ملاحظات المعلم:
                                </h5>
                                <p className="text-sm">
                                  {submission.grade.feedback}
                                </p>
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              تاريخ التقييم:{" "}
                              {new Date(
                                submission.grade.gradedAt
                              ).toLocaleDateString("ar-EG")}
                            </div>
                          </div>
                        ) : (
                          <Button
                            onClick={() => {
                              setGradingSubmission(submission.id);
                              setGradeInput(0);
                              setFeedbackInput("");
                            }}
                            disabled={isGrading}
                            className="min-w-32"
                          >
                            <Star className="h-4 w-4 mr-2" />
                            تقييم الإجابة
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
