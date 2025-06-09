import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/utils/upload";
import axios from "axios";
import fs from "fs";
import path from "path";

async function deleteChapter(chapterId: string) {
  try {
    // جلب الدروس المرتبطة بالفصل للحصول على الملفات
    const lessons = await prisma.lesson.findMany({
      where: { chapterId },
    });

    for (const lesson of lessons) {
      // حذف صور الفيديو والملفات المرتبطة بالدروس
      if (lesson.fileUrl) {
        await deleteFile(lesson.fileUrl);
      }

      // حذف الفيديو إذا كان موجودًا
      // if (lesson.videoUrl) {
      //   await deleteFile(lesson.videoUrl);
      // }
    }

    // حذف الفصل (الحذف التلقائي سيهتم بالبيانات المرتبطة الأخرى)
    await prisma.chapter.delete({ where: { id: chapterId } });

    console.log("Chapter and related files deleted successfully");
  } catch (error) {
    console.error("Error deleting chapter:", error);
  }
}
