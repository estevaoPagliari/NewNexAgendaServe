import { FastifyInstance } from 'fastify'
import { Twilio } from 'twilio'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { SessionsClient } from '@google-cloud/dialogflow'
import axios from 'axios'

// Variáveis
const projectId = 'coliseum-wtpo'
const verifyToken = 'C0liseum'

// Dialogflow
const sessionClient = new SessionsClient()

// eslint-disable-next-line camelcase
const sendMessage = async (to: string, from: string, msg_body: string) => {
  await axios({
    method: 'POST',
    url: `https://graph.facebook.com/v12.0/${to}/messages?access_token=${process.env.WHATSAPP}`,
    data: {
      messaging_product: 'whatsapp',
      to: from,
      // eslint-disable-next-line camelcase
      text: { body: msg_body },
    },
    headers: { 'Content-Type': 'application/json' },
  })
}
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
  /** */
  app.post('/webhook', async (request, reply) => {
    // Schema para validação dos query parameters

    // Schema para validação do corpo da requisição
    const bodySchema = z.object({
      object: z.string(),
      entry: z.array(
        z.object({
          changes: z.array(
            z.object({
              value: z.object({
                metadata: z.object({
                  phone_number_id: z.string(),
                }),
                messages: z.array(
                  z.object({
                    from: z.string(),
                    text: z.object({
                      body: z.string(),
                    }),
                  }),
                ),
              }),
            }),
          ),
        }),
      ),
    })

    // Verificação e resposta de subscrição

    // Processamento das mensagens
    const body = bodySchema.safeParse(request.body)
    if (body.success) {
      const { entry } = body.data
      const { changes } = entry[0]
      const { value } = changes[0]
      const { metadata, messages } = value
      const message = messages[0]
      const to = metadata.phone_number_id
      const from = message.from
      // eslint-disable-next-line camelcase
      const msg_body = message.text.body

      // Definição da sessão do Dialogflow
      const sessionPath = sessionClient.projectAgentSessionPath(projectId, from)
      const requestPayload = {
        session: sessionPath,
        queryInput: {
          text: {
            // eslint-disable-next-line camelcase
            text: msg_body,
            languageCode: 'pt-BR',
          },
        },
      }

      // Obtendo respostas do Dialogflow
      try {
        const [response] = await sessionClient.detectIntent(requestPayload)
        const queryResult = response?.queryResult
        if (queryResult) {
          const fulfillmentMessages = queryResult.fulfillmentMessages
          if (fulfillmentMessages && fulfillmentMessages.length > 0) {
            let responseMsg = ''
            for (const msg of fulfillmentMessages) {
              if (msg.text && msg.text.text) {
                responseMsg += msg.text.text.join('\n') + '\n'
              }
            }
            await sendMessage(to, from, responseMsg)
            return reply.code(200).send()
          } else {
            return reply.code(500).send('No fulfillment messages found.')
          }
        } else {
          return reply.code(500).send('No query result found.')
        }
      } catch (e) {
        console.error('Erro ao processar a mensagem:', e)
        return reply.code(500).send('Erro ao processar a mensagem.')
      }
    }

    return reply.code(400).send('Invalid request data')
  })

  app.get('/webhook', (request, reply) => {
    // Definindo o esquema para validação dos parâmetros da consulta
    const querySchema = z.object({
      'hub.mode': z.string(),
      'hub.verify_token': z.string(),
      'hub.challenge': z.string(),
    })

    // Validando os parâmetros da consulta
    const queryValidation = querySchema.safeParse(request.query)
    if (!queryValidation.success) {
      reply.code(400).send('Invalid query parameters')
      return
    }

    const {
      'hub.mode': mode,
      'hub.verify_token': token,
      'hub.challenge': challenge,
    } = queryValidation.data

    // Verifica o modo e o token de verificação
    if (mode === 'subscribe' && token === verifyToken) {
      reply.code(200).send(challenge)
      console.log('Webhook verified successfully!')
    } else {
      reply.code(403).send('Forbidden')
    }
  })

  app.post('/facebook', async (request, reply) => {
    const bodySchema = z.object({
      phone: z.string().regex(/^\d{11}$/), // Validar se é uma string com exatamente 11 números
      cSid: z.string(), // Nome do template a ser enviado
    })
    const { phone, cSid } = bodySchema.parse(request.body)

    try {
      const response = await axios.post(
        `https://graph.facebook.com/v20.0/${process.env.FACEBOOK_PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: `55${phone}`, // Inclui o código do país
          type: 'template',
          template: {
            name: cSid,
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

      reply.status(200).send({
        message: response.data,
      })
    } catch (error) {
      console.error(error)
      reply.status(500).send({
        error: 'Failed to send message via Facebook API',
      })
    }
  })
}
