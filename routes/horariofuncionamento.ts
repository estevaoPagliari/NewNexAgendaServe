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
}
