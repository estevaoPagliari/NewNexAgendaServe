import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

export async function agendaservicoRoutes(app: FastifyInstance) {
  app.get('/agendaservico', async (request, reply) => {
    try {
      const users = await prisma.agenda.findMany({
        include: {
          TipoServico: true,
          Estabelecimento: true,
          Recurso: true,
          Cliente: true,
        },
      })
      return reply.code(200).send(users)
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      return reply.code(500).send({ message: 'Erro ao buscar usuários.' })
    }
  })

  app.get('/agendaservico/:idagenda', async (request, reply) => {
    try {
      const paramsSchema = z.object({
        idagenda: z.string(),
      })

      // Validar parâmetros da solicitação
      const { idagenda } = paramsSchema.parse(request.params)

      // Converter o ID para número
      const id = parseInt(idagenda)

      // Verificar se o ID é um número válido
      if (isNaN(id)) {
        throw new Error('O ID da agenda deve ser um número válido.')
      }

      // Buscar o usuário no banco de dados
      const usercliente = await prisma.agenda.findUnique({
        where: {
          id,
        },
        include: {
          TipoServico: true,
          Estabelecimento: true,
          Recurso: true,
          Cliente: true,
        },
      })

      // Verificar se o usuário foi encontrado
      if (!usercliente) {
        reply.code(404).send({ message: 'Agenda não encontrado.' })
      }

      // Enviar resposta com o usuário encontrado
      return reply.code(200).send(usercliente)
    } catch (error) {
      console.error('Erro ao buscar Agenda:', error)
      // Enviar resposta de erro com código 400
      reply.code(400).send({ message: 'Erro ao buscar Agenda.' })
    }
  })

  app.get(
    '/agendaservicodiaestabelecimento/:id/:dia/:mes',
    async (request, reply) => {
      try {
        const querySchema = z.object({
          id: z.string(),
          dia: z.string(),
          mes: z.string(),
        })

        // Validar parâmetros da solicitação presentes na query da URL
        const { id, dia, mes } = querySchema.parse(request.params)

        const agendas = await prisma.agenda.findMany({
          where: {
            estabelecimentoId: parseInt(id),
            dia: parseInt(dia),
            mes: parseInt(mes),
          },
          include: {
            TipoServico: true,
            Estabelecimento: true,
            Recurso: true,
            Cliente: true,
          },
        })

        return reply.code(200).send(agendas)
      } catch (error) {
        console.error('Erro ao buscar agendas de serviço:', error)
        return reply
          .code(500)
          .send({ message: 'Erro ao buscar agendas de serviço.' })
      }
    },
  )

  app.post('/agendaservicopost', async (request, reply) => {
    const bodySchema = z.object({
      nome: z.string().optional(),
      cpf: z.string().optional(),
      horario: z.string().optional(),
      dia: z.number().optional(),
      mes: z.number().optional(),
      ano: z.number().optional(),
      recursoId: z.number().optional(),
    })

    try {
      const { nome, cpf, horario, dia, mes, ano, recursoId } = bodySchema.parse(
        request.body,
      )

      const users = await prisma.agenda.findMany({
        where: {
          dia,
          mes,
          ano,
          horario,
          recursoId,
          Cliente: {
            nome,
            cpf,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          TipoServico: true,
          Estabelecimento: true,
          Recurso: true,
          Cliente: true,
        },
      })

      return reply.code(200).send(users)
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      if (error instanceof z.ZodError) {
        return reply
          .code(400)
          .send({ message: 'Erro de validação.', errors: error.errors })
      }
      return reply.code(500).send({ message: 'Erro ao buscar usuários.' })
    }
  })

  app.post('/agendaservico', async (request, reply) => {
    try {
      // Validar o corpo da solicitação
      const bodySchema = z.object({
        dia: z.number(), // Validar se é um email válido
        mes: z.number(),
        ano: z.number(),
        horario: z.string(),
        estabelecimentoId: z.number(),
        tipoServicoId: z.number(),
        clienteId: z.number(),
        recursoId: z.number(),
      })
      const {
        dia,
        mes,
        ano,
        horario,
        estabelecimentoId,
        tipoServicoId,
        clienteId,
        recursoId,
      } = bodySchema.parse(request.body)

      // Criar um novo usuário no banco de dados
      // verificar se tem mais de 2 agendamentos no dia
      const verificar = await prisma.agenda.findMany({
        where: {
          dia,
          mes,
          ano,
          clienteId,
        },
      })

      if (verificar.length >= 2) {
        return reply
          .code(400)
          .send({ message: 'Você já tem 2 agendamentos neste dia.' })
      }
      // verificar se tem um agendamento no mesmo horario
      const verificarhorario = await prisma.agenda.findMany({
        where: {
          dia,
          mes,
          ano,
          horario,
          clienteId,
        },
      })

      if (verificarhorario.length >= 1) {
        return reply
          .code(400)
          .send({ message: 'Você já tem um agendamentos neste horário.' })
      }

      const newAgenda = await prisma.agenda.create({
        data: {
          dia,
          mes,
          ano,
          horario,
          estabelecimentoId,
          tipoServicoId,
          clienteId,
          recursoId,
        },
      })

      console.log(verificar)
      // Enviar resposta com o novo usuário criado
      return reply.code(201).send(newAgenda)
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      // Enviar resposta de erro com código 400
      reply.code(400).send({ message: 'Erro ao criar usuário.' })
    }
  })

  app.post('/buscaragendarecurso', async (request, reply) => {
    try {
      const bodySchema = z.object({
        id: z.string(),
        dia: z.number(),
        mes: z.number(),
        idrecurso: z.number(),
      })

      const { id, dia, mes, idrecurso } = bodySchema.parse(request.body)

      const agendas = await prisma.agenda.findMany({
        where: {
          estabelecimentoId: parseInt(id),
          dia,
          mes,
          recursoId: idrecurso,
        },
        include: {
          TipoServico: true,
          Estabelecimento: true,
          Recurso: true,
          Cliente: true,
        },
      })

      return reply.code(200).send(agendas)
    } catch (error) {
      console.error('Erro ao buscar agendas de serviço:', error)
      return reply
        .code(500)
        .send({ message: 'Erro ao buscar agendas de serviço.' })
    }
  })

  app.post('/buscaragendacliente', async (request, reply) => {
    try {
      const bodySchema = z.object({
        id: z.string(),
      })

      const { id } = bodySchema.parse(request.body)

      const agendas = await prisma.agenda.findMany({
        where: {
          clienteId: parseInt(id),
        },
        include: {
          TipoServico: true,
          Estabelecimento: true,
          Recurso: true,
          Cliente: true,
        },
      })

      return reply.code(200).send(agendas)
    } catch (error) {
      console.error('Erro ao buscar agendas de serviço:', error)
      return reply
        .code(500)
        .send({ message: 'Erro ao buscar agendas de serviço.' })
    }
  })

  app.post('/buscarreservasativas', async (request, reply) => {
    try {
      const bodySchema = z.object({
        id: z.string(),
      })

      const { id } = bodySchema.parse(request.body)

      const today = new Date() // Obtém a data atual
      console.log(today)
      today.setHours(0, 0, 0, 0) // Define a hora para 00:00:00 para considerar apenas a data

      const agendas = await prisma.agenda.findMany({
        where: {
          clienteId: parseInt(id),
          AND: [
            {
              dia: { gte: today.getDate() },
              mes: { gte: today.getMonth() + 1 },
              ano: { gte: today.getFullYear() },
            },
            {
              createdAt: {
                gte: today, // Filtra agendas com data maior ou igual à data atual
              },
            },
          ],
        },
        orderBy: {
          createdAt: 'asc', // Ordena pelo campo horario em ordem crescente
        },
        include: {
          TipoServico: true,
          Estabelecimento: true,
          Recurso: true,
          Cliente: true,
        },
      })

      return reply.code(200).send(agendas)
    } catch (error) {
      console.error('Erro ao buscar agendas de serviço:', error)
      return reply
        .code(500)
        .send({ message: 'Erro ao buscar agendas de serviço.' })
    }
  })

  app.patch('/agendaservico/:idagenda', async (request, reply) => {
    try {
      // Validar o corpo da solicitação
      const paramsSchema = z.object({
        idagenda: z.string(),
      })

      const { idagenda } = paramsSchema.parse(request.params)

      const id = parseInt(idagenda)

      const bodySchema = z.object({
        dia: z.number(), // Validar se é um email válido
        mes: z.number(),
        ano: z.number(),
        horario: z.string(),
        estabelecimentoId: z.number(),
        tipoServicoId: z.number(),
        clienteId: z.number(),
        recursoId: z.number(),
      })
      const {
        dia,
        mes,
        ano,
        horario,
        estabelecimentoId,
        tipoServicoId,
        clienteId,
        recursoId,
      } = bodySchema.parse(request.body)

      // Criar um novo usuário no banco de dados
      const newAgenda = await prisma.agenda.update({
        where: {
          id,
        },
        data: {
          dia,
          mes,
          ano,
          horario,
          estabelecimentoId,
          tipoServicoId,
          clienteId,
          recursoId,
        },
      })

      // Enviar resposta com o novo usuário criado
      return reply.code(201).send(newAgenda)
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      // Enviar resposta de erro com código 400
      reply.code(400).send({ message: 'Erro ao criar usuário.' })
    }
  })

  app.delete('/agendaservico/:idagenda', async (request, reply) => {
    try {
      // Validar parâmetros da solicitação
      const paramsSchema = z.object({
        idagenda: z.string(),
      })
      const { idagenda } = paramsSchema.parse(request.params)

      // Converter o ID para número
      const id = parseInt(idagenda)

      // Verificar se o ID é um número válido
      if (isNaN(id)) {
        throw new Error('O ID do agenda deve ser um número válido.')
      }

      // Excluir o usuário com base no ID fornecido
      const deleteAgenda = await prisma.agenda.delete({
        where: {
          id,
        },
      })

      // Verificar se o usuário foi excluído com sucesso
      if (!deleteAgenda) {
        return reply.code(404).send({ message: 'Recurso não encontrado.' })
      }

      // Enviar resposta com o usuário excluído
      return reply.code(200).send(deleteAgenda)
    } catch (error) {
      console.error('Erro ao excluir recurso:', error)
      // Enviar resposta de erro com código 400
      return reply.code(400).send({ message: 'Erro ao excluir recurso.' })
    }
  })
  app.delete('/agendaservicoclient/:idagenda', async (request, reply) => {
    try {
      // Validar parâmetros da solicitação
      const paramsSchema = z.object({
        idagenda: z.string(),
      })
      const { idagenda } = paramsSchema.parse(request.params)

      // Converter o ID para número
      const id = parseInt(idagenda)

      // Verificar se o ID é um número válido
      if (isNaN(id)) {
        throw new Error('O ID do agenda deve ser um número válido.')
      }

      // Buscar o agendamento pelo ID
      const agenda = await prisma.agenda.findUnique({
        where: {
          id,
        },
      })

      // Verificar se o agendamento existe
      if (!agenda) {
        return reply.code(404).send({ message: 'Recurso não encontrado.' })
      }

      // Calcular a data atual e a data do agendamento
      const currentDate = new Date()
      const agendaDate = new Date(agenda.ano, agenda.mes - 1, agenda.dia)

      // Calcular a diferença em milissegundos
      const diffTime = agendaDate.getTime() - currentDate.getTime()

      // Calcular a diferença em dias
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      // Verificar se a diferença é menor que 2 dias
      if (diffDays < 2) {
        return reply.code(400).send({
          message:
            'Você só pode cancelar um agendamento com mais de 2 dias de antecedência,entra em contato via telefone.',
        })
      }

      // Excluir o agendamento
      const deleteAgenda = await prisma.agenda.delete({
        where: {
          id,
        },
      })

      // Enviar resposta com o agendamento excluído
      return reply.code(200).send(deleteAgenda)
    } catch (error) {
      console.error('Erro ao excluir recurso:', error)
      // Enviar resposta de erro com código 400
      return reply.code(400).send({ message: 'Erro ao excluir recurso.' })
    }
  })
}
