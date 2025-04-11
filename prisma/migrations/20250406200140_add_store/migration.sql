/*
  Warnings:

  - You are about to drop the column `year` on the `Course` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Course_year_idx";

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "year",
ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
