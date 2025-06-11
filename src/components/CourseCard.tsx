"use client";

import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { FolderPlus, RefreshCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import SubscriptionModel from "./models/SubscriptionModel";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import CheckoutButton from "./CheckoutButton";

// export const dynamic = "force-dynamic";
export default function CourseCard({
  course,
  isOwned,
  isUserAuth,
}: {
  course: any;
  isOwned: boolean;
  isUserAuth: boolean;
}) {
  return (
    <div className="h-full">
      <div
        className={cn("border p-4 rounded-lg h-full flex flex-col", {
          hidden: !course?.isPublished,
        })}
      >
        {/* صورة الكورس */}
        {course.image ? (
          <div className="relative w-full h-[240px] overflow-hidden rounded mb-4">
            <Image
              src={course?.image}
              alt={course?.title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="relative w-full h-[240px] bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center mb-4">
            <span className="text-gray-400">لا توجد صورة</span>
          </div>
        )}
        {/* عنوان الكورس */}
        <div className="flex justify-between gap-2 mb-3 border-b border-secondary pb-2">
          <h3 className="md:text-xl text-lg flex-[1.8] line-clamp-1 font-semibold">
            {course?.title}
          </h3>
          {course?.User?.role === "CONSTRUCTOR" && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="text-xs">بواسطة:</span>
              <span className="font-medium text-primary">
                {course?.User?.name}
              </span>
            </div>
          )}
        </div>{" "}
        {/* الوصف */}
        <div className="html-content line-clamp-1 text-sm text-gray-600 dark:text-gray-400 flex-grow">
          <div
            dangerouslySetInnerHTML={{
              __html: course?.description || "",
            }}
          />
        </div>
        <div className="h-[1px] w-[80%] bg-slate-100 dark:bg-slate-800 mx-auto my-4" />
        {/* الأزرار والمعلومات الإضافية */}
        <div className="mt-auto">
          <div className="font-smaller shrink-0 flex flex-col md:flex-row md:items-center md:justify-center gap-3 mb-3">
            {" "}
            <Link
              href={`/courses/${course?.id}`}
              className="text-center border-2 border-primary rounded-full px-3 py-1 hover:bg-primary hover:text-primary-foreground smooth transition-colors md:w-fit"
            >
              محتوي الكورس
            </Link>
            {isUserAuth ? (
              <>
                {isOwned ? (
                  <Button className="rounded-full">أنت مشترك بالفعل</Button>
                ) : (
                  <CheckoutButton courseId={course?.id} />
                )}
              </>
            ) : (
              <Button className="rounded-full" asChild>
                <Link href="/sign-in">اشترك الآن !</Link>
              </Button>
            )}
          </div>

          <div className="flex sm:flex-row flex-col items-center justify-between gap-3 border-t pt-2">
            <div className="flex items-center justify-center">
              <div className="bg-fourth pl-3 pr-2 rounded-md py-0.5">
                <span className="dark:bg-black bg-white dark:text-white px-2 ml-1 rounded-md py-0.5">
                  {course.price.toFixed(2)}
                </span>
                <span>EGP</span>
              </div>
            </div>

            <div className="flex flex-col items-center text-slate-500 text-sm">
              <div className="flex gap-2">
                <span>
                  {format(course?.updatedAt, "eeee, do MMM yyyy", {
                    locale: ar,
                  })}
                </span>
                <RefreshCcw className="h-4 w-4 ml-auto" />
              </div>

              <div className="flex items-center gap-2 w-full">
                <span>
                  {format(course?.createdAt, "eeee, do MMM yyyy", {
                    locale: ar,
                  })}
                </span>
                <FolderPlus className="h-4 w-4 mr-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
