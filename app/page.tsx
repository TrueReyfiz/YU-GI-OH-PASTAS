import CardGrid from "@/components/CardGrid"
import Header from "@/components/Header"
import { enrichCards } from "@/lib/enrichCards"
import { getCollection } from "@/lib/getCollection"

export default async function Page() {
  const collection = await getCollection()
  const enriched = await enrichCards(collection)

  const totalCards = enriched.reduce((sum, c) => sum + c.quantidade, 0)
  const totalValue = enriched.reduce((sum, c) => sum + c.preco * c.quantidade, 0)

  return (
    <div className="flex flex-col min-h-screen">
      <Header totalCards={totalCards} totalValue={totalValue} />
      <CardGrid cards={enriched} />
    </div>
  )
}
