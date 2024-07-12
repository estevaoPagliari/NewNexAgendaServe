-- CreateTable
CREATE TABLE "UserEstabelecimento" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "tiposServicoId" INTEGER,
    "agendamentoId" INTEGER,

    CONSTRAINT "UserEstabelecimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TiposServico" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "timeservice" TEXT NOT NULL,
    "agendamentoId" INTEGER,

    CONSTRAINT "TiposServico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCliente" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "agendamentoId" INTEGER,

    CONSTRAINT "UserCliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agendamento" (
    "id" SERIAL NOT NULL,
    "dia" TEXT NOT NULL,
    "mes" TEXT NOT NULL,
    "horario" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agendamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserEstabelecimento_email_key" ON "UserEstabelecimento"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserCliente_email_key" ON "UserCliente"("email");

-- AddForeignKey
ALTER TABLE "UserEstabelecimento" ADD CONSTRAINT "UserEstabelecimento_tiposServicoId_fkey" FOREIGN KEY ("tiposServicoId") REFERENCES "TiposServico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEstabelecimento" ADD CONSTRAINT "UserEstabelecimento_agendamentoId_fkey" FOREIGN KEY ("agendamentoId") REFERENCES "Agendamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TiposServico" ADD CONSTRAINT "TiposServico_agendamentoId_fkey" FOREIGN KEY ("agendamentoId") REFERENCES "Agendamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCliente" ADD CONSTRAINT "UserCliente_agendamentoId_fkey" FOREIGN KEY ("agendamentoId") REFERENCES "Agendamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
