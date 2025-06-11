"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Image as ImageIcon,
  Video,
  Download,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface QuestionContentViewerProps {
  assignment: {
    title: string;
    description?: string;
    questionText?: string;
    questionFileUrl?: string;
    questionImageUrl?: string;
    questionVideoUrl?: string;
    maxGrade: number;
    dueDate?: Date;
    allowFileSubmission: boolean;
    allowImageSubmission: boolean;
    allowVideoSubmission: boolean;
  };
}

export function QuestionContentViewer({
  assignment,
}: QuestionContentViewerProps) {
  const getAllowedSubmissionTypes = () => {
    const types = [];
    if (assignment.allowFileSubmission)
      types.push({
        icon: FileText,
        label: "ملف",
        color: "bg-blue-100 text-blue-800",
      });
    if (assignment.allowImageSubmission)
      types.push({
        icon: ImageIcon,
        label: "صورة",
        color: "bg-green-100 text-green-800",
      });
    if (assignment.allowVideoSubmission)
      types.push({
        icon: Video,
        label: "فيديو",
        color: "bg-purple-100 text-purple-800",
      });
    return types;
  };

  const openFile = (url: string) => {
    window.open(url, "_blank");
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div dir="rtl" className="space-y-6">
      {/* معلومات المهمة */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{assignment.title}</CardTitle>
          {assignment.description && (
            <p className="text-gray-600">{assignment.description}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline">الدرجة: {assignment.maxGrade}</Badge>
            {assignment.dueDate && (
              <Badge variant="outline">
                آخر موعد:{" "}
                {new Date(assignment.dueDate).toLocaleDateString("ar")}
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* محتوى السؤال */}
      <Card>
        <CardHeader>
          <CardTitle>السؤال</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* السؤال النصي */}
          {assignment.questionText && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">نص السؤال:</h4>
              <div className="whitespace-pre-wrap text-gray-700">
                {assignment.questionText}
              </div>
            </div>
          )}

          {/* ملف السؤال */}
          {assignment.questionFileUrl && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">ملف السؤال</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openFile(assignment.questionFileUrl!)}
                  >
                    <Eye className="w-4 h-4 ml-1" />
                    عرض
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      downloadFile(assignment.questionFileUrl!, "question-file")
                    }
                  >
                    <Download className="w-4 h-4 ml-1" />
                    تحميل
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* صورة السؤال */}
          {assignment.questionImageUrl && (
            <div className="border rounded-lg p-4">
              {" "}
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="w-5 h-5 text-green-600" />
                <span className="font-medium">صورة السؤال</span>
              </div>
              <div className="flex justify-center">
                <Image
                  src={assignment.questionImageUrl}
                  alt="صورة السؤال"
                  width={600}
                  height={400}
                  className="max-w-full max-h-96 object-contain rounded"
                />
              </div>
            </div>
          )}

          {/* فيديو السؤال */}
          {assignment.questionVideoUrl && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Video className="w-5 h-5 text-purple-600" />
                <span className="font-medium">فيديو السؤال</span>
              </div>
              <div className="flex justify-center">
                <video
                  controls
                  className="max-w-full max-h-96 rounded"
                  preload="metadata"
                >
                  <source src={assignment.questionVideoUrl} />
                  المتصفح لا يدعم تشغيل الفيديو
                </video>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* أنواع الإجابات المسموحة */}
      <Card>
        <CardHeader>
          <CardTitle>أنواع الإجابات المسموحة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {getAllowedSubmissionTypes().map(
              ({ icon: Icon, label, color }, index) => (
                <Badge key={index} className={`${color} border-0`}>
                  <Icon className="w-4 h-4 ml-1" />
                  {label}
                </Badge>
              )
            )}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            يمكنك اختيار نوع واحد فقط من الأنواع المسموحة أعلاه لإرسال إجابتك
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
