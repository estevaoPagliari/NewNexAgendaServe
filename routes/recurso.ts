import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

export async function recursoRoutes(app: FastifyInstance) {
  app.get('/recurso', async (request, reply) => {
    try {
      const users = await prisma.recurso.findMany({
        include: {
          Agenda: true,
          Estabelecimento: true,
        },
      })
      return reply.code(200).send(users)
    } catch (error) {
      console.error('Erro ao buscar Recurso:', error)
      return reply.code(500).send({ message: 'Erro ao buscar Recurso.' })
    }
  })

  app.get('/recurso/:idrecurso', async (request, reply) => {
    try {
      const paramsSchema = z.object({
        idrecurso: z.string(),
      })

      // Validar parâmetros da solicitação
      const { idrecurso } = paramsSchema.parse(request.params)

      // Converter o ID para número
      const id = parseInt(idrecurso)

      // Verificar se o ID é um número válido
      if (isNaN(id)) {
        throw new Error('O ID do Recurso deve ser um número válido.')
      }

      // Buscar o usuário no banco de dados
      const usercliente = await prisma.recurso.findUnique({
        where: {
          id,
        },
        include: {
          Agenda: true,
          Estabelecimento: true,
        },
      })

      // Verificar se o usuário foi encontrado
      if (!usercliente) {
        reply.code(404).send({ message: 'Recurso não encontrado.' })
      }

      // Enviar resposta com o usuário encontrado
      return reply.code(200).send(usercliente)
    } catch (error) {
      console.error('Erro ao buscar Recurso:', error)
      // Enviar resposta de erro com código 400
      reply.code(400).send({ message: 'Erro ao buscar Recurso.' })
    }
  })

  app.post('/recurso', async (request, reply) => {
    try {
      // Validar o corpo da solicitação
      const bodySchema = z.object({
        nome: z.string(),
        estabelecimentoId: z.string(),
      })
      const { nome, estabelecimentoId } = bodySchema.parse(request.body)

      const estabelecimentoIdNumber = parseInt(estabelecimentoId, 10)

      // Criar um novo tipo de serviço associado ao usuário estabelecimento
      const newTipoServico = await prisma.recurso.create({
        data: {
          nome,
          estabelecimentoId: estabelecimentoIdNumber,
        },
      })

      // Enviar resposta com o novo tipo de serviço criado
      return reply.code(201).send(newTipoServico)
    } catch (error) {
      console.error('Erro ao criar tipo de serviço:', error)
      // Enviar resposta de erro com código 400
      return reply.code(400).send({ message: 'Erro ao criar tipo de serviço.' })
    }
  })

  app.patch('/recurso/:idrecurso', async (request, reply) => {
    try {
      const paramsSchema = z.object({
        idrecurso: z.string(),
      })

      // Validar parâmetros da solicitação
      const { idrecurso } = paramsSchema.parse(request.params)

      // Validar o corpo da solicitação
      const bodySchema = z.object({
        nome: z.string(),
      })
      const { nome } = bodySchema.parse(request.body)

      const id = parseInt(idrecurso, 10)

      // Criar um novo tipo de serviço associado ao usuário estabelecimento
      const newTipoServico = await prisma.recurso.update({
        where: {
          id,
        },
        data: {
          nome,
        },
      })

      // Enviar resposta com o novo tipo de serviço criado
      return reply.code(201).send(newTipoServico)
    } catch (error) {
      console.error('Erro ao criar tipo de serviço:', error)
      // Enviar resposta de erro com código 400
      return reply.code(400).send({ message: 'Erro ao criar tipo de serviço.' })
    }
  })

  // Deletar user
  app.delete('/recurso/:idrecurso', async (request, reply) => {
    try {
      // Validar parâmetros da solicitação
      const paramsSchema = z.object({
        idrecurso: z.string(),
      })
      const { idrecurso } = paramsSchema.parse(request.params)

      // Converter o ID para número
      const id = parseInt(idrecurso)

      // Verificar se o ID é um número válido
      if (isNaN(id)) {
        throw new Error('O ID do recurso deve ser um número válido.')
      }

      // Excluir o usuário com base no ID fornecido
      const deletedRecurso = await prisma.recurso.delete({
        where: {
          id,
        },
      })

      // Verificar se o usuário foi excluído com sucesso
      if (!deletedRecurso) {
        return reply.code(404).send({ message: 'Recurso não encontrado.' })
      }

      // Enviar resposta com o usuário excluído
      return reply.code(200).send(deletedRecurso)
    } catch (error) {
      console.error('Erro ao excluir recurso:', error)
      // Enviar resposta de erro com código 400
      return reply.code(400).send({ message: 'Erro ao excluir recurso.' })
    }
  })
}
