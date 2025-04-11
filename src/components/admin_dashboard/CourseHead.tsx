"use client";

import IsPublishedButton from "./IsPublishedButton";
import DeleteAlert from "./DeleteAlert";

export default function CourseHead({
  course,
  itemsCount,
}: {
  course: any;
  itemsCount: number;
}) {
  const requiredFields = [
    course.title,
    course.description,
    course.image,
    course.price > 0,
    itemsCount,
  ];

  const totalFields = requiredFields.length;
  const filledFields = requiredFields.filter(Boolean).length;

  return (
    <div className="flex items-center justify-between mt-3 mb-10">
      <h1 className="text-3xl font-semibold">
        {course.name} ({filledFields}/{totalFields})
      </h1>
      <div className="flex items-center">
        <DeleteAlert
          buttonTitle="مسح الكورس"
          dialogTitle="هل انت متأكد من حذف الكورس!"
          dialogDescription="سيتم حذف جميع بيانات الكورس نهائيا"
          toastMessage="تم حذف الكورس بنجاح"
          redirect="/admin/courses"
          apiEndpoint={`/api/courses/${course.id}`}
          queryKey="courses"
        />
        <IsPublishedButton
          isPublished={course.isPublished}
          apiEndpoint={`/api/courses/${course.id}`}
          disabled={filledFields !== totalFields}
          queryKeys={"courses"}
        />
      </div>
    </div>
  );
}
