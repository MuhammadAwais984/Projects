/*
  Warnings:

  - A unique constraint covering the columns `[CNIC]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "CNIC" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_CNIC_key" ON "public"."User"("CNIC");
