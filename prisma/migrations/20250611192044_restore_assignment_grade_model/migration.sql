/*
  Warnings:

  - You are about to drop the column `feedback` on the `AssignmentSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `grade` on the `AssignmentSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `gradedAt` on the `AssignmentSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `graderId` on the `AssignmentSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `isGraded` on the `AssignmentSubmission` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AssignmentSubmission" DROP CONSTRAINT "AssignmentSubmission_graderId_fkey";

-- DropIndex
DROP INDEX "AssignmentSubmission_isGraded_idx";

-- AlterTable
ALTER TABLE "AssignmentSubmission" DROP COLUMN "feedback",
DROP COLUMN "grade",
DROP COLUMN "gradedAt",
DROP COLUMN "graderId",
DROP COLUMN "isGraded";

-- CreateTable
CREATE TABLE "AssignmentGrade" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "graderId" TEXT NOT NULL,
    "grade" DOUBLE PRECISION NOT NULL,
    "feedback" TEXT,
    "gradedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssignmentGrade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssignmentGrade_submissionId_key" ON "AssignmentGrade"("submissionId");

-- CreateIndex
CREATE INDEX "AssignmentGrade_graderId_idx" ON "AssignmentGrade"("graderId");

-- CreateIndex
CREATE INDEX "AssignmentGrade_submissionId_idx" ON "AssignmentGrade"("submissionId");

-- AddForeignKey
ALTER TABLE "AssignmentGrade" ADD CONSTRAINT "AssignmentGrade_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "AssignmentSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentGrade" ADD CONSTRAINT "AssignmentGrade_graderId_fkey" FOREIGN KEY ("graderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
