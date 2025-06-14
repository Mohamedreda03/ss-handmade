import { Button } from "@/components/ui/button";
import { Course, User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import DeleteAlert from "../DeleteAlert";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import React from "react";

interface CourseWithUser extends Course {
  User?: {
    id: string;
    role: string;
  };
}

interface YearCoursesProps {
  courses: CourseWithUser[];
  currentUser: User | null;
}

export default function YearCourses({
  courses,
  currentUser,
}: YearCoursesProps) {
  // تحديد ما إذا كان يمكن حذف الكورس
  const canDeleteCourse = (course: CourseWithUser) => {
    // المشرف (ADMIN) يمكنه حذف أي كورس
    if (currentUser?.role === "ADMIN") {
      return true;
    }
    // المدرس (CONSTRUCTOR) يمكنه حذف كورساته فقط
    if (
      currentUser?.role === "CONSTRUCTOR" &&
      course.userId === currentUser.id
    ) {
      return true;
    }
    // في باقي الحالات، لا يمكن الحذف
    return false;
  };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 h-full">
      {courses &&
        courses?.map((course) => (
          <React.Fragment key={course?.id}>
            <Card>
              <div key={course?.id} className="p-5">
                {course?.image ? (
                  <div className="relative w-full h-[270px]">
                    <Image
                      src={course?.image}
                      fill
                      alt="course image"
                      className="rounded-md mb-3 object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-[270px] bg-gray-200 rounded-md mb-3" />
                )}{" "}
                <div>
                  <h1 className="text-xl font-semibold mt-3 border-b-2 border-secondary w-fit mb-2">
                    {course?.title}
                  </h1>
                  {/* إضافة معلومات صاحب الكورس للمشرف */}
                  {currentUser?.role === "ADMIN" && course.User && (
                    <div className="mb-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          course.User.role === "ADMIN"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {course.User.role === "ADMIN"
                          ? "كورس المشرف"
                          : "كورس المدرس"}
                      </span>
                    </div>
                  )}
                </div>
                <div
                  className="html-content"
                  dangerouslySetInnerHTML={{
                    __html: course?.description || "",
                  }}
                />{" "}
                <div className="mt-4 border-t pt-4 flex flex-wrap items-center gap-3">
                  <Link href={`/admin/courses/${course?.id}`}>
                    <Button variant="default" size="sm">
                      تعديل الكورس
                    </Button>
                  </Link>
                  <Link href={`/admin/courses/${course?.id}/sub`}>
                    <Button variant="outline" size="sm">
                      بيانات المشتركين
                    </Button>
                  </Link>
                  {canDeleteCourse(course) && (
                    <DeleteAlert
                      buttonTitle="حذف الكورس"
                      dialogTitle="هل أنت متأكد من حذف الكورس؟"
                      dialogDescription={`سيتم حذف الكورس "${course?.title}" وجميع محتوياته (الفصول والدروس) نهائياً. هذا الإجراء لا يمكن التراجع عنه.`}
                      apiEndpoint={`/api/courses/${course?.id}`}
                      toastMessage="تم حذف الكورس بنجاح"
                      redirect="/admin/courses"
                      queryKey="courses"
                    />
                  )}
                </div>
              </div>
            </Card>
          </React.Fragment>
        ))}
    </div>
  );
}
