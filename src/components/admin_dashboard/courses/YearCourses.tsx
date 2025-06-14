import { Button } from "@/components/ui/button";
import { Course, User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import DeleteAlert from "../DeleteAlert";
import { Card } from "@/components/ui/card";
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
    // إذا كان المستخدم الحالي admin والكورس مملوك لـ contractor، لا يمكن الحذف
    if (currentUser?.role === "ADMIN" && course.User?.role === "CONSTRUCTOR") {
      return false;
    }
    // إذا كان المستخدم admin والكورس مملوك لـ admin، يمكن الحذف
    // إذا كان المستخدم contractor والكورس مملوك له، يمكن الحذف
    return true;
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
                )}
                <div>
                  <h1 className="text-xl font-semibold mt-3 border-b-2 border-secondary w-fit mb-2">
                    {course?.title}
                  </h1>
                </div>
                <div
                  className="html-content"
                  dangerouslySetInnerHTML={{
                    __html: course?.description || "",
                  }}
                />{" "}
                <div className="mt-4 border-t pt-4 flex flex-wrap items-center gap-3">
                  <Link href={`/admin/courses/${course?.id}`}>
                    <Button>تعديل الكورس</Button>
                  </Link>
                  <Link href={`/admin/courses/${course?.id}/sub`}>
                    <Button>بيانات المشتركين</Button>
                  </Link>
                  {canDeleteCourse(course) && (
                    <DeleteAlert
                      buttonTitle="مسح الكورس"
                      dialogTitle="هل انت متأكد من حذف الكورس!"
                      dialogDescription="سيتم حذف جميع بيانات الكورس نهائيا"
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
