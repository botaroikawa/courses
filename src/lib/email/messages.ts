import type { Locale } from '@/i18n/routing'

export type EmailKind = 'verifyEmail' | 'magicLink' | 'resetPassword'

type EmailCopy = {
  subject: string
  preview: string
  heading: string
  body: string
  action: string
  ignore: string
}

export const emailMessages: Record<Locale, Record<EmailKind, EmailCopy>> = {
  en: {
    verifyEmail: {
      subject: 'Confirm your email',
      preview: 'Confirm your email to finish creating your account',
      heading: 'Confirm your email',
      body: 'Click the button below to confirm your email address and finish creating your account.',
      action: 'Confirm email',
      ignore: "If you didn't create an account, you can ignore this email.",
    },
    magicLink: {
      subject: 'Your sign-in link',
      preview: 'Use this link to sign in',
      heading: 'Sign in',
      body: 'Click the button below to sign in. The link expires in a few minutes and can only be used once.',
      action: 'Sign in',
      ignore: "If you didn't request this link, you can ignore this email.",
    },
    resetPassword: {
      subject: 'Reset your password',
      preview: 'Use this link to choose a new password',
      heading: 'Reset your password',
      body: 'Click the button below to choose a new password.',
      action: 'Reset password',
      ignore: "If you didn't ask to reset your password, you can ignore this email.",
    },
  },
  es: {
    verifyEmail: {
      subject: 'Confirma tu email',
      preview: 'Confirma tu email para terminar de crear tu cuenta',
      heading: 'Confirma tu email',
      body: 'Pulsa el botón para confirmar tu dirección de email y terminar de crear tu cuenta.',
      action: 'Confirmar email',
      ignore: 'Si no has creado ninguna cuenta, puedes ignorar este email.',
    },
    magicLink: {
      subject: 'Tu enlace de acceso',
      preview: 'Usa este enlace para iniciar sesión',
      heading: 'Inicia sesión',
      body: 'Pulsa el botón para iniciar sesión. El enlace caduca en unos minutos y solo se puede usar una vez.',
      action: 'Iniciar sesión',
      ignore: 'Si no has pedido este enlace, puedes ignorar este email.',
    },
    resetPassword: {
      subject: 'Restablece tu contraseña',
      preview: 'Usa este enlace para elegir una contraseña nueva',
      heading: 'Restablece tu contraseña',
      body: 'Pulsa el botón para elegir una contraseña nueva.',
      action: 'Restablecer contraseña',
      ignore: 'Si no has pedido restablecer tu contraseña, puedes ignorar este email.',
    },
  },
  ca: {
    verifyEmail: {
      subject: 'Confirma el teu correu',
      preview: 'Confirma el teu correu per acabar de crear el compte',
      heading: 'Confirma el teu correu',
      body: 'Prem el botó per confirmar la teva adreça de correu i acabar de crear el compte.',
      action: 'Confirmar correu',
      ignore: 'Si no has creat cap compte, pots ignorar aquest correu.',
    },
    magicLink: {
      subject: "El teu enllaç d'accés",
      preview: 'Fes servir aquest enllaç per iniciar la sessió',
      heading: 'Inicia la sessió',
      body: "Prem el botó per iniciar la sessió. L'enllaç caduca en uns minuts i només es pot fer servir una vegada.",
      action: 'Iniciar la sessió',
      ignore: 'Si no has demanat aquest enllaç, pots ignorar aquest correu.',
    },
    resetPassword: {
      subject: 'Restableix la contrasenya',
      preview: 'Fes servir aquest enllaç per triar una contrasenya nova',
      heading: 'Restableix la contrasenya',
      body: 'Prem el botó per triar una contrasenya nova.',
      action: 'Restablir la contrasenya',
      ignore: 'Si no has demanat restablir la contrasenya, pots ignorar aquest correu.',
    },
  },
}
