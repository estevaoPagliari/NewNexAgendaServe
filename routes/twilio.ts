import { FastifyInstance } from 'fastify'
import { Twilio } from 'twilio'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function routertwilio(app: FastifyInstance) {
  app.post('/twilio', async (request, reply) => {
    // Substitua os valores de ambiente apropriados

    const bodySchema = z.object({
      phone: z.string().regex(/^\d{11}$/), // Validar se é uma string com exatamente 11 números
      cSid: z.string(),
    })
    const { phone, cSid } = bodySchema.parse(request.body)

    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      reply.status(500).send({
        error: 'Twilio credentials are not set in environment variables.',
      })
      return
    }

    const client = new Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    )

    const message = await client.messages.create({
      contentSid: cSid,
      from: 'whatsapp:+5519993981742',
      messagingServiceSid: 'MG903176ea0f763cc009f31a9c55c6df19',
      to: 'whatsapp:+55' + phone,
    })
    console.log(message)

    reply.status(500).send({
      message,
    })
  })

  app.post('/twilioid', async (request, reply) => {
    // Substitua os valores de ambiente apropriados

    // Validação do corpo da requisição
    const bodySchema = z.object({
      id: z.number(),
    })

    // Extrai os valores do corpo da requisição e valida
    const { id } = bodySchema.parse(request.body)

    // Verifica se as credenciais do Twilio estão definidas
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      reply.status(500).send({
        error: 'Twilio credentials are not set in environment variables.',
      })
      return
    }

    try {
      // Busca o cliente no banco de dados pelo ID
      const user = await prisma.userCliente.findUnique({
        where: {
          id,
        },
      })

      if (!user) {
        reply.status(404).send({
          error: 'Cliente não encontrado.',
        })
        return
      }

      // Configura o cliente do Twilio
      const client = new Twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
      )

      // Envia a mensagem usando o Twilio
      const message = await client.messages.create({
        contentSid: process.env.TWILIOCONFIRMARAGENDA,
        from: 'whatsapp:+5519993981742', // Número do WhatsApp do Twilio
        messagingServiceSid: 'MG903176ea0f763cc009f31a9c55c6df19', // SID do serviço de mensagens do Twilio
        to: `whatsapp:+55${user.telefone}`, // Número de telefone do cliente
      })

      console.log(message)

      // Responde com a mensagem enviada
      reply.status(200).send({
        message: 'Mensagem enviada com sucesso!',
        twilioMessage: message,
      })
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      reply.status(500).send({
        error: 'Erro ao enviar mensagem.',
      })
    }
  })
}
