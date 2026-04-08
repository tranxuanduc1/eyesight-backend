import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { types } from 'pg'

// pg returns Date objects that lose toJSON through the driver adapter, causing {} in JSON.
// Return timestamps as ISO strings so they serialize correctly.
types.setTypeParser(1082, (val: string) => val)           // date
types.setTypeParser(1114, (val: string) => val)           // timestamp
types.setTypeParser(1184, (val: string) => val)           // timestamptz

const globalForPrisma = global as unknown as {
    prisma: PrismaClient
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = globalForPrisma.prisma || new PrismaClient({
  adapter,
  
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma