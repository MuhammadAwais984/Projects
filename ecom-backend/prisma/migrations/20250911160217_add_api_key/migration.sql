/*
  Warnings:

  - Made the column `apiKey` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "apiKey" SET NOT NULL;
