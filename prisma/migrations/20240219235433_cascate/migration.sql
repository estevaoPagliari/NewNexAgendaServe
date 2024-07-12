-- DropForeignKey
ALTER TABLE "Agenda" DROP CONSTRAINT "Agenda_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "Agenda" DROP CONSTRAINT "Agenda_estabelecimentoId_fkey";

-- DropForeignKey
ALTER TABLE "Endereco" DROP CONSTRAINT "Endereco_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "Endereco" DROP CONSTRAINT "Endereco_usuarioEmpresaId_fkey";

-- DropForeignKey
ALTER TABLE "HorarioFuncionamento" DROP CONSTRAINT "HorarioFuncionamento_estabelecimentoId_fkey";

-- DropForeignKey
ALTER TABLE "Recurso" DROP CONSTRAINT "Recurso_estabelecimentoId_fkey";

-- DropForeignKey
ALTER TABLE "TipoServico" DROP CONSTRAINT "TipoServico_UserEstabelecimentoId_fkey";

-- AddForeignKey
ALTER TABLE "Recurso" ADD CONSTRAINT "Recurso_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "UserEstabelecimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Endereco" ADD CONSTRAINT "Endereco_usuarioEmpresaId_fkey" FOREIGN KEY ("usuarioEmpresaId") REFERENCES "UserEstabelecimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Endereco" ADD CONSTRAINT "Endereco_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "UserCliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TipoServico" ADD CONSTRAINT "TipoServico_UserEstabelecimentoId_fkey" FOREIGN KEY ("UserEstabelecimentoId") REFERENCES "UserEstabelecimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "UserEstabelecimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "UserCliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HorarioFuncionamento" ADD CONSTRAINT "HorarioFuncionamento_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "UserEstabelecimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
