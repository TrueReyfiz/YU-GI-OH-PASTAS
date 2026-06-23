"use client"

import { useState } from "react"
import { EnrichedCard } from "@/types/card"
import Header from "./Header"
import CardGrid from "./CardGrid"
import AddCardModal from "./AddCardModal"

interface CollectionViewProps {
  cards: EnrichedCard[]
  totalCards: number
  totalValue: number
  userName: string
}

export default function CollectionView({
  cards,
  totalCards,
  totalValue,
  userName,
}: CollectionViewProps) {
  const [addOpen, setAddOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header
        totalCards={totalCards}
        totalValue={totalValue}
        userName={userName}
        onAddCard={() => setAddOpen(true)}
      />
      <CardGrid cards={cards} />
      <AddCardModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
