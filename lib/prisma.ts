import { PrismaLibSql } from "@prisma/adapter-libsql"
import { PrismaClient } from "./generated/prisma/client"
import path from "path"

const dbUrl = process.env.DATABASE_URL ?? `file:${path.join(process.cwd(), "dev.db")}`

function createPrisma() {
  const adapter = new PrismaLibSql({ url: dbUrl })
  return new PrismaClient({ adapter } as never)
}

declare global {
  // eslint-disable-next-line no-var
  var __prisma: ReturnType<typeof createPrisma> | undefined
}

export const prisma = globalThis.__prisma ?? createPrisma()
if (process.env.NODE_ENV !== "production") globalThis.__prisma = prisma
