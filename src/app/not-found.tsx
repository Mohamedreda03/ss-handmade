"use client";

import Link from "next/link";
import { useEffect } from "react";
import { FaHome } from "react-icons/fa";

export default function NotFound() {
  useEffect(() => {
    // تأثير التظليل عند تحميل الصفحة
    const fadeIn = () => {
      const container = document.getElementById("not-found-container");
      if (container) {
        container.classList.add("opacity-100");
      }
    };

    fadeIn();
  }, []);

  return (
    <div
      id="not-found-container"
      className="min-h-screen bg-background flex flex-col items-center justify-center p-4 transition-opacity duration-500 opacity-0"
    >
      <div className="max-w-2xl w-full bg-white/5 backdrop-blur-sm p-10 rounded-lg shadow-lg border border-primary/20 text-center">
        <h1 className="text-primary text-9xl font-bold mb-2">404</h1>
        <div className="h-1 w-20 mx-auto bg-primary mb-8 rounded-full"></div>

        <h2 className="text-3xl font-bold mb-4 text-foreground">
          الصفحة غير موجودة
        </h2>
        <p className="text-lg mb-8 text-muted-foreground">
          عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها. قد تكون الصفحة
          غير موجودة أو تم نقلها إلى عنوان آخر.
        </p>

        <div className="flex justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors"
          >
            <FaHome className="ml-1" />
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>

      <div className="mt-8 text-sm text-muted-foreground">
        <p>
          إذا كنت تعتقد أن هناك خطأ ما، يرجى{" "}
          <Link href="/contact" className="text-primary hover:underline">
            الاتصال بنا
          </Link>
        </p>
      </div>
    </div>
  );
}
