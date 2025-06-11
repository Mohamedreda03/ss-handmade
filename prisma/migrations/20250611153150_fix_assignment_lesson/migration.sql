/*
  Warnings:

  - A unique constraint covering the columns `[lessonId]` on the table `Assignment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('TEXT', 'FILE', 'IMAGE', 'VIDEO');

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "questionType" "QuestionType" NOT NULL DEFAULT 'TEXT';

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_lessonId_key" ON "Assignment"("lessonId");
