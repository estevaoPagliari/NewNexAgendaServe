-- CreateTable
CREATE TABLE "UserEstabelecimento" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "telefone" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserEstabelecimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recurso" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "estabelecimentoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recurso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCliente" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "habilitado" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCliente_pkey" PRIMARY KEY ("id")
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
    "clienteId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Endereco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoServico" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "tempoServico" INTEGER NOT NULL,
    "valorServico" INTEGER NOT NULL,
    "UserEstabelecimentoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TipoServico_pkey" PRIMARY KEY ("id")
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HorarioFuncionamento" (
    "id" SERIAL NOT NULL,
    "horarioAbertura" TEXT NOT NULL,
    "horarioAlmocoInicio" TEXT NOT NULL,
    "horarioAlmocoFim" TEXT NOT NULL,
    "horarioFechamento" TEXT NOT NULL,
    "horarioAberturasabado" TEXT NOT NULL,
    "horarioAlmocosabado" TEXT NOT NULL,
    "horarioFechamentosabado" TEXT NOT NULL,
    "estabelecimentoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HorarioFuncionamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserEstabelecimento_email_key" ON "UserEstabelecimento"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserEstabelecimento_cpf_key" ON "UserEstabelecimento"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "UserCliente_email_key" ON "UserCliente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserCliente_cpf_key" ON "UserCliente"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "UserCliente_telefone_key" ON "UserCliente"("telefone");

-- AddForeignKey
ALTER TABLE "Recurso" ADD CONSTRAINT "Recurso_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "UserEstabelecimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Endereco" ADD CONSTRAINT "Endereco_usuarioEmpresaId_fkey" FOREIGN KEY ("usuarioEmpresaId") REFERENCES "UserEstabelecimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Endereco" ADD CONSTRAINT "Endereco_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "UserCliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TipoServico" ADD CONSTRAINT "TipoServico_UserEstabelecimentoId_fkey" FOREIGN KEY ("UserEstabelecimentoId") REFERENCES "UserEstabelecimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_tipoServicoId_fkey" FOREIGN KEY ("tipoServicoId") REFERENCES "TipoServico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "UserEstabelecimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "UserCliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_recursoId_fkey" FOREIGN KEY ("recursoId") REFERENCES "Recurso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HorarioFuncionamento" ADD CONSTRAINT "HorarioFuncionamento_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "UserEstabelecimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
