import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth()
  if (!(session?.user as any)?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }
  const userId = (session!.user as any).id as string
  const { id } = params

  const card = await (prisma as any).userCard.findUnique({ where: { id } })
  if (!card || card.userId !== userId) {
    return NextResponse.json({ error: "Não encontrado." }, { status: 404 })
  }

  const body = await req.json()
  const { preco, condicao, idioma, quantidade } = body

  const updated = await (prisma as any).userCard.update({
    where: { id },
    data: {
      ...(preco !== undefined && { preco: parseFloat(preco) || 0 }),
      ...(condicao !== undefined && { condicao }),
      ...(idioma !== undefined && { idioma }),
      ...(quantidade !== undefined && { quantidade: Math.max(1, parseInt(quantidade) || 1) }),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth()
  if (!(session?.user as any)?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }
  const userId = (session!.user as any).id as string
  const { id } = params

  const card = await (prisma as any).userCard.findUnique({ where: { id } })
  if (!card || card.userId !== userId) {
    return NextResponse.json({ error: "Não encontrado." }, { status: 404 })
  }

  await (prisma as any).userCard.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
