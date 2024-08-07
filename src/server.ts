import fastify, { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { loginRoutes } from '../routes/login'
import { userEstRoutes } from '../routes/userestabelecimento'
import { userCliRoutes } from '../routes/usercliente'
import { tiposervicoRoutes } from '../routes/tiposservico'
import { recursoRoutes } from '../routes/recurso'
import { agendaservicoRoutes } from '../routes/agendaservico'
import { horFunRoutes } from '../routes/horariofuncionamento'
import { routertwilio } from '../routes/twilio'

// Importe o fastify-cors

const app: FastifyInstance = fastify()
app.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
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
app.register(routertwilio)

app.get('/', async () => {
  return 'Bem Vindo a DevNex GET'
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
