/*
  Warnings:

  - You are about to drop the `AssignmentGrade` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AssignmentGrade" DROP CONSTRAINT "AssignmentGrade_graderId_fkey";

-- DropForeignKey
ALTER TABLE "AssignmentGrade" DROP CONSTRAINT "AssignmentGrade_submissionId_fkey";

-- AlterTable
ALTER TABLE "AssignmentSubmission" ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "grade" DOUBLE PRECISION,
ADD COLUMN     "gradedAt" TIMESTAMP(3),
ADD COLUMN     "graderId" TEXT,
ADD COLUMN     "isGraded" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "AssignmentGrade";

-- CreateIndex
CREATE INDEX "AssignmentSubmission_isGraded_idx" ON "AssignmentSubmission"("isGraded");

-- AddForeignKey
ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_graderId_fkey" FOREIGN KEY ("graderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
