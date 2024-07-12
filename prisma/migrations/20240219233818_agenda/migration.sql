-- AlterTable
ALTER TABLE "Endereco" ADD COLUMN     "clienteId" INTEGER;

-- CreateTable
CREATE TABLE "Recurso" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "estabelecimentoId" INTEGER NOT NULL,

    CONSTRAINT "Recurso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCliente" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "cpf" INTEGER NOT NULL,
    "telefone" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agenda" (
    "id" SERIAL NOT NULL,
    "dia" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "horario" TEXT NOT NULL,
    "tipoServicoId" INTEGER NOT NULL,
    "estabelecimentoId" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "recursoId" INTEGER NOT NULL,

    CONSTRAINT "Agenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HorarioFuncionamento" (
    "id" SERIAL NOT NULL,
    "horarioAbertura" TEXT NOT NULL,
    "horarioAlmocoInicio" TEXT NOT NULL,
    "horarioAlmocoFim" TEXT NOT NULL,
    "horarioFechamento" TEXT NOT NULL,
    "estabelecimentoId" INTEGER NOT NULL,

    CONSTRAINT "HorarioFuncionamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserCliente_email_key" ON "UserCliente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserCliente_cpf_key" ON "UserCliente"("cpf");

-- AddForeignKey
ALTER TABLE "Recurso" ADD CONSTRAINT "Recurso_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "UserEstabelecimento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Endereco" ADD CONSTRAINT "Endereco_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "UserCliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_tipoServicoId_fkey" FOREIGN KEY ("tipoServicoId") REFERENCES "TipoServico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "UserEstabelecimento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "UserCliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_recursoId_fkey" FOREIGN KEY ("recursoId") REFERENCES "Recurso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HorarioFuncionamento" ADD CONSTRAINT "HorarioFuncionamento_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "UserEstabelecimento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
