import { MongoClient } from 'mongodb'
import { betterAuth } from 'better-auth'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'
import { jwt } from 'better-auth/plugins'

const mongoUri = process.env.MONGODB_URI
if (!mongoUri) throw new Error('MONGODB_URI must be configured for Better Auth')

const globalMongo = globalThis as typeof globalThis & { __wedplanMongoClient?: MongoClient }
const mongoClient = globalMongo.__wedplanMongoClient ?? new MongoClient(mongoUri)
if (process.env.NODE_ENV !== 'production') globalMongo.__wedplanMongoClient = mongoClient

const authBaseUrl = process.env.BETTER_AUTH_URL
  ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.V0_RUNTIME_URL ?? 'http://localhost:3000')
const authAudience = process.env.BETTER_AUTH_AUDIENCE ?? 'wedplan-api'
const database = mongoClient.db(process.env.MONGODB_DB)

export const auth = betterAuth({
  database: mongodbAdapter(database, { client: mongoClient }),
  baseURL: authBaseUrl,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  user: {
    modelName: 'users',
    additionalFields: {
      role: { type: 'string', defaultValue: 'customer', input: false },
      isBlocked: { type: 'boolean', defaultValue: false, input: false },
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
  plugins: [
    jwt({
      jwks: { keyPairConfig: { alg: 'RS256', modulusLength: 2048 } },
      jwt: { issuer: authBaseUrl, audience: authAudience, expirationTime: '15m' },
    }),
  ],
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
