-- CreateTable
CREATE TABLE "TipoServico" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "tempoServico" INTEGER NOT NULL,
    "UserEstabelecimentoId" INTEGER NOT NULL,

    CONSTRAINT "TipoServico_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TipoServico" ADD CONSTRAINT "TipoServico_UserEstabelecimentoId_fkey" FOREIGN KEY ("UserEstabelecimentoId") REFERENCES "UserEstabelecimento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
