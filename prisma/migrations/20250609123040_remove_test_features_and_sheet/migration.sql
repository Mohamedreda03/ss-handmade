/*
  Warnings:

  - The values [test,sheet] on the enum `Type` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `exam_allowed_from` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `exam_allowed_to` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `hours` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `minutes` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `number_of_entries_allowed` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `show_answers` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the `Answers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TestAnswer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TestQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TestUserData` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Type_new" AS ENUM ('video', 'file');
ALTER TABLE "Lesson" ALTER COLUMN "type" TYPE "Type_new" USING ("type"::text::"Type_new");
ALTER TYPE "Type" RENAME TO "Type_old";
ALTER TYPE "Type_new" RENAME TO "Type";
DROP TYPE "Type_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Answers" DROP CONSTRAINT "Answers_testQuestionId_fkey";

-- DropForeignKey
ALTER TABLE "TestAnswer" DROP CONSTRAINT "TestAnswer_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "TestAnswer" DROP CONSTRAINT "TestAnswer_testQuestionId_fkey";

-- DropForeignKey
ALTER TABLE "TestAnswer" DROP CONSTRAINT "TestAnswer_testUserDataId_fkey";

-- DropForeignKey
ALTER TABLE "TestAnswer" DROP CONSTRAINT "TestAnswer_userId_fkey";

-- DropForeignKey
ALTER TABLE "TestQuestion" DROP CONSTRAINT "TestQuestion_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "TestUserData" DROP CONSTRAINT "TestUserData_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "TestUserData" DROP CONSTRAINT "TestUserData_userId_fkey";

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "exam_allowed_from",
DROP COLUMN "exam_allowed_to",
DROP COLUMN "hours",
DROP COLUMN "minutes",
DROP COLUMN "number_of_entries_allowed",
DROP COLUMN "show_answers";

-- DropTable
DROP TABLE "Answers";

-- DropTable
DROP TABLE "TestAnswer";

-- DropTable
DROP TABLE "TestQuestion";

-- DropTable
DROP TABLE "TestUserData";
