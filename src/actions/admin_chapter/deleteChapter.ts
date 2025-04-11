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
      include: {
        testQuestions: {
          include: { answers: true },
        },
      },
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

      // حذف صور الأسئلة والإجابات
      for (const question of lesson.testQuestions) {
        if (question.image_url) {
          await axios.delete(`/api/upload`, {
            data: { path: question.image_url },
          });
        }

        for (const answer of question.answers) {
          if (answer.image_url) {
            await axios.delete(`/api/upload`, {
              data: { path: answer.image_url },
            });
          }
        }
      }
    }

    // حذف الفصل (الحذف التلقائي سيهتم بالبيانات المرتبطة الأخرى)
    await prisma.chapter.delete({ where: { id: chapterId } });

    console.log("Chapter and related files deleted successfully");
  } catch (error) {
    console.error("Error deleting chapter:", error);
  }
}
