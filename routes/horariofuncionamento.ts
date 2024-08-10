import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

export async function horFunRoutes(app: FastifyInstance) {
  app.get('/horariofuncionamento', async (request, reply) => {
    try {
      const users = await prisma.horarioFuncionamento.findMany({
        include: {},
      })
      return reply.code(200).send(users)
    } catch (error) {
      console.error('Erro ao buscar horarios:', error)
      return reply.code(500).send({ message: 'Erro ao buscar horarios.' })
    }
  })
  // get id
  app.get('/horariofuncionamento/:iduser', async (request, reply) => {
    try {
      const paramsSchema = z.object({
        iduser: z.string(),
      })

      // Validar parâmetros da solicitação
      const { iduser } = paramsSchema.parse(request.params)

      // Converter o ID para número
      const estabelecimentoId = parseInt(iduser)

      // Verificar se o ID é um número válido
      if (isNaN(estabelecimentoId)) {
        throw new Error('O ID do usuário deve ser um número válido ao horario.')
      }

      // Buscar o usuário no banco de dados
      const userHorario = await prisma.horarioFuncionamento.findMany({
        where: {
          estabelecimentoId,
        },
        include: {},
      })

      // Verificar se o usuário foi encontrado
      if (!userHorario) {
        reply.code(404).send({ message: 'Usuário não encontrado.' })
      }

      // Enviar resposta com o usuário encontrado
      return reply.code(200).send(userHorario)
    } catch (error) {
      console.error('Erro ao buscar usuário:', error)
      // Enviar resposta de erro com código 400
      reply.code(400).send({ message: 'Erro ao buscar usuário.' })
    }
  })

  app.patch('/horariofuncionamentoalterar', async (request, reply) => {
    try {
      // Definindo o schema para validação do corpo da requisição
      const bodySchema = z.object({
        id: z.number().int().positive('O ID deve ser um número positivo'),
        horarioAbertura: z.string().optional(),
        horarioAlmocoInicio: z.string().optional(),
        horarioAlmocoFim: z.string().optional(),
        horarioFechamento: z.string().optional(),
        horarioAberturasabado: z.string().optional(),
        horarioAlmocosabado: z.string().optional(),
        horarioFechamentosabado: z.string().optional(),
      })
      const {
        id,
        horarioAbertura,
        horarioAlmocoInicio,
        horarioAlmocoFim,
        horarioFechamento,
        horarioAberturasabado,
        horarioAlmocosabado,
        horarioFechamentosabado,
      } = bodySchema.parse(request.body)
      // Validando e extraindo dados do corpo da requisição

      // Função para comparar horários
      const compareHorarios = (horarioA: string, horarioB: string): number => {
        const [hA, mA] = horarioA.split(':').map(Number)
        const [hB, mB] = horarioB.split(':').map(Number)
        return hA * 60 + mA - (hB * 60 + mB)
      }

      // Validação personalizada
      if (
        horarioAbertura &&
        horarioFechamento &&
        compareHorarios(horarioAbertura, horarioFechamento) >= 0
      ) {
        return reply.code(400).send({
          error:
            'O horário de abertura não pode ser maior ou igual ao horário de fechamento.',
        })
      }

      if (
        horarioAberturasabado &&
        horarioFechamentosabado &&
        compareHorarios(horarioAberturasabado, horarioFechamentosabado) >= 0
      ) {
        return reply.code(400).send({
          error:
            'O horário de abertura de sábado não pode ser maior ou igual ao horário de fechamento de sábado.',
        })
      }

      if (
        horarioAlmocoInicio &&
        horarioAlmocoFim &&
        compareHorarios(horarioAlmocoInicio, horarioAlmocoFim) >= 0
      ) {
        return reply.code(400).send({
          error:
            'O horário de início do almoço não pode ser maior ou igual ao horário de fim do almoço.',
        })
      }

      // Atualização no banco de dados
      const horario = await prisma.horarioFuncionamento.update({
        where: { id },
        data: {
          horarioAbertura,
          horarioAlmocoInicio,
          horarioAlmocoFim,
          horarioFechamento,
          horarioAberturasabado,
          horarioAlmocosabado,
          horarioFechamentosabado,
        },
      })
      console.log(horario)
      return reply.code(200).send({ message: 'Horario atualizado' })
    } catch (error) {
      console.error('Erro ao atualizar horário:', error)
      return reply.code(400).send({ error })
    }
  })
}
