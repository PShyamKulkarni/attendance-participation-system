/*
  Warnings:

  - A unique constraint covering the columns `[adminCodeHash]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "adminCodeHash" TEXT,
ADD COLUMN     "adminId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_adminCodeHash_key" ON "User"("adminCodeHash");

-- CreateIndex
CREATE INDEX "User_adminId_idx" ON "User"("adminId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
