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
      <div className="flex items-center gap-3">
        {/* زر الانتقال إلى الصفحة التالية */}
        <Button
          disabled={currentPage === searchTotalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
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
                {idx > 0 &&
                  page !== filteredPages[idx - 1] + 1 && ( // إضافة النقاط إذا كانت الصفحات غير متتالية
                    <span key={`dots-${idx}`}>...</span>
                  )}
                <span
                  key={page}
                  className={cn(
                    "cursor-pointer border px-2 rounded-md",
                    page === currentPage ? "border-secondary/75" : ""
                  )}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </span>
              </React.Fragment>
            ))}
        </div>

        {/* زر الانتقال إلى الصفحة السابقة */}
        <Button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          <span>السابق</span>
          <ArrowLeft size={15} className="mr-1.5" />
        </Button>
      </div>
    </div>
  );
}
