import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

export async function userCliRoutes(app: FastifyInstance) {
  // get geral
  app.get('/usercliente', async (request, reply) => {
    try {
      const users = await prisma.userCliente.findMany({
        include: {
          Endereco: true,
          Agenda: true,
        },
      })
      return reply.code(200).send(users)
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      return reply.code(500).send({ message: 'Erro ao buscar usuários.' })
    }
  })
  // get id
  app.get('/usercliente/:iduser', async (request, reply) => {
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
      const usercliente = await prisma.userCliente.findUnique({
        where: {
          id,
        },
        include: {
          Agenda: true,
          Endereco: true,
        },
      })

      // Verificar se o usuário foi encontrado
      if (!usercliente) {
        reply.code(404).send({ message: 'Usuário não encontrado.' })
      }

      // Enviar resposta com o usuário encontrado
      return reply.code(200).send(usercliente)
    } catch (error) {
      console.error('Erro ao buscar usuário:', error)
      // Enviar resposta de erro com código 400
      reply.code(400).send({ message: 'Erro ao buscar usuário.' })
    }
  })
  // criar user
  app.post('/usercliente', async (request, reply) => {
    try {
      // Validar o corpo da solicitação
      const userSchema = z.object({
        email: z.string().email(), // Validar se é um email válido
        nome: z.string(),
        senha: z.string(),
        cpf: z.string(),
        telefone: z.string(),
        endereco: z.object({
          estado: z.string(),
          cidade: z.string(),
          rua: z.string(),
          numero: z.string(),
          complemento: z.string().optional(),
          cep: z.string(),
        }),
      })
      const { email, nome, senha, cpf, telefone, endereco } = userSchema.parse(
        request.body,
      )

      console.log(userSchema.parse(request.body))

      // Criar um novo usuário no banco de dados
      const newUser = await prisma.userCliente.create({
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
        },
        include: {
          Endereco: true,
        },
      })
      console.log(newUser)
      // Enviar resposta com o novo usuário criado
      return reply.code(201).send({ message: 'Usuário criado com sucesso' })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // Verificar se o erro é de violação de unicidade de email ou cpf
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        return reply.code(400).send({ message: 'E-mail já está em uso.' })
      } else if (
        error.code === 'P2002' &&
        error.meta?.target?.includes('cpf')
      ) {
        return reply.code(400).send({ message: 'CPF já está em uso.' })
      } else if (
        error.code === 'P2002' &&
        error.meta?.target?.includes('telefone')
      ) {
        return reply.code(400).send({ message: 'Telefone já está em uso.' })
        // Enviar resposta de erro genérico com código 400
      } else {
        return reply.code(400).send({ message: 'Erro ao criar usuário.' })
      }
    }
  })

  app.patch('/usercliente/:iduser', async (request, reply) => {
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

      // Validar corpo da solicitação
      const bodySchema = z.object({
        email: z.string().email().optional(), // Validar se é um email válido
        nome: z.string().optional(),
        senha: z.string().optional(),
        cpf: z.string().optional(),
        telefone: z.string().optional(),
      })
      const { email, nome, telefone, cpf, senha } = bodySchema.parse(
        request.body,
      )

      // Atualizar o usuário com base no ID fornecido
      const updatedUser = await prisma.userCliente.update({
        where: {
          id,
        },
        data: {
          email,
          nome,
          telefone,
          cpf,
          senha,
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

  app.delete('/usercliente/:iduser', async (request, reply) => {
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
      const deletedUser = await prisma.userCliente.delete({
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
