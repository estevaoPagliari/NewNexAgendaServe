import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

export async function userEstRoutes(app: FastifyInstance) {
  // get geral
  app.get('/userestabelecimento', async (request, reply) => {
    try {
      // await request.jwtVerify()
      const users = await prisma.userEstabelecimento.findMany({
        include: {
          Endereco: true,
          Agenda: true,
          HorarioFuncionamento: true,
          Recursos: true,
          TipoServico: true,
        },
      })
      return reply.code(200).send(users)
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      return reply.code(500).send({ message: 'Erro ao buscar usuários.' })
    }
  })
  // get id
  app.get('/userestabelecimento/:iduser', async (request, reply) => {
    try {
      const paramsSchema = z.object({
        iduser: z.string(),
      })

      // Validar parâmetros da solicitação
      const { iduser } = paramsSchema.parse(request.params)

      // Converter o ID para número
      const id = parseInt(iduser)

      // Verificar se o ID é um número válido
      if (isNaN(id)) {
        throw new Error('O ID do usuário deve ser um número válido.')
      }

      // Buscar o usuário no banco de dados
      const userestabelecimento = await prisma.userEstabelecimento.findUnique({
        where: {
          id,
        },
        include: {
          Endereco: true,
          Agenda: true,
          HorarioFuncionamento: true,
          Recursos: true,
          TipoServico: true,
        },
      })

      // Verificar se o usuário foi encontrado
      if (!userestabelecimento) {
        reply.code(404).send({ message: 'Usuário não encontrado.' })
      }

      // Enviar resposta com o usuário encontrado
      return reply.code(200).send(userestabelecimento)
    } catch (error) {
      console.error('Erro ao buscar usuário:', error)
      // Enviar resposta de erro com código 400
      reply.code(400).send({ message: 'Erro ao buscar usuário.' })
    }
  })
  // criar user
  app.post('/userestabelecimento', async (request, reply) => {
    try {
      // Validar o corpo da solicitação para o usuário
      const userSchema = z.object({
        email: z.string().email(), // Validar se é um email válido
        nome: z.string(),
        senha: z.string(),
        cpf: z.string(),
        telefone: z.number(),
        endereco: z.object({
          estado: z.string(),
          cidade: z.string(),
          rua: z.string(),
          numero: z.string(),
          complemento: z.string().optional(),
          cep: z.string(),
        }),
        horariofuncionamento: z.object({
          horarioAbertura: z.string(),
          horarioAlmocoInicio: z.string(),
          horarioAlmocoFim: z.string(),
          horarioFechamento: z.string(),
          horarioAberturasabado: z.string(),
          horarioAlmocosabado: z.string(),
          horarioFechamentosabado: z.string(),
        }),
      })

      const {
        email,
        nome,
        senha,
        cpf,
        telefone,
        endereco,
        horariofuncionamento,
      } = userSchema.parse(request.body)

      // Criar o novo usuário e o endereço no banco de dados
      const newUser = await prisma.userEstabelecimento.create({
        data: {
          email,
          nome,
          senha,
          cpf,
          telefone,
          Endereco: {
            create: {
              estado: endereco.estado,
              cidade: endereco.cidade,
              rua: endereco.rua,
              numero: endereco.numero,
              complemento: endereco.complemento,
              cep: endereco.cep,
            },
          },
          HorarioFuncionamento: {
            create: {
              horarioAbertura: horariofuncionamento.horarioAbertura,
              horarioAlmocoInicio: horariofuncionamento.horarioAlmocoInicio,
              horarioAlmocoFim: horariofuncionamento.horarioAlmocoFim,
              horarioFechamento: horariofuncionamento.horarioFechamento,
              horarioAberturasabado: horariofuncionamento.horarioAberturasabado,
              horarioAlmocosabado: horariofuncionamento.horarioAlmocosabado,
              horarioFechamentosabado:
                horariofuncionamento.horarioFechamentosabado,
            },
          },
        },
        include: {
          Endereco: true,
          HorarioFuncionamento: true,
        },
      })

      // Enviar resposta com o novo usuário e endereço criados
      return reply.code(201).send(newUser)
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      // Enviar resposta de erro com código 400
      reply.code(400).send({ message: 'Erro ao criar usuário.' })
    }
  })
  // Alterar user
  app.patch('/userestabelecimento/:iduser', async (request, reply) => {
    try {
      // Validar parâmetros da solicitação
      const paramsSchema = z.object({
        iduser: z.string(),
      })
      const { iduser } = paramsSchema.parse(request.params)

      // Converter o ID para número
      const id = parseInt(iduser)
      console.log(id)

      // Verificar se o ID é um número válido
      if (isNaN(id)) {
        throw new Error('O ID do usuário deve ser um número válido.')
      }

      // Validar corpo da solicitação
      const bodySchema = z.object({
        nome: z.string().optional(),
        email: z.string().email().optional(), // Validar se é um email válido
        senha: z.string().optional(),
        cpf: z.string().optional(),
        telefone: z.number().optional(),
      })
      const { nome, email, senha, cpf, telefone } = bodySchema.parse(
        request.body,
      )

      // Atualizar o usuário com base no ID fornecido
      const updatedUser = await prisma.userEstabelecimento.update({
        where: {
          id,
        },
        data: {
          email,
          nome,
          senha,
          cpf,
          telefone,
        },
        include: {
          Endereco: true,
        },
      })

      // Verificar se o usuário foi atualizado com sucesso
      if (!updatedUser) {
        return reply.code(404).send({ message: 'Usuário não encontrado.' })
      }

      // Enviar resposta com o usuário atualizado
      return reply.code(200).send(updatedUser)
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
      // Enviar resposta de erro com código 400
      return reply.code(400).send({ message: 'Erro ao atualizar usuário.' })
    }
  })
  // Deletar user
  app.delete('/userestabelecimento/:iduser', async (request, reply) => {
    try {
      // Validar parâmetros da solicitação
      const paramsSchema = z.object({
        iduser: z.string(),
      })
      const { iduser } = paramsSchema.parse(request.params)

      // Converter o ID para número
      const id = parseInt(iduser)

      // Verificar se o ID é um número válido
      if (isNaN(id)) {
        throw new Error('O ID do usuário deve ser um número válido.')
      }

      // Excluir o usuário com base no ID fornecido
      const deletedUser = await prisma.userEstabelecimento.delete({
        where: {
          id,
        },
      })

      // Verificar se o usuário foi excluído com sucesso
      if (!deletedUser) {
        return reply.code(404).send({ message: 'Usuário não encontrado.' })
      }

      // Enviar resposta com o usuário excluído
      return reply.code(200).send(deletedUser)
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      // Enviar resposta de erro com código 400
      return reply.code(400).send({ message: 'Erro ao excluir usuário.' })
    }
  })
}
