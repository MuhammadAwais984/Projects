/*
  Warnings:

  - You are about to drop the column `CNIC` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cnic]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."User_CNIC_key";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "CNIC",
ADD COLUMN     "cnic" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_cnic_key" ON "public"."User"("cnic");
