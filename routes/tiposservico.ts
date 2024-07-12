import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

export async function tiposervicoRoutes(app: FastifyInstance) {
  app.get('/tiposervico', async (request, reply) => {
    try {
      const users = await prisma.tipoServico.findMany({})
      return reply.code(200).send(users)
    } catch (error) {
      console.error('Erro ao buscar Servico:', error)
      return reply.code(500).send({ message: 'Erro ao buscar Servico.' })
    }
  })

  app.get('/tiposervico/:idservico', async (request, reply) => {
    try {
      const paramsSchema = z.object({
        idservico: z.string(),
      })

      // Validar parâmetros da solicitação
      const { idservico } = paramsSchema.parse(request.params)

      // Converter o ID para número
      const id = parseInt(idservico)

      // Verificar se o ID é um número válido
      if (isNaN(id)) {
        throw new Error('O ID do servico deve ser um número válido.')
      }

      // Buscar o usuário no banco de dados
      const usercliente = await prisma.tipoServico.findUnique({
        where: {
          id,
        },
        include: {
          UserEstabelecimento: true,
        },
      })

      // Verificar se o usuário foi encontrado
      if (!usercliente) {
        reply.code(404).send({ message: 'servico não encontrado.' })
      }

      // Enviar resposta com o usuário encontrado
      return reply.code(200).send(usercliente)
    } catch (error) {
      console.error('Erro ao buscar servico:', error)
      // Enviar resposta de erro com código 400
      reply.code(400).send({ message: 'Erro ao buscar servico.' })
    }
  })

  app.get('/tiposervicouser/:iduser', async (request, reply) => {
    try {
      const paramsSchema = z.object({
        iduser: z.string(),
      })

      // Validar parâmetros da solicitação
      const { iduser } = paramsSchema.parse(request.params)

      // Converter o ID para número
      const UserEstabelecimentoId = parseInt(iduser)

      // Verificar se o ID é um número válido
      if (isNaN(UserEstabelecimentoId)) {
        throw new Error('O ID do usuario deve ser um número válido.')
      }

      // Buscar o usuário no banco de dados
      const usercliente = await prisma.tipoServico.findMany({
        where: {
          UserEstabelecimentoId,
        },
      })

      // Verificar se o usuário foi encontrado
      if (!usercliente) {
        reply.code(404).send({ message: 'usuario não encontrado.' })
      }

      // Enviar resposta com o usuário encontrado
      return reply.code(200).send(usercliente)
    } catch (error) {
      console.error('Erro ao buscar servico:', error)
      // Enviar resposta de erro com código 400
      reply.code(400).send({ message: 'Erro ao buscar servico.' })
    }
  })

  app.post('/tiposervico/:userestabelecimento', async (request, reply) => {
    try {
      const paramsSchema = z.object({
        userestabelecimento: z.string(),
      })

      const { userestabelecimento } = paramsSchema.parse(request.params)

      const id = parseInt(userestabelecimento)
      // Validar o corpo da solicitação
      const bodySchema = z.object({
        nome: z.string(),
        tempoServico: z.number(),
        valorServico: z.number(),
      })
      const { nome, tempoServico, valorServico } = bodySchema.parse(
        request.body,
      )

      // Criar um novo tipo de serviço associado ao usuário estabelecimento
      const newTipoServico = await prisma.tipoServico.create({
        data: {
          nome,
          tempoServico,
          valorServico,
          UserEstabelecimento: { connect: { id } },
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

  app.patch('/tiposervico/:idservico', async (request, reply) => {
    try {
      // Validar parâmetros da solicitação
      const paramsSchema = z.object({
        idservico: z.string(),
      })
      const { idservico } = paramsSchema.parse(request.params)

      // Converter o ID para número
      const id = parseInt(idservico)

      // Verificar se o ID é um número válido
      if (isNaN(id)) {
        throw new Error('O ID do servico deve ser um número válido.')
      }

      // Validar corpo da solicitação
      const bodySchema = z.object({
        nome: z.string().optional(),
        tempoServico: z.number().optional(),
      })
      const { nome, tempoServico } = bodySchema.parse(request.body)

      // Atualizar o usuário com base no ID fornecido
      const updatedUser = await prisma.tipoServico.update({
        where: {
          id,
        },
        data: {
          nome,
          tempoServico,
        },
      })

      // Verificar se o usuário foi atualizado com sucesso
      if (!updatedUser) {
        return reply.code(404).send({ message: 'Servico não encontrado.' })
      }

      // Enviar resposta com o usuário atualizado
      return reply.code(200).send(updatedUser)
    } catch (error) {
      console.error('Erro ao atualizar Servico:', error)
      // Enviar resposta de erro com código 400
      return reply.code(400).send({ message: 'Erro ao atualizar Servico.' })
    }
  })

  app.delete('/tiposervico/:idservico', async (request, reply) => {
    try {
      // Validar parâmetros da solicitação
      const paramsSchema = z.object({
        idservico: z.string(),
      })
      const { idservico } = paramsSchema.parse(request.params)

      // Converter o ID para número
      const id = parseInt(idservico)

      // Verificar se o ID é um número válido
      if (isNaN(id)) {
        throw new Error('O ID do servico deve ser um número válido.')
      }

      // Excluir o usuário com base no ID fornecido
      const deletedUser = await prisma.tipoServico.delete({
        where: {
          id,
        },
      })

      // Verificar se o usuário foi excluído com sucesso
      if (!deletedUser) {
        return reply.code(404).send({ message: 'Usuário não idservico.' })
      }

      // Enviar resposta com o usuário excluído
      return reply.code(200).send(deletedUser)
    } catch (error) {
      console.error('Erro ao excluir idservico:', error)
      // Enviar resposta de erro com código 400
      return reply.code(400).send({ message: 'Erro ao excluir idservico.' })
    }
  })
}
