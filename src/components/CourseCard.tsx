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
    <div>
      <div
        className={cn("border p-3 rounded-lg", {
          hidden: !course?.isPublished,
        })}
      >
        {course.image ? (
          <div>
            <Image
              src={course?.image}
              alt={course?.title}
              height={300}
              width={800}
              className="rounded object-cover"
            />
          </div>
        ) : (
          <div className="relative w-full h-[300px] bg-slate-100 dark:bg-slate-800 rounded" />
        )}
        <div className="flex justify-between gap-2 mt-3 mb-2 border-b border-secondary pb-2">
          <h3 className="md:text-2xl text-lg flex-[1.8]">{course?.title}</h3>
        </div>
        {/* <p>{course.description}</p> */}
        <div
          className="html-content"
          dangerouslySetInnerHTML={{
            __html: course?.description || "",
          }}
        />
        <div className="h-[1px] w-[80%] bg-slate-100 dark:bg-slate-800 mx-auto my-4" />
        <div className="font-smaller shrink-0 flex flex-col md:flex-row md:items-center md:justify-center gap-3 mb-3">
          <Link
            href={`/course/${course?.id}`}
            className="text-center border-2 border-first rounded-full px-3 py-1 hover:bg-first hover:text-white smooth clr-text-primary md:w-fit"
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
  );
}
