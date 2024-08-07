import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.SENHA,
  },
})

// Função para enviar e-mail com HTML
// Função para enviar e-mail com HTML
const sendEmail = (to: string, subject: string, senha: string) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recuperação de Senha</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          padding: 20px;
          border-radius: 5px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #333333;
        }
        p {
          font-size: 16px;
          color: #555555;
        }
        .button {
          display: inline-block;
          font-size: 16px;
          color: #ffffff;
          background-color: #007bff;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
        }
        .footer {
          font-size: 12px;
          color: #aaaaaa;
          margin-top: 20px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Recuperação de Senha</h1>
        <p>Olá,</p>
        <p>Recebemos uma solicitação para redefinir a sua senha. Sua nova senha esta aqui:</p>
        <p>Senha : ${senha}</p>
        <div class="footer">
          <p>Atenciosamente,<br>Sua Equipe</p>
        </div>
      </div>
    </body>
    </html>
  `

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: htmlContent,
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erro ao enviar e-mail:', error)
    } else {
      console.log('E-mail enviado:', info.response)
    }
  })
}

const generateRandomPassword = (length: number): string => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:',.<>?/"
  let password = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    password += charset[randomIndex]
  }
  return password
}

export async function userCliRoutes(app: FastifyInstance) {
  // get geral
  app.get('/usercliente', async (request, reply) => {
    try {
      const users = await prisma.userCliente.findMany({
        select: {
          nome: true,
          cpf: true,
          telefone: true,
          email: true,
          habilitado: true,
          id: true,
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
          habilitado: true,
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
        habilitado: z.boolean().optional(),
        telefone: z.string().optional(),
      })
      const { email, nome, habilitado, telefone, cpf, senha } =
        bodySchema.parse(request.body)

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
          habilitado,
        },
      })

      // Verificar se o usuário foi atualizado com sucesso

      // Enviar resposta com o usuário atualizado
      if (!updatedUser) {
        return reply.code(404).send({ message: 'Usuário não encontrado.' })
      }

      // Enviar resposta com a mensagem de sucesso e o usuário atualizado
      return reply
        .code(200)
        .send({ message: 'Usuário atualizado com sucesso.' })
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
      // Enviar resposta de erro com código 400
      return reply.code(400).send({ message: 'Erro ao atualizar usuário.' })
    }
  })

  app.patch('/userclientehablitada/:cpf', async (request, reply) => {
    try {
      // Validar parâmetros da solicitação
      const paramsSchema = z.object({
        cpf: z.string(),
      })
      const { cpf } = paramsSchema.parse(request.params)

      // Validar corpo da solicitação
      const bodySchema = z.object({
        email: z.string().email().optional(), // Validar se é um email válido
        nome: z.string().optional(),
        senha: z.string().optional(),
        habilitado: z.boolean().optional(),
        telefone: z.string().optional(),
      })
      const { email, nome, habilitado, telefone, senha } = bodySchema.parse(
        request.body,
      )

      // Atualizar o usuário com base no ID fornecido
      const updatedUser = await prisma.userCliente.update({
        where: {
          cpf,
        },
        data: {
          email,
          nome,
          telefone,
          cpf,
          senha,
          habilitado,
        },
      })

      // Verificar se o usuário foi atualizado com sucesso

      // Enviar resposta com o usuário atualizado
      if (!updatedUser) {
        return reply.code(404).send({ message: 'Usuário não encontrado.' })
      }

      // Enviar resposta com a mensagem de sucesso e o usuário atualizado
      return reply
        .code(200)
        .send({ message: 'Usuário atualizado com sucesso.' })
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

  app.post('/recuperarsenha', async (request, reply) => {
    try {
      const userSchema = z.object({
        email: z.string().email(), // Validar se é um email válido
      })
      const { email } = userSchema.parse(request.body)

      const updateclient = await prisma.userCliente.findMany({
        where: {
          email,
        },
      })

      if (updateclient.length === 0) {
        return reply.code(404).send({ message: 'Email não encontrado.' })
      }

      // Gerar nova senha aleatória
      const newPassword = generateRandomPassword(10)

      // Atualizar a senha no banco de dados
      await prisma.userCliente.update({
        where: { email },
        data: { senha: newPassword }, // Certifique-se de que o campo 'senha' está sendo corretamente atualizado
      })

      sendEmail(updateclient[0].email, 'Sua nova senha', newPassword)

      return reply.code(200).send({ message: 'Nova senha enviada por e-mail.' })
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      // Enviar resposta de erro com código 400
      return reply.code(400).send({ message: 'Erro ao excluir usuário.' })
    }
  })
}
