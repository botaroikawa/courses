import nodemailer from 'nodemailer'

import { env } from '@/env'

// One SMTP transport shared by Payload and Better Auth.
// Development points at Mailpit, production at Resend's SMTP relay.
export const transport = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
})

export const fromAddress = `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM_ADDRESS}>`
