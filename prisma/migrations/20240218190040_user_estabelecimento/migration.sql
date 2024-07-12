/*
  Warnings:

  - You are about to drop the `UsuarioEmpresa` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Endereco" DROP CONSTRAINT "Endereco_usuarioEmpresaId_fkey";

-- DropTable
DROP TABLE "UsuarioEmpresa";

-- CreateTable
CREATE TABLE "UserEstabelecimento" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "cpf" INTEGER NOT NULL,
    "telefone" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserEstabelecimento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserEstabelecimento_email_key" ON "UserEstabelecimento"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserEstabelecimento_cpf_key" ON "UserEstabelecimento"("cpf");

-- AddForeignKey
ALTER TABLE "Endereco" ADD CONSTRAINT "Endereco_usuarioEmpresaId_fkey" FOREIGN KEY ("usuarioEmpresaId") REFERENCES "UserEstabelecimento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
