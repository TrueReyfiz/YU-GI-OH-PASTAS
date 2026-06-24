import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!(session?.user as any)?.id) {
    return NextResponse.json([], { status: 401 })
  }

  const cardId = req.nextUrl.searchParams.get("cardId")
  if (!cardId || isNaN(parseInt(cardId))) {
    return NextResponse.json({ error: "cardId obrigatório" }, { status: 400 })
  }

  const editions = await (prisma as any).cardSet.findMany({
    where: { cardId: parseInt(cardId) },
    select: { setCode: true, setName: true, setRarity: true },
    orderBy: { setCode: "asc" },
  })

  return NextResponse.json(editions)
}
