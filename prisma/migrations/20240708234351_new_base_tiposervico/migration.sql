/*
  Warnings:

  - Added the required column `valorServico` to the `TipoServico` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TipoServico" ADD COLUMN     "valorServico" DOUBLE PRECISION NOT NULL;
