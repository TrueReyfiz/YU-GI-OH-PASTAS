/**
 * syncCards.ts — popula o banco SQLite local com todas as cartas da YGOProDeck.
 *
 * Uso:
 *   npx tsx scripts/syncCards.ts
 *
 * O script faz upsert — pode ser reexecutado a qualquer momento para atualizar
 * cartas novas sem apagar os dados existentes.
 */

import { PrismaLibSql } from "@prisma/adapter-libsql"
import { PrismaClient } from "../lib/generated/prisma/client"
import path from "path"

const IMAGE_BASE = "https://images.ygoprodeck.com/images/cards_small"
const API_URL = "https://db.ygoprodeck.com/api/v7/cardinfo.php"

interface RawCardSet {
  set_name: string
  set_code: string
  set_rarity: string
}

interface RawCard {
  id: number
  name: string
  type: string
  frameType: string
  desc: string
  atk?: number
  def?: number
  level?: number
  race?: string
  attribute?: string
  card_sets?: RawCardSet[]
}

function createPrisma() {
  const dbUrl = process.env.DATABASE_URL ?? `file:${path.join(process.cwd(), "dev.db")}`
  const adapter = new PrismaLibSql({ url: dbUrl })
  return new PrismaClient({ adapter } as never)
}

async function fetchAllCards(): Promise<RawCard[]> {
  console.log("Buscando todas as cartas na YGOProDeck API...")
  const res = await fetch(API_URL)
  if (!res.ok) throw new Error(`API retornou ${res.status}`)
  const json = await res.json() as { data: RawCard[] }
  return json.data
}

async function main() {
  const prisma = createPrisma()
  const cards = await fetchAllCards()
  console.log(`Total de cartas recebidas: ${cards.length}`)

  let cardsDone = 0
  let setsDone = 0
  let errors = 0
  const BATCH = 100

  for (let i = 0; i < cards.length; i += BATCH) {
    const batch = cards.slice(i, i + BATCH)

    await Promise.all(
      batch.map(async (card) => {
        try {
          await (prisma as any).globalCard.upsert({
            where: { id: card.id },
            update: {
              name: card.name,
              type: card.type,
              frameType: card.frameType,
              desc: card.desc,
              atk: card.atk ?? null,
              def: card.def ?? null,
              level: card.level ?? null,
              race: card.race ?? null,
              attribute: card.attribute ?? null,
              imageUrl: `${IMAGE_BASE}/${card.id}.jpg`,
            },
            create: {
              id: card.id,
              name: card.name,
              type: card.type,
              frameType: card.frameType,
              desc: card.desc,
              atk: card.atk ?? null,
              def: card.def ?? null,
              level: card.level ?? null,
              race: card.race ?? null,
              attribute: card.attribute ?? null,
              imageUrl: `${IMAGE_BASE}/${card.id}.jpg`,
            },
          })
          cardsDone++

          if (card.card_sets && card.card_sets.length > 0) {
            await Promise.all(
              card.card_sets.map((cs) =>
                (prisma as any).cardSet.upsert({
                  where: { setCode: cs.set_code },
                  update: {
                    setName: cs.set_name,
                    setRarity: cs.set_rarity || null,
                    cardId: card.id,
                  },
                  create: {
                    setCode: cs.set_code,
                    setName: cs.set_name,
                    setRarity: cs.set_rarity || null,
                    cardId: card.id,
                  },
                })
              )
            )
            setsDone += card.card_sets.length
          }
        } catch (e) {
          errors++
          console.error(`Erro em "${card.name}" (${card.id}):`, (e as Error).message)
        }
      })
    )

    const pct = Math.round(((i + batch.length) / cards.length) * 100)
    process.stdout.write(`\r  ${pct}% — ${cardsDone} cartas | ${setsDone} set codes`)
  }

  console.log("\n")
  console.log(`Concluído!`)
  console.log(`  GlobalCard: ${cardsDone} cartas`)
  console.log(`  CardSet:    ${setsDone} códigos de set`)
  if (errors > 0) console.log(`  Erros:      ${errors}`)

  await (prisma as any).$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
