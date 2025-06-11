"use client";

import { useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Assignment } from "@prisma/client";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  FileText,
  Users,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

interface CourseAssignmentsManagementProps {
  courseId: string;
  assignments: Assignment[];
}

const getQuestionTypeLabel = (type: string) => {
  switch (type) {
    case "text":
      return "نص";
    case "file":
      return "ملف";
    case "image":
      return "صورة";
    case "video":
      return "فيديو";
    default:
      return type;
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
      return type;
  }
};

export default function CourseAssignmentsManagement({
  courseId,
  assignments,
}: CourseAssignmentsManagementProps) {
  const [deletingAssignment, setDeletingAssignment] = useState<string | null>(
    null
  );
  const queryClient = useQueryClient();

  const deleteAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      await axios.delete(`/api/assignments/${assignmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["course-assignments", courseId]);
      toast({
        title: "تم حذف المهمة بنجاح",
        description: "تم حذف المهمة من الكورس بنجاح",
      });
      setDeletingAssignment(null);
    },
    onError: () => {
      toast({
        title: "خطأ في حذف المهمة",
        description: "حدث خطأ أثناء حذف المهمة، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
      setDeletingAssignment(null);
    },
  });

  const handleDeleteAssignment = (assignmentId: string) => {
    setDeletingAssignment(assignmentId);
    deleteAssignmentMutation.mutate(assignmentId);
  };

  if (assignments.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد مهام</h3>
        <p className="mt-1 text-sm text-gray-500">
          ابدأ بإنشاء مهمة جديدة لهذا الكورس
        </p>
        <div className="mt-6">
          <Link href={`/admin/courses/${courseId}/assignments/new`}>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              إنشاء مهمة جديدة
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assignments.map((assignment) => (
          <Card key={assignment.id} className="relative group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">
                    {assignment.title}
                  </CardTitle>
                  <CardDescription className="mt-1 line-clamp-2">
                    {assignment.description}
                  </CardDescription>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/assignments/${assignment.id}/view`}>
                        <Eye className="h-4 w-4 mr-2" />
                        عرض المهمة
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/admin/assignments/${assignment.id}/submissions`}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        إجابات الطلاب
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/assignments/${assignment.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        تعديل المهمة
                      </Link>
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          حذف المهمة
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>تأكيد حذف المهمة</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف هذه المهمة؟ سيتم حذف جميع إجابات
                            الطلاب ودرجاتهم نهائياً ولا يمكن التراجع عن هذا
                            الإجراء.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleDeleteAssignment(assignment.id)
                            }
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deletingAssignment === assignment.id}
                          >
                            {deletingAssignment === assignment.id
                              ? "جاري الحذف..."
                              : "حذف المهمة"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {" "}
              {/* Assignment Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">الدرجة القصوى:</span>
                  <span className="font-medium">
                    {assignment.maxGrade} نقطة
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">نوع السؤال:</span>
                  <span className="font-medium">
                    {getQuestionTypeLabel(assignment.questionType)}
                  </span>
                </div>{" "}
              </div>
              {/* Allowed Submission Types */}
              <div>
                <div className="text-sm text-gray-600 mb-2">
                  أنواع الإجابات المسموحة:
                </div>
                <div className="flex flex-wrap gap-1">
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
              </div>
              {/* Publication Status */}
              <div>
                {assignment.isPublished ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    منشورة
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                    مسودة
                  </Badge>
                )}
              </div>
              {/* Quick Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link
                    href={`/admin/assignments/${assignment.id}/submissions`}
                  >
                    عرض الإجابات
                  </Link>
                </Button>
                <Button asChild size="sm" className="flex-1">
                  <Link href={`/admin/assignments/${assignment.id}/edit`}>
                    تعديل
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
