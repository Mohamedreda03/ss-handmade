/*
  Warnings:

  - You are about to drop the column `video_type` on the `Lesson` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "video_type";

-- DropEnum
DROP TYPE "VideoTypes";
