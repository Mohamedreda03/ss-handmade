/*
  Warnings:

  - You are about to drop the column `assignmentId` on the `Lesson` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_assignmentId_fkey";

-- DropIndex
DROP INDEX "Lesson_assignmentId_key";

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "assignmentId";

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
