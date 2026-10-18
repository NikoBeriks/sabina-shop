import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

function getPrismaClient() {
  if (process.env.VERCEL === '1') {
    const targetDb = '/tmp/dev.db'
    if (!fs.existsSync(targetDb)) {
      const possibleLocations = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
        path.join(__dirname, '..', '..', 'prisma', 'dev.db'),
        path.join(__dirname, '..', '..', 'dev.db'),
      ]

      for (const loc of possibleLocations) {
        if (fs.existsSync(loc)) {
          try {
            fs.mkdirSync(path.dirname(targetDb), { recursive: true })
            fs.copyFileSync(loc, targetDb)
            console.log('Database successfully copied from', loc, 'to', targetDb)
            break
          } catch (e) {
            console.error('Error copying db from ' + loc + ':', e)
          }
        }
      }
    }

    if (fs.existsSync(targetDb)) {
      process.env.DATABASE_URL = 'file:' + targetDb
    }
  }

  return new PrismaClient({
    log: ['error', 'warn'],
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? getPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
