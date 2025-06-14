"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import { useQueryClient } from "react-query";

interface DeleteUserButtonProps {
  userId: string;
  userName: string;
  userRole: string;
  currentUserId: string;
}

export default function DeleteUserButton({
  userId,
  userName,
  userRole,
  currentUserId,
}: DeleteUserButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  // منع المشرف من حذف نفسه
  const canDelete = userId !== currentUserId;

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "STUDENT":
        return "طالب";
      case "ADMIN":
        return "مدير";
      case "CONSTRUCTOR":
        return "مدرب";
      default:
        return role;
    }
  };

  const handleDelete = async () => {
    if (!canDelete) return;

    setIsDeleting(true);
    try {
      await axios.delete(`/api/users/${userId}`);
      toast({
        title: "تم الحذف بنجاح",
        description: `تم حذف المستخدم "${userName}" بنجاح`,
        variant: "default",
      });

      // إعادة تحديث قائمة المستخدمين
      queryClient.invalidateQueries(["users"]);
    } catch (error: any) {
      console.error("Error deleting user:", error);

      let errorMessage = "حدث خطأ أثناء حذف المستخدم";

      if (error.response?.status === 400) {
        errorMessage = "لا يمكنك حذف حسابك الشخصي";
      } else if (error.response?.status === 404) {
        errorMessage = "المستخدم غير موجود";
      }

      toast({
        title: "خطأ في الحذف",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!canDelete) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="text-gray-400 cursor-not-allowed"
      >
        <Trash2 className="h-4 w-4 ml-2" />
        لا يمكن الحذف
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <div className="h-4 w-4 ml-2 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
          ) : (
            <Trash2 className="h-4 w-4 ml-2" />
          )}
          {isDeleting ? "جاري الحذف..." : "حذف"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-right">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            تأكيد حذف المستخدم
          </AlertDialogTitle>
          <AlertDialogDescription className="text-right space-y-2">
            <p>هل أنت متأكد من أنك تريد حذف هذا المستخدم؟</p>
            <div className="bg-gray-50 p-3 rounded-md space-y-1">
              <p>
                <span className="font-medium">الاسم:</span> {userName}
              </p>
              <p>
                <span className="font-medium">الصلاحية:</span>{" "}
                <Badge
                  variant={
                    userRole === "STUDENT"
                      ? "secondary"
                      : userRole === "ADMIN"
                      ? "destructive"
                      : "default"
                  }
                  className="mr-1"
                >
                  {getRoleLabel(userRole)}
                </Badge>
              </p>
            </div>
            <p className="text-red-600 font-medium">
              ⚠️ تحذير: هذا الإجراء لا يمكن التراجع عنه
            </p>
            <p className="text-sm text-gray-600">
              سيتم حذف جميع البيانات المرتبطة بهذا المستخدم بشكل نهائي.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2">
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? "جاري الحذف..." : "تأكيد الحذف"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
