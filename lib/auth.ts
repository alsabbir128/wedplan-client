import { APIError, createAuthMiddleware } from 'better-auth/api'
import { mongodbAdapter } from '@better-auth/mongo-adapter'
import { betterAuth } from 'better-auth'
import { jwt } from 'better-auth/plugins'
import { ObjectId } from 'mongodb'
import { database, mongoClient } from '@/lib/mongodb'
const authBaseUrl = process.env.BETTER_AUTH_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.V0_RUNTIME_URL ?? 'http://localhost:3000')

const googleCredentialsAvailable = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)

export const auth = betterAuth({
  database: mongodbAdapter(database, { client: mongoClient }),
  baseURL: authBaseUrl,
  user: {
    modelName: 'users',
    additionalFields: {
      role: { type: 'string', required: true, defaultValue: 'customer', input: true },
      isBlocked: { type: 'boolean', required: true, defaultValue: false, input: false },
      businessName: { type: 'string', required: false, input: true },
      subscriptionPlan: { type: 'string', required: true, defaultValue: 'free', input: false },
      subscriptionExpiresAt: { type: 'date', required: false, input: false },
      subscriptionCancelAtPeriodEnd: { type: 'boolean', required: true, defaultValue: false, input: false },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  ...(googleCredentialsAvailable
    ? {
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
          },
        },
      }
    : {}),
  plugins: [
    jwt({
      jwks: { keyPairConfig: { alg: 'RS256', modulusLength: 2048 } },
      jwt: { issuer: authBaseUrl, audience: authBaseUrl },
    }),
  ],
  hooks: {
    before: createAuthMiddleware(async (context) => {
      if (context.path !== '/sign-up/email') return
      const body = context.body as Record<string, unknown> | undefined
      const role = body?.role
      if (role !== 'customer' && role !== 'vendor') {
        throw new APIError('BAD_REQUEST', { message: 'Choose a customer or vendor account.' })
      }

      const password = body?.password
      if (typeof password !== 'string' || !/^(?=.*[a-z])(?=.*[A-Z]).{6,}$/.test(password)) {
        throw new APIError('BAD_REQUEST', {
          message: 'Password must contain at least 6 characters, including uppercase and lowercase letters.',
        })
      }

      if (role === 'vendor' && (typeof body?.businessName !== 'string' || !body.businessName.trim())) {
        throw new APIError('BAD_REQUEST', { message: 'Business name is required for vendor accounts.' })
      }
    }),
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: {
            ...user,
            role: user.role === 'vendor' ? 'vendor' : 'customer',
            isBlocked: false,
            subscriptionPlan: 'free',
          },
        }),
      },
    },
    session: {
      create: {
        before: async (session) => {
          const user = ObjectId.isValid(session.userId)
            ? await database.collection('users').findOne(
                { _id: new ObjectId(session.userId) },
                { projection: { isBlocked: 1 } },
              )
            : null
          if (user?.isBlocked) {
            throw new APIError('FORBIDDEN', { message: 'This account is blocked.' })
          }
          return { data: session }
        },
      },
    },
  },
  trustedOrigins: [
    ...(process.env.NODE_ENV === 'development'
      ? [
          'http://localhost:3000',
          ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
          ...(process.env.V0_DEV_APP_URL ? [process.env.V0_DEV_APP_URL] : []),
          ...(process.env.V0_BUILD_URL ? [process.env.V0_BUILD_URL] : []),
          ...(process.env.V0_SANDBOX_URL ? [process.env.V0_SANDBOX_URL] : []),
        ]
      : []),
    ...(process.env.NODE_ENV === 'production'
      ? [
          ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
          ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
            ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
            : []),
        ]
      : []),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  ...(process.env.NODE_ENV === 'development'
    ? {
        advanced: {
          defaultCookieAttributes: {
            sameSite: 'none' as const,
            secure: true,
          },
        },
      }
    : {}),
})

export const isGoogleAuthEnabled = googleCredentialsAvailable
