import { render } from 'react-email'

import { env } from '@/env'
import type { Locale } from '@/i18n/routing'

import { type EmailKind, emailMessages } from './messages'
import { ActionEmail } from './templates/action-email'
import { fromAddress, transport } from './transport'

type SendActionEmailArgs = {
  kind: EmailKind
  locale: Locale
  to: string
  url: string
}

export async function sendActionEmail({ kind, locale, to, url }: SendActionEmailArgs) {
  const copy = emailMessages[locale][kind]
  const element = <ActionEmail {...copy} lang={locale} siteName={env.EMAIL_FROM_NAME} url={url} />

  await transport.sendMail({
    from: fromAddress,
    to,
    subject: copy.subject,
    html: await render(element),
    text: await render(element, { plainText: true }),
  })
}
