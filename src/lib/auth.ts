import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { magicLink } from 'better-auth/plugins/magic-link'
import { z } from 'zod'

import { env } from '@/env'
import { defaultLocale, isLocale, type Locale, locales } from '@/i18n/routing'
import { accounts, sessions, users, verifications } from '@/payload-generated-schema'

import { db } from './db'
import { sendActionEmail } from './email/send'
import { motionPreferences, themePreferences } from './preferences/options'

// next-intl remembers the visitor's locale in this cookie
function localeFromHeaders(headers: Headers | undefined): Locale {
  const match = headers?.get('cookie')?.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/)
  const value = match?.[1]
  return isLocale(value) ? value : defaultLocale
}

function userLocale(user: object, headers?: Headers): Locale {
  const locale = 'locale' in user ? user.locale : undefined
  return isLocale(locale) ? locale : localeFromHeaders(headers)
}

const socialProviders = {
  ...(env.GOOGLE_CLIENT_ID &&
    env.GOOGLE_CLIENT_SECRET && {
      google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET },
    }),
  ...(env.GITHUB_CLIENT_ID &&
    env.GITHUB_CLIENT_SECRET && {
      github: { clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET },
    }),
}

export const enabledSocialProviders = Object.keys(socialProviders) as Array<
  keyof typeof socialProviders
>

export const auth = betterAuth({
  appName: env.EMAIL_FROM_NAME,
  // Tables are Payload collections (src/collections/auth). Payload owns their migrations.
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { user: users, session: sessions, account: accounts, verification: verifications },
  }),
  advanced: {
    database: { generateId: 'uuid' },
  },
  user: {
    additionalFields: {
      // No default here: databaseHooks.user.create fills it from the visitor's locale
      locale: {
        type: 'string',
        required: false,
        validator: { input: z.enum(locales) },
      },
      motionPreference: {
        type: 'string',
        required: false,
        defaultValue: 'system',
        validator: { input: z.enum(motionPreferences) },
      },
      themePreference: {
        type: 'string',
        required: false,
        defaultValue: 'system',
        validator: { input: z.enum(themePreferences) },
      },
    },
  },
  // Payload names the relationship field `user` (column `user_id`)
  session: { fields: { userId: 'user' } },
  account: {
    fields: { userId: 'user' },
    accountLinking: { enabled: true, trustedProviders: ['google', 'github'] },
  },
  databaseHooks: {
    user: {
      create: {
        // Sign-ups through OAuth or magic link carry no locale; take it from the visitor
        before: async (user, ctx) => {
          if (isLocale((user as { locale?: unknown }).locale)) return { data: user }
          return {
            data: { ...user, locale: localeFromHeaders(ctx?.headers ?? ctx?.request?.headers) },
          }
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }, request) => {
      await sendActionEmail({
        kind: 'resetPassword',
        locale: userLocale(user, request?.headers),
        to: user.email,
        url,
      })
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    // Signing in with an unverified email sends a fresh confirmation link
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }, request) => {
      await sendActionEmail({
        kind: 'verifyEmail',
        locale: userLocale(user, request?.headers),
        to: user.email,
        url,
      })
    },
  },
  socialProviders,
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }, ctx) => {
        await sendActionEmail({
          kind: 'magicLink',
          locale: localeFromHeaders(ctx?.headers ?? ctx?.request?.headers),
          to: email,
          url,
        })
      },
    }),
    // Must stay last: lets server actions set auth cookies
    nextCookies(),
  ],
})

export type Session = typeof auth.$Infer.Session
