/*
  Warnings:

  - You are about to drop the `Agendamento` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TiposServico` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserCliente` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserEstabelecimento` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TiposServicoToUserEstabelecimento` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TiposServico" DROP CONSTRAINT "TiposServico_agendamentoId_fkey";

-- DropForeignKey
ALTER TABLE "UserCliente" DROP CONSTRAINT "UserCliente_agendamentoId_fkey";

-- DropForeignKey
ALTER TABLE "UserEstabelecimento" DROP CONSTRAINT "UserEstabelecimento_agendamentoId_fkey";

-- DropForeignKey
ALTER TABLE "_TiposServicoToUserEstabelecimento" DROP CONSTRAINT "_TiposServicoToUserEstabelecimento_A_fkey";

-- DropForeignKey
ALTER TABLE "_TiposServicoToUserEstabelecimento" DROP CONSTRAINT "_TiposServicoToUserEstabelecimento_B_fkey";

-- DropTable
DROP TABLE "Agendamento";

-- DropTable
DROP TABLE "TiposServico";

-- DropTable
DROP TABLE "UserCliente";

-- DropTable
DROP TABLE "UserEstabelecimento";

-- DropTable
DROP TABLE "_TiposServicoToUserEstabelecimento";

-- CreateTable
CREATE TABLE "UsuarioEmpresa" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "cpf" INTEGER NOT NULL,
    "telefone" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsuarioEmpresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Endereco" (
    "id" SERIAL NOT NULL,
    "estado" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "rua" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "complemento" TEXT,
    "cep" TEXT NOT NULL,
    "usuarioEmpresaId" INTEGER,

    CONSTRAINT "Endereco_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioEmpresa_email_key" ON "UsuarioEmpresa"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioEmpresa_cpf_key" ON "UsuarioEmpresa"("cpf");

-- AddForeignKey
ALTER TABLE "Endereco" ADD CONSTRAINT "Endereco_usuarioEmpresaId_fkey" FOREIGN KEY ("usuarioEmpresaId") REFERENCES "UsuarioEmpresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
