/*
  Warnings:

  - You are about to drop the column `tiposServicoId` on the `UserEstabelecimento` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserEstabelecimento" DROP CONSTRAINT "UserEstabelecimento_tiposServicoId_fkey";

-- AlterTable
ALTER TABLE "TiposServico" ADD COLUMN     "userEstabelecimentoId" INTEGER;

-- AlterTable
ALTER TABLE "UserEstabelecimento" DROP COLUMN "tiposServicoId";

-- CreateTable
CREATE TABLE "_TiposServicoToUserEstabelecimento" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_TiposServicoToUserEstabelecimento_AB_unique" ON "_TiposServicoToUserEstabelecimento"("A", "B");

-- CreateIndex
CREATE INDEX "_TiposServicoToUserEstabelecimento_B_index" ON "_TiposServicoToUserEstabelecimento"("B");

-- AddForeignKey
ALTER TABLE "_TiposServicoToUserEstabelecimento" ADD CONSTRAINT "_TiposServicoToUserEstabelecimento_A_fkey" FOREIGN KEY ("A") REFERENCES "TiposServico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TiposServicoToUserEstabelecimento" ADD CONSTRAINT "_TiposServicoToUserEstabelecimento_B_fkey" FOREIGN KEY ("B") REFERENCES "UserEstabelecimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
