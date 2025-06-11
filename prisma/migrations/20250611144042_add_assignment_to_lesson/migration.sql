-- AlterEnum
ALTER TYPE "Type" ADD VALUE 'assignment';

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "assignmentId" TEXT;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
