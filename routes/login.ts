import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

export async function loginRoutes(app: FastifyInstance) {
  app.post('/login', async (request, reply) => {
    try {
      const bodySchema = z.object({
        email: z.string(),
        senha: z.string(),
      })

      const { email, senha } = bodySchema.parse(request.body)

      const login = await prisma.userEstabelecimento.findUnique({
        where: {
          email,
        },
      })

      console.log('Login')
      if (login && (await login).senha === senha) {
        const token = app.jwt.sign(
          { name: (await login).nome },
          { sub: String((await login).id), expiresIn: '1d' },
        )
        return reply
          .status(200)
          .send({ message: 'credenciaisCorretas: true', token })
      } else {
        return reply.status(401).send({ message: 'credenciaisCorretas: false' })
      }
    } catch (error) {
      console.error('Error during login:', error)
      return reply.status(500).send({ message: 'Internal Server Error' })
    }
  })

  app.post('/loginclient', async (request, reply) => {
    try {
      const bodySchema = z.object({
        email: z.string(),
        senha: z.string(),
      })

      const { email, senha } = bodySchema.parse(request.body)

      const login = await prisma.userCliente.findUnique({
        where: {
          email,
        },
      })

      console.log('Login')
      if (login && (await login).senha === senha) {
        const token = app.jwt.sign(
          { name: (await login).nome },
          { sub: String((await login).id), expiresIn: '1d' },
        )
        return reply
          .status(200)
          .send({ message: 'credenciaisCorretas: true', token })
      } else {
        return reply.status(401).send({ message: 'credenciaisCorretas: false' })
      }
    } catch (error) {
      console.error('Error during login:', error)
      return reply.status(500).send({ message: 'Internal Server Error' })
    }
  })
}
