/*
  Warnings:

  - You are about to drop the column `address` on the `Registrar` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Registrar` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Registrar` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Registrar` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Registrar` table. All the data in the column will be lost.
  - You are about to drop the column `surname` on the `Registrar` table. All the data in the column will be lost.
  - You are about to drop the column `registrarId` on the `Student` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_registrarId_fkey";

-- DropIndex
DROP INDEX "Registrar_email_key";

-- DropIndex
DROP INDEX "Registrar_phone_key";

-- AlterTable
ALTER TABLE "Registrar" DROP COLUMN "address",
DROP COLUMN "createdAt",
DROP COLUMN "email",
DROP COLUMN "name",
DROP COLUMN "phone",
DROP COLUMN "surname";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "registrarId";
