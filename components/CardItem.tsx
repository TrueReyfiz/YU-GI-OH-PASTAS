import { EnrichedCard } from "@/types/card"
import Image from "next/image"

interface CardItemProps {
  card: EnrichedCard
  onClick: () => void
}

const RARITY_COLORS: Record<string, string> = {
  common: "text-gray-400",
  rare: "text-blue-400",
  "super rare": "text-purple-400",
  "ultra rare": "text-gold",
  "secret rare": "text-gold-light",
  "ultimate rare": "text-amber-300",
}

function rarityColor(raridade: string): string {
  return RARITY_COLORS[raridade.toLowerCase()] ?? "text-gray-400"
}

export default function CardItem({ card, onClick }: CardItemProps) {
  return (
    <button
      onClick={onClick}
      className="group relative bg-dark-card border border-dark-border rounded-lg overflow-hidden
                 hover:border-gold hover:shadow-gold-glow transition-all duration-200 text-left w-full"
    >
      <div className="aspect-[421/614] relative bg-dark-surface">
        {card.imageUrl ? (
          <Image
            src={card.imageUrl}
            alt={card.nome}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-dark-border">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-12 h-12 opacity-30"
            >
              <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
            </svg>
          </div>
        )}

        {card.quantidade > 1 && (
          <span className="absolute top-1.5 right-1.5 bg-dark/80 border border-gold text-gold text-xs font-bold px-1.5 py-0.5 rounded">
            x{card.quantidade}
          </span>
        )}

        <span className="absolute top-1.5 left-1.5 bg-dark/80 border border-dark-border text-gray-300 text-xs px-1.5 py-0.5 rounded uppercase tracking-wide">
          {card.idioma}
        </span>
      </div>

      <div className="p-2.5">
        <p className="text-sm font-semibold text-gray-100 truncate leading-tight">{card.nome}</p>
        <p className={`text-xs mt-0.5 truncate ${rarityColor(card.raridade)}`}>{card.raridade}</p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs text-gray-500">{card.colecao}</span>
          <span className="text-xs font-bold text-gold">
            {card.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>
      </div>
    </button>
  )
}
