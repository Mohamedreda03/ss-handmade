/*
  Warnings:

  - You are about to drop the column `cvFileName` on the `ContractorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `reviewNote` on the `ContractorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `reviewedBy` on the `ContractorProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ContractorProfile" DROP COLUMN "cvFileName",
DROP COLUMN "reviewNote",
DROP COLUMN "reviewedBy";
