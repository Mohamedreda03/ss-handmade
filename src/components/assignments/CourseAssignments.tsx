"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Image,
  Video,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Assignment {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  maxGrade: number;
  isPublished: boolean;
  questionText?: string;
  questionFileUrl?: string;
  questionImageUrl?: string;
  questionVideoUrl?: string;
  allowFileSubmission: boolean;
  allowImageSubmission: boolean;
  allowVideoSubmission: boolean;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  submissions: Array<{
    id: string;
    isSubmitted: boolean;
    submittedAt?: string;
    grade?: {
      grade: number;
      feedback?: string;
    };
  }>;
  _count: {
    submissions: number;
  };
}

interface CourseAssignmentsProps {
  courseId: string;
  assignments: Assignment[];
  userRole: "STUDENT" | "CONSTRUCTOR" | "ADMIN";
  isOwned: boolean;
}

export default function CourseAssignments({
  courseId,
  assignments,
  userRole,
  isOwned,
}: CourseAssignmentsProps) {
  if (!assignments || assignments.length === 0) {
    return null;
  }

  const getSubmissionStatus = (assignment: Assignment) => {
    const submission = assignment.submissions?.[0];
    const isOverdue =
      assignment.dueDate && new Date() > new Date(assignment.dueDate);

    if (submission?.grade) {
      return {
        status: "graded",
        label: "مقيمة",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
      };
    } else if (submission?.isSubmitted) {
      return {
        status: "submitted",
        label: "تم التسليم",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: CheckCircle,
      };
    } else if (isOverdue) {
      return {
        status: "overdue",
        label: "متأخرة",
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
      };
    } else {
      return {
        status: "pending",
        label: "في الانتظار",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
      };
    }
  };

  const getQuestionTypeIcon = (assignment: Assignment) => {
    if (assignment.questionFileUrl) return FileText;
    if (assignment.questionImageUrl) return Image;
    if (assignment.questionVideoUrl) return Video;
    return FileText;
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-[#6F7354]">
          المهام ({assignments.length})
        </h3>
        {userRole !== "STUDENT" && (
          <Button asChild size="sm">
            <Link href={`/admin/courses/${courseId}/assignments/new`}>
              إضافة مهمة
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {assignments.map((assignment) => {
          const submissionStatus = getSubmissionStatus(assignment);
          const QuestionIcon = getQuestionTypeIcon(assignment);
          const submission = assignment.submissions?.[0];

          return (
            <Card
              key={assignment.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <QuestionIcon className="w-5 h-5 text-[#6F7354]" />
                    <CardTitle className="text-lg">
                      {assignment.title}
                    </CardTitle>
                  </div>
                  <Badge className={cn("text-xs", submissionStatus.color)}>
                    <submissionStatus.icon className="w-3 h-3 mr-1" />
                    {submissionStatus.label}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {assignment.description && (
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {assignment.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  {assignment.dueDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        موعد التسليم:{" "}
                        {new Date(assignment.dueDate).toLocaleDateString(
                          "ar-SA"
                        )}
                      </span>
                    </div>
                  )}
                  <div>الدرجة الكاملة: {assignment.maxGrade}</div>
                  <div>المعلم: {assignment.creator.name}</div>
                </div>

                {submission?.grade && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-green-800">
                        الدرجة: {submission.grade.grade} / {assignment.maxGrade}
                      </span>
                      <span className="text-green-600 text-sm">
                        {Math.round(
                          (submission.grade.grade / assignment.maxGrade) * 100
                        )}
                        %
                      </span>
                    </div>
                    {submission.grade.feedback && (
                      <p className="text-green-700 text-sm mt-2">
                        <strong>ملاحظات المعلم:</strong>{" "}
                        {submission.grade.feedback}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    {assignment.allowFileSubmission && (
                      <Badge variant="outline" className="text-xs">
                        ملف
                      </Badge>
                    )}
                    {assignment.allowImageSubmission && (
                      <Badge variant="outline" className="text-xs">
                        صورة
                      </Badge>
                    )}
                    {assignment.allowVideoSubmission && (
                      <Badge variant="outline" className="text-xs">
                        فيديو
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {userRole === "STUDENT" && isOwned ? (
                      <Button asChild size="sm">
                        <Link href={`/assignments/${assignment.id}`}>
                          {submission?.isSubmitted
                            ? "عرض الإجابة"
                            : "حل المهمة"}
                        </Link>
                      </Button>
                    ) : userRole === "STUDENT" ? (
                      <Button size="sm" disabled>
                        غير متاح
                      </Button>
                    ) : (
                      <>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/assignments/${assignment.id}`}>
                            عرض
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link
                            href={`/admin/assignments/${assignment.id}/submissions`}
                          >
                            الإجابات ({assignment._count.submissions})
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
