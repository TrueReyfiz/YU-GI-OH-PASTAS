import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import CollectionView from "@/components/CollectionView"
import { EnrichedCard } from "@/types/card"

export default async function Page() {
  const session = await auth()
  if (!(session?.user as any)?.id) redirect("/login")
  const userId = (session!.user as any).id as string

  const userCards: any[] = await (prisma as any).userCard.findMany({
    where: { userId },
    include: { cardSet: { include: { card: true } } },
    orderBy: { createdAt: "desc" },
  })

  const enriched: EnrichedCard[] = userCards.map((uc) => ({
    nome: uc.cardSet.card.namePt ?? uc.cardSet.card.name,
    apiId: uc.cardSet.card.id,
    desc: uc.cardSet.card.desc,
    descEn: uc.cardSet.card.desc,
    descPt: uc.cardSet.card.descPt ?? undefined,
    atk: uc.cardSet.card.atk ?? undefined,
    def: uc.cardSet.card.def ?? undefined,
    level: uc.cardSet.card.level ?? undefined,
    race: uc.cardSet.card.race ?? undefined,
    attribute: uc.cardSet.card.attribute ?? undefined,
    imageUrl: uc.cardSet.card.imageUrl,
    idioma: uc.idioma,
    tipo: uc.cardSet.card.type,
    raridade: uc.cardSet.setRarity ?? "",
    colecao: uc.setCode,
    quantidade: uc.quantidade,
    condicao: uc.condicao,
    preco: uc.preco,
  }))

  const totalCards = enriched.reduce((sum, c) => sum + c.quantidade, 0)
  const totalValue = enriched.reduce((sum, c) => sum + c.preco * c.quantidade, 0)

  return (
    <CollectionView
      cards={enriched}
      totalCards={totalCards}
      totalValue={totalValue}
      userName={session!.user?.name ?? session!.user?.email ?? ""}
    />
  )
}
