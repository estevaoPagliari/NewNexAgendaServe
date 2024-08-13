/* eslint-disable no-unmodified-loop-condition */
/* eslint-disable prefer-const */
import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import axios from 'axios'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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
      data: z
        .string()
        .refine((data) => {
          // Validação simples para o formato dd/MM/yyyy
          return /^\d{2}\/\d{2}\/\d{4}$/.test(data)
        }, 'Formato de data inválido, deve ser dd/MM/yyyy')
        .optional(),
      recursoId: z.number().optional(),
    })

    try {
      const { nome, cpf, horario, data, recursoId } = bodySchema.parse(
        request.body,
      )

      // Se a data for fornecida, divida-a em dia, mes e ano
      let dia, mes, ano
      if (data) {
        ;[dia, mes, ano] = data.split('/').map(Number)
      }

      const users = await prisma.agenda.findMany({
        where: {
          ...(dia && mes && ano ? { dia, mes, ano } : {}),
          horario,
          recursoId,
          Cliente: {
            id: {
              not: 2,
            },
            nome,
            cpf,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          TipoServico: {
            select: {
              nome: true,
              tempoServico: true,
            },
          },
          Estabelecimento: {
            select: {
              nome: true,
            },
          },
          Recurso: {
            select: {
              nome: true,
            },
          },
          Cliente: {
            select: {
              nome: true,
            },
          },
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
  app.post('/agendaservicopostcliente', async (request, reply) => {
    const bodySchema = z.object({
      id: z.number(),
    })

    try {
      const { id } = bodySchema.parse(request.body)

      const users = await prisma.agenda.findMany({
        where: {
          clienteId: id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          TipoServico: {
            select: {
              nome: true,
              tempoServico: true,
            },
          },
          Estabelecimento: {
            select: {
              nome: true, // Substitua 'nome' pelos campos que você deseja incluir
              // Adicione outros campos que você quer incluir
            },
          },
          Recurso: {
            select: {
              nome: true,
            },
          },
          Cliente: {
            select: {
              nome: true,
            },
          },
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
      if (clienteId !== 2) {
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
      }

      if (clienteId !== 2) {
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
            .send({ message: 'Você já tem um agendamento neste horário.' })
        }

        const verificarhabilitado = await prisma.userCliente.findUnique({
          where: {
            id: clienteId,
          },
        })

        if (verificarhabilitado?.habilitado === false) {
          return reply.code(400).send({
            message:
              'Atenção, você está bloqueado para agendar, entrar em contato via telefone',
          })
        }
      }

      const whatsapp = await prisma.userCliente.findUnique({
        where: {
          id: clienteId,
        },
      })

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

      // Fazer a requisição à rota /facebook para enviar a mensagem ao usuário
      try {
        if (whatsapp?.id !== 2) {
          const response = await axios.post(
            `https://graph.facebook.com/v20.0/${process.env.FACEBOOK_PHONE_NUMBER_ID}/messages`,
            {
              messaging_product: 'whatsapp',
              to: `55${whatsapp?.telefone}`, // Inclui o código do país
              type: 'template',
              template: {
                name: 'confirmacaoagenda',
                language: {
                  code: 'pt_BR',
                },
              },
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.FACEBOOK_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
              },
            },
          )

          console.log('Mensagem enviada com sucesso:', response.data)
        }
      } catch (error) {
        console.error('Erro ao enviar mensagem via Facebook API:', error)
      }

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
  app.post('/devnex', async (request, reply) => {
    try {
      // Validar o corpo da solicitação
      const bodySchema = z.object({
        phone: z.string().regex(/^\d{11}$/), // Validar se é uma string com exatamente 11 números
      })
      const { phone } = bodySchema.parse(request.body)

      const result = await prisma.userCliente.findMany({
        where: {
          telefone: phone,
        },
        include: {
          Agenda: {
            select: {
              dia: true,
              mes: true,
              ano: true,
              horario: true,
              Recurso: {
                select: {
                  nome: true,
                },
              },
            },
          },
        },
      })

      const user = result.find((user) => user.telefone === phone)

      if (result && result.length > 0) {
        // Filtrar a agenda para incluir apenas eventos a partir de hoje
        const today = new Date()
        today.setHours(0, 0, 0, 0) // Elimina o horário, considerando apenas a data

        const upcomingAgenda = user?.Agenda.filter((evento) => {
          const eventDate = new Date(evento.ano, evento.mes - 1, evento.dia)

          console.log('Dia Agendado' + eventDate)
          console.log('Dia server :' + today)
          return eventDate >= today
        })

        // Concatenar os detalhes da agenda com formatação de data
        const agendaText = upcomingAgenda
          ?.map((evento) => {
            const eventDate = new Date(evento.ano, evento.mes - 1, evento.dia)

            const formattedDate = format(eventDate, 'dd/MM/yyyy', {
              locale: ptBR,
            })
            return `${formattedDate} - ${evento.horario}, no campo: ${evento.Recurso.nome}\n`
          })
          .join('') // Default para string vazia se undefined

        return reply.send({
          message: 'Pessoa Cadastrada',
          nome: user?.nome,
          email: user?.email,
          telefone: user?.telefone,
          texto: agendaText,
        })
      } else {
        return reply.send({
          message: 'Usuário não cadastrado',
          texto: '',
        })
      }
    } catch (error) {
      console.error(error)
      return { message: 'Error, telefone inválido' }
    }
  })

  app.post('/bloqueardia', async (request, reply) => {
    try {
      const bodySchema = z.object({
        dia: z.number(),
        mes: z.number(),
        ano: z.number(),
        estabelecimentoId: z.number(),
        tipoServicoId: z.number(),
        clienteId: z.number(),
        recursoId: z.number(),
        recursoId2: z.number(),
        DiaSemana: z.string(),
      })

      const {
        dia,
        mes,
        ano,
        estabelecimentoId,
        tipoServicoId,
        clienteId,
        recursoId,
        recursoId2,
        DiaSemana,
      } = bodySchema.parse(request.body)
      console.log(DiaSemana)
      const existingAgendas = await prisma.agenda.findMany({
        where: {
          dia,
          mes,
          ano,
          estabelecimentoId,
          OR: [{ recursoId }, { recursoId: recursoId2 }],
        },
      })

      if (existingAgendas.length > 0) {
        reply
          .status(400)
          .send({ message: 'Já existem agendamentos para este dia.' })
        return
      }

      const resulthorario = await prisma.horarioFuncionamento.findMany({
        where: { id: 1 },
      })
      let horarioAbertura = ''
      let horarioFechamento = ''
      if (resulthorario.length > 0) {
        if (DiaSemana !== 'sábado') {
          horarioAbertura = resulthorario[0].horarioAbertura // String "HH:mm"
          horarioFechamento = resulthorario[0].horarioFechamento // String "HH:mm"
        } else {
          horarioAbertura = resulthorario[0].horarioAberturasabado // String "HH:mm"
          horarioFechamento = resulthorario[0].horarioFechamentosabado // String "HH:mm"
        }

        // Converte strings para objetos Date
        const [horaAbertura, minutoAbertura] = horarioAbertura
          .split(':')
          .map(Number)
        const [horaFechamento, minutoFechamento] = horarioFechamento
          .split(':')
          .map(Number)

        const currentHorario = new Date()
        currentHorario.setHours(horaAbertura, minutoAbertura, 0, 0)

        const fimHorario = new Date()
        fimHorario.setHours(horaFechamento, minutoFechamento, 0, 0)

        while (currentHorario < fimHorario) {
          const horarioString = currentHorario.toTimeString().substring(0, 5) // Converte para string no formato HH:mm

          const newAgenda = await prisma.agenda.create({
            data: {
              dia,
              mes,
              ano,
              horario: horarioString,
              estabelecimentoId,
              tipoServicoId,
              clienteId,
              recursoId,
            },
          })

          const newAgenda2 = await prisma.agenda.create({
            data: {
              dia,
              mes,
              ano,
              horario: horarioString,
              estabelecimentoId,
              tipoServicoId,
              clienteId,
              recursoId: recursoId2,
            },
          })
          console.log(newAgenda2, newAgenda)
          currentHorario.setHours(currentHorario.getHours() + 1) // Incrementa uma hora
        }

        reply.send({ message: 'Horários bloqueados com sucesso.' })
      } else {
        reply.status(404).send({ message: 'Horário não encontrado.' })
      }
    } catch (error) {
      console.error(error)
      reply.status(500).send({ message: 'Erro no servidor.', error })
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
      const userclient = await prisma.userCliente.findUnique({
        where: {
          id: deleteAgenda.clienteId,
        },
      })
      // cliente horario vago
      if (deleteAgenda.clienteId !== 2) {
        try {
          const response = await axios.post(
            `https://graph.facebook.com/v20.0/${process.env.FACEBOOK_PHONE_NUMBER_ID}/messages`,
            {
              messaging_product: 'whatsapp',
              to: `55${userclient?.telefone}`, // Inclui o código do país
              type: 'template',
              template: {
                name: 'cancelamentoagenda',
                language: {
                  code: 'pt_BR',
                },
              },
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.FACEBOOK_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
              },
            },
          )

          console.log('Mensagem enviada com sucesso:', response.data)
        } catch (error) {
          console.error('Erro ao enviar mensagem via Facebook API:', error)
        }
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

      const userclient = await prisma.userCliente.findUnique({
        where: {
          id: deleteAgenda.clienteId,
        },
      })

      try {
        const response = await axios.post(
          `https://graph.facebook.com/v20.0/${process.env.FACEBOOK_PHONE_NUMBER_ID}/messages`,
          {
            messaging_product: 'whatsapp',
            to: `55${userclient?.telefone}`, // Inclui o código do país
            type: 'template',
            template: {
              name: 'cancelamentoagenda',
              language: {
                code: 'pt_BR',
              },
            },
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.FACEBOOK_ACCESS_TOKEN}`,
              'Content-Type': 'application/json',
            },
          },
        )

        console.log('Mensagem enviada com sucesso:', response.data)
      } catch (error) {
        console.error('Erro ao enviar mensagem via Facebook API:', error)
      }

      // Enviar resposta com o agendamento excluído
      return reply.code(200).send(deleteAgenda)
    } catch (error) {
      console.error('Erro ao excluir recurso:', error)
      // Enviar resposta de erro com código 400
      return reply.code(400).send({ message: 'Erro ao excluir recurso.' })
    }
  })
}
