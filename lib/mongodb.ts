import { MongoClient } from 'mongodb'

const mongoUri = process.env.MONGODB_URI
if (!mongoUri) throw new Error('MONGODB_URI must be configured')

const globalForMongo = globalThis as typeof globalThis & { wedPlanMongoClient?: MongoClient }
export const mongoClient = globalForMongo.wedPlanMongoClient ?? new MongoClient(mongoUri)
if (process.env.NODE_ENV !== 'production') globalForMongo.wedPlanMongoClient = mongoClient

export const database = mongoClient.db(process.env.MONGODB_DB ?? 'wedplan')
