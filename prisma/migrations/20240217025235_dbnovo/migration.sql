/*
  Warnings:

  - Added the required column `telefone` to the `UserCliente` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserCliente" ADD COLUMN     "telefone" TEXT NOT NULL;
