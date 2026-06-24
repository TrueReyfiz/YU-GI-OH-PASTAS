import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Normalize a string: remove diacritics, lowercase
function normalizeStr(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
}

// Generate a SQLite REPLACE chain that strips common Portuguese diacritics
function normSqlExpr(col: string): string {
  const subs: [string, string][] = [
    ["á","a"],["à","a"],["ã","a"],["â","a"],["ä","a"],
    ["é","e"],["ê","e"],["è","e"],
    ["í","i"],["ï","i"],
    ["ó","o"],["ô","o"],["õ","o"],["ö","o"],
    ["ú","u"],["ü","u"],
    ["ç","c"],["ñ","n"],
  ]
  let expr = `LOWER(${col})`
  for (const [from, to] of subs) {
    expr = `REPLACE(${expr},'${from}','${to}')`
  }
  return expr
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!(session?.user as any)?.id) {
    return NextResponse.json([], { status: 401 })
  }

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? ""
  if (q.length < 2) return NextResponse.json([])

  const pattern = `%${normalizeStr(q)}%`
  const codePattern = `%${q.toUpperCase()}%`

  const sql = `
    SELECT DISTINCT
      gc.id,
      gc.name,
      gc.namePt,
      gc.type,
      gc.imageUrl,
      gc.atk,
      gc.def,
      gc.level,
      gc.attribute
    FROM GlobalCard gc
    LEFT JOIN CardSet cs ON cs.cardId = gc.id
    WHERE
      ${normSqlExpr("gc.name")} LIKE ?
      OR ${normSqlExpr("gc.namePt")} LIKE ?
      OR UPPER(cs.setCode) LIKE ?
    ORDER BY gc.name ASC
    LIMIT 15
  `

  const cards = await (prisma as any).$queryRawUnsafe(sql, pattern, pattern, codePattern)

  return NextResponse.json(Array.isArray(cards) ? cards : [])
}
