import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

let _transporter: Transporter | null = null

export function getMailer(): Transporter {
  if (_transporter) return _transporter

  const config = useRuntimeConfig()

  _transporter = nodemailer.createTransport({
    host: config.smtpHost || 'smtp.gmail.com',
    port: parseInt(config.smtpPort as string) || 587,
    secure: parseInt(config.smtpPort as string) === 465,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  })

  return _transporter
}

export async function sendMail(options: {
  to: string
  subject: string
  html: string
}) {
  const mailer = getMailer()
  const config = useRuntimeConfig()

  return mailer.sendMail({
    from: config.smtpFrom || 'Scudyweb <scudyweb@gmail.com>',
    ...options,
  })
}
