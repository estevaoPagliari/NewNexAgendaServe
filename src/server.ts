import fastify, { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { z } from 'zod'
import { loginRoutes } from '../routes/login'
import { userEstRoutes } from '../routes/userestabelecimento'
import { userCliRoutes } from '../routes/usercliente'
import { tiposervicoRoutes } from '../routes/tiposservico'
import { recursoRoutes } from '../routes/recurso'
import { agendaservicoRoutes } from '../routes/agendaservico'
import { horFunRoutes } from '../routes/horariofuncionamento'

// Importe o fastify-cors

const app: FastifyInstance = fastify()
app.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'DELETE'],
})

app.register(jwt, {
  secret: 'AiBike8266',
})

app.register(loginRoutes)
app.register(userEstRoutes)
app.register(userCliRoutes)
app.register(tiposervicoRoutes)
app.register(recursoRoutes)
app.register(agendaservicoRoutes)
app.register(horFunRoutes)

app.get('/', async () => {
  return 'Bem Vindo a DevNex GET'
})

app.post('/devnex', async (request) => {
  try {
    // Validar o corpo da solicitação
    const bodySchema = z.object({
      phone: z.string().regex(/^\d{11}$/), // Validar se é uma string com exatamente 11 números
    })
    const { phone } = bodySchema.parse(request.body)

    if (phone.match(/^\d{11}$/)) {
      const nome = 'Estevao'
      const email = 'estevao@estevao.com.br'
      const texto = 'Estevao com cadastro ativo'
      const vazio = 'null'
      console.log('sucesso no rota post')
      return { message: 'Pessoal Cadastrada', nome, email, texto, vazio, phone }
    } else {
      console.log('error post')
      return { message: 'Error, telefone inválido' }
    }
  } catch (error) {
    console.error(error)
    return { message: 'Error, telefone inválido' }
  }
  // return { message: 'Bem Vindo a DevNex POST...🚀🚀🚀 ' }
})

app
  .listen({
    port: 8080,
    host: '0.0.0.0',
  })
  .then(() => {
    console.log('🚀 Server Api rodando')
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
