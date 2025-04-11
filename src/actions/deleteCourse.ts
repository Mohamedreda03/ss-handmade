import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/utils/upload";
import axios from "axios";

export async function deleteCourse(courseId: string) {
  try {
    // جلب الدروس المرتبطة للحصول على الصور
    const lessons = await prisma.lesson.findMany({
      where: { courseId },
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

    // حذف الكورس (الحذف التلقائي سيتكفل بالباقي)
    await prisma.course.delete({ where: { id: courseId } });

    console.log("Course and related files deleted successfully");
  } catch (error) {
    console.error("Error deleting course:", error);
  }
}
