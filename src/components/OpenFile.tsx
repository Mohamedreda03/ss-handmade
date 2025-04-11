"use client";

import axios from "axios";
import { Button } from "./ui/button";
import { Download } from "lucide-react";

export default function OpenFile({
  fileUrl,
  lessonId,
}: {
  fileUrl: string;
  lessonId: string;
}) {
  const handleOpenFile = async () => {
    await axios
      .patch(`/api/student_progress_data/${lessonId}/file_user_data`)
      .catch((error) => {
        console.error("Error: ", error);
      });
  };

  return (
    <Button
      asChild
      onClick={handleOpenFile}
      variant="outline"
      className="text-lg"
    >
      <a href={fileUrl} target="_blank">
        <span>فتح الملف</span>
        <Download size={17} className="mr-2" />
      </a>
    </Button>
  );
}
