/*
  Warnings:

  - A unique constraint covering the columns `[assignmentId]` on the table `Lesson` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_lessonId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_assignmentId_key" ON "Lesson"("assignmentId");
