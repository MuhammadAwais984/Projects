/*
  Warnings:

  - You are about to drop the column `cnic` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."User_cnic_key";

-- DropIndex
DROP INDEX "public"."User_phone_key";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "cnic";
