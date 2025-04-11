/*
  Warnings:

  - You are about to drop the column `center_or_online` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `governorate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `grade` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `parent_phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `student_phone` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_center_or_online_idx";

-- DropIndex
DROP INDEX "User_full_name_idx";

-- DropIndex
DROP INDEX "User_grade_idx";

-- DropIndex
DROP INDEX "User_student_phone_idx";

-- DropIndex
DROP INDEX "User_student_phone_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "center_or_online",
DROP COLUMN "gender",
DROP COLUMN "governorate",
DROP COLUMN "grade",
DROP COLUMN "parent_phone",
DROP COLUMN "student_phone";
