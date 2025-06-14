"use client";

import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PagenationProps {
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  searchTotalPages: number;
}

export default function Pagenation({
  currentPage,
  searchTotalPages,
  setCurrentPage,
}: PagenationProps) {
  return (
    <div className="mt-3 mb-4">
      {/* معلومات الصفحة */}
      <div className="text-center mb-3 text-sm text-gray-600" dir="rtl">
        الصفحة <span className="font-semibold text-primary">{currentPage}</span>{" "}
        من <span className="font-semibold">{searchTotalPages}</span>
      </div>

      <div className="flex items-center gap-3 justify-center">
        {/* زر الانتقال إلى الصفحة الأولى */}
        {searchTotalPages > 5 && currentPage > 3 && (
          <Button
            onClick={() => setCurrentPage(1)}
            variant="outline"
            size="sm"
            className="px-3 py-1"
          >
            الأولى
          </Button>
        )}
        {/* زر الانتقال إلى الصفحة التالية */}
        <Button
          disabled={currentPage === searchTotalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          variant={currentPage === searchTotalPages ? "outline" : "default"}
          className="px-4 py-2"
        >
          <ArrowRight size={15} className="ml-1.5" />
          <span>التالي</span>
        </Button>
        {/* أرقام الصفحات */}
        <div className="flex items-center flex-row-reverse gap-2 text-lg">
          {Array.from({ length: searchTotalPages }, (_, i) => i + 1)
            .filter((page) => {
              // منطق عرض الصفحات:
              // - يجب عرض الصفحة الحالية
              // - عرض الصفحات المحيطة بالصفحة الحالية (نطاق محدد)
              // - عرض أول صفحة وآخر صفحة دائمًا
              const range = 2; // عدد الصفحات حول الصفحة الحالية
              return (
                page === 1 || // أول صفحة
                page === searchTotalPages || // آخر صفحة
                (page >= currentPage - range && page <= currentPage + range)
              );
            })
            .map((page, idx, filteredPages) => (
              <React.Fragment key={page}>
                {" "}
                {idx > 0 &&
                  page !== filteredPages[idx - 1] + 1 && ( // إضافة النقاط إذا كانت الصفحات غير متتالية
                    <span
                      key={`dots-${idx}`}
                      className="text-gray-400 font-bold px-2"
                    >
                      ...
                    </span>
                  )}
                <span
                  key={page}
                  className={cn(
                    "cursor-pointer border px-3 py-1 rounded-md transition-all duration-200 font-medium",
                    page === currentPage
                      ? "bg-primary text-white border-primary shadow-md"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400"
                  )}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </span>
              </React.Fragment>
            ))}
        </div>{" "}
        {/* زر الانتقال إلى الصفحة السابقة */}
        <Button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          variant={currentPage === 1 ? "outline" : "default"}
          className="px-4 py-2"
        >
          <span>السابق</span>
          <ArrowLeft size={15} className="mr-1.5" />{" "}
        </Button>
        {/* زر الانتقال إلى الصفحة الأخيرة */}
        {searchTotalPages > 5 && currentPage < searchTotalPages - 2 && (
          <Button
            onClick={() => setCurrentPage(searchTotalPages)}
            variant="outline"
            size="sm"
            className="px-3 py-1"
          >
            الأخيرة
          </Button>
        )}
      </div>
    </div>
  );
}
