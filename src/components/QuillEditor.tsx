"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import "./quill.css";
import Loading from "./Loading";

// 1. تحميل ديناميكي مع تحسينات الأداء
const ReactQuill = dynamic(
  () => import("react-quill").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <LoadingSkeleton />,
  }
);

// 2. إعدادات ثابتة خارج المكون لتجنب إعادة التصيير
const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ script: "sub" }, { script: "super" }],
    ["blockquote", "link", "image"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ direction: "rtl" }],
    ["clean"],
  ],
  clipboard: {
    matchVisual: false, // تحسين الأداء للنسخ/لصق
  },
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "indent",
  "link",
  "image",
  "script",
  "code-block",
  "align",
  "direction",
];

export default function QuillEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMounted(true);
    }
  }, []);

  // 4. استخدام useMemo للعناصر الديناميكية
  const editorComponent = useMemo(() => {
    if (!isMounted) return null;

    return (
      <div dir="rtl" className="quill-container">
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          style={{
            direction: "rtl",
            textAlign: "right",
            fontFamily: "'Amiri', 'Tahoma', sans-serif",
          }}
          preserveWhitespace // تحسين الأداء للنصوص الكبيرة
        />
      </div>
    );
  }, [isMounted, value, onChange]);

  // 5. عرض هيكل مؤقت أثناء التحميل
  if (!isMounted) {
    return <LoadingSkeleton />;
  }

  return editorComponent;
}

const LoadingSkeleton = () => (
  <div className="animate-pulse h-[86px] w-full rounded-lg bg-slate-200" />
);
