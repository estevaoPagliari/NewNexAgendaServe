import { FastifyInstance } from 'fastify'
import { Twilio } from 'twilio'
import { z } from 'zod'

export async function routertwilio(app: FastifyInstance) {
  app.post('/twilio', async (request, reply) => {
    // Substitua os valores de ambiente apropriados
    const accountSid = 'ACf34837138f96d911c518b594f001e860'
    const authToken = 'fef3cec1788e3a770f525c782be5a117'

    const bodySchema = z.object({
      phone: z.string().regex(/^\d{11}$/), // Validar se é uma string com exatamente 11 números
      cSid: z.string(),
    })
    const { phone, cSid } = bodySchema.parse(request.body)

    if (!accountSid || !authToken) {
      reply.status(500).send({
        error: 'Twilio credentials are not set in environment variables.',
      })
      return
    }

    const client = new Twilio(accountSid, authToken)

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
}
