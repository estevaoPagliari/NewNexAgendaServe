/*
  Warnings:

  - Added the required column `updatedAt` to the `Agenda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Endereco` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `HorarioFuncionamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Recurso` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `TipoServico` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Agenda" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Endereco" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "HorarioFuncionamento" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Recurso" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "TipoServico" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
