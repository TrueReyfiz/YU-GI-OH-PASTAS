import { enrichCards } from "@/lib/enrichCards"
import { getCollection } from "@/lib/getCollection"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const collection = await getCollection()
  const enriched = await enrichCards(collection)

  const rows = enriched.map((c) => ({
    nome: c.nome,
    colecao: c.colecao,
    idioma: c.idioma,
    apiId: c.apiId ?? null,
    noImage: !c.imageUrl,
    noApiId: !c.apiId,
    noDescEn: !c.descEn,
    noDescPt: !c.descPt,
    descSame: !!(c.descPt && c.descEn && c.descPt.trim() === c.descEn.trim()),
    descEnSnippet: c.descEn ? c.descEn.slice(0, 80) : null,
  }))

  const problems = rows.filter(
    (r) => r.noImage || r.noApiId || r.noDescEn || r.noDescPt || r.descSame
  )

  return NextResponse.json(
    {
      total: enriched.length,
      withProblems: problems.length,
      ok: enriched.length - problems.length,
      cards: problems,
    },
    { status: 200 }
  )
}
