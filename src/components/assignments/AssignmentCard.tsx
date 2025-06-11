"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  User,
  BookOpen,
  FileText,
  Image,
  Video,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Assignment {
  id: string;
  title: string;
  description?: string;
  questionText?: string;
  questionFileUrl?: string;
  questionImageUrl?: string;
  questionVideoUrl?: string;
  dueDate?: Date;
  maxGrade: number;
  isPublished: boolean;
  allowFileSubmission: boolean;
  allowImageSubmission: boolean;
  allowVideoSubmission: boolean;
  creator: {
    id: string;
    name: string;
  };
  course?: {
    id: string;
    title: string;
  };
  chapter?: {
    id: string;
    title: string;
  };
  lesson?: {
    id: string;
    title: string;
  };
  submissions?: any[];
  _count?: {
    submissions: number;
  };
}

interface AssignmentCardProps {
  assignment: Assignment;
  userRole: "STUDENT" | "CONSTRUCTOR" | "ADMIN";
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export function AssignmentCard({
  assignment,
  userRole,
  onView,
  onEdit,
  onDelete,
  showActions = true,
}: AssignmentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusBadge = () => {
    if (userRole === "STUDENT") {
      const submission = assignment.submissions?.[0];
      if (submission?.grade) {
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 ml-1" />
            تم التقييم ({submission.grade.grade}/{assignment.maxGrade})
          </Badge>
        );
      } else if (submission?.isSubmitted) {
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 ml-1" />
            تم الإرسال
          </Badge>
        );
      } else if (
        assignment.dueDate &&
        new Date() > new Date(assignment.dueDate)
      ) {
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 ml-1" />
            انتهت المهلة
          </Badge>
        );
      } else {
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-800 border-yellow-200"
          >
            <Clock className="w-3 h-3 ml-1" />
            في انتظار الحل
          </Badge>
        );
      }
    } else {
      return (
        <Badge variant={assignment.isPublished ? "default" : "secondary"}>
          {assignment.isPublished ? "منشورة" : "غير منشورة"}
        </Badge>
      );
    }
  };

  const getAllowedSubmissionTypes = () => {
    const types = [];
    if (assignment.allowFileSubmission)
      types.push({ icon: FileText, label: "ملف" });
    if (assignment.allowImageSubmission)
      types.push({ icon: Image, label: "صورة" });
    if (assignment.allowVideoSubmission)
      types.push({ icon: Video, label: "فيديو" });
    return types;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200" dir="rtl">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg font-semibold text-gray-900">
                {assignment.title}
              </CardTitle>
              {getStatusBadge()}
            </div>

            {assignment.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {assignment.description}
              </p>
            )}
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-3">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{assignment.creator.name}</span>
          </div>

          {assignment.course && (
            <div className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              <span>{assignment.course.title}</span>
            </div>
          )}

          {assignment.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>
                {format(new Date(assignment.dueDate), "PPP", { locale: ar })}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <span>الدرجة: {assignment.maxGrade}</span>
          </div>

          {userRole !== "STUDENT" && (
            <div className="flex items-center gap-1">
              <span>الإجابات: {assignment._count?.submissions || 0}</span>
            </div>
          )}
        </div>

        {/* أنواع الإجابات المسموحة */}
        <div className="flex gap-2 mt-2">
          <span className="text-xs text-gray-500">أنواع الإجابة المسموحة:</span>
          <div className="flex gap-1">
            {getAllowedSubmissionTypes().map(({ icon: Icon, label }, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs py-0 px-1"
              >
                <Icon className="w-3 h-3 ml-1" />
                {label}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>

      {showActions && (
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button
              onClick={() => onView(assignment.id)}
              size="sm"
              className="flex-1"
            >
              {userRole === "STUDENT" ? "حل المهمة" : "عرض التفاصيل"}
            </Button>

            {userRole !== "STUDENT" && onEdit && (
              <Button
                onClick={() => onEdit(assignment.id)}
                variant="outline"
                size="sm"
              >
                تعديل
              </Button>
            )}

            {userRole !== "STUDENT" && onDelete && (
              <Button
                onClick={() => onDelete(assignment.id)}
                variant="destructive"
                size="sm"
              >
                حذف
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
