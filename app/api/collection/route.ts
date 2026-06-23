import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!(session?.user as any)?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }
  const userId = (session!.user as any).id as string

  const cards = await (prisma as any).userCard.findMany({
    where: { userId },
    include: { cardSet: { include: { card: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(cards)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!(session?.user as any)?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }
  const userId = (session!.user as any).id as string

  const { setCode, idioma, condicao, quantidade, preco } = await req.json()

  if (!setCode) {
    return NextResponse.json({ error: "setCode é obrigatório." }, { status: 400 })
  }

  const cardSet = await (prisma as any).cardSet.findUnique({ where: { setCode } })
  if (!cardSet) {
    return NextResponse.json(
      { error: `Código "${setCode}" não encontrado na base de dados.` },
      { status: 422 },
    )
  }

  const userCard = await (prisma as any).userCard.create({
    data: {
      userId,
      setCode,
      idioma: idioma ?? "Português",
      condicao: condicao ?? "NM",
      quantidade: quantidade ?? 1,
      preco: preco ?? 0,
    },
  })

  return NextResponse.json(userCard, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!(session?.user as any)?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }
  const userId = (session!.user as any).id as string

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: "id obrigatório." }, { status: 400 })

  const card = await (prisma as any).userCard.findUnique({ where: { id } })
  if (!card || card.userId !== userId) {
    return NextResponse.json({ error: "Não encontrado." }, { status: 404 })
  }

  await (prisma as any).userCard.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
