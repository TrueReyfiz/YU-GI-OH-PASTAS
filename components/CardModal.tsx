"use client"

import { EnrichedCard } from "@/types/card"
import Image from "next/image"
import { useEffect, useRef } from "react"

interface CardModalProps {
  card: EnrichedCard | null
  onClose: () => void
}

function Row({ label, value }: { label: string; value: string | number | undefined }) {
  if (value === undefined || value === null || value === "") return null
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-dark-border last:border-0">
      <span className="text-xs text-gray-500 uppercase tracking-wider shrink-0">{label}</span>
      <span className="text-sm text-gray-200 text-right">{value}</span>
    </div>
  )
}

export default function CardModal({ card, onClose }: CardModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!card) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = ""
    }
  }, [card, onClose])

  if (!card) return null

  const formattedPrice = card.preco.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label={card.nome}
    >
      <div
        ref={dialogRef}
        className="relative bg-dark-card border border-dark-border rounded-xl shadow-gold-glow
                   w-full max-w-2xl max-h-[90vh] flex flex-col sm:flex-row overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 text-gray-500 hover:text-gold transition-colors"
          aria-label="Fechar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>

        {/* Image panel */}
        <div className="sm:w-48 shrink-0 bg-dark-surface">
          <div className="aspect-[421/614] sm:aspect-auto sm:h-full relative">
            {card.imageUrl ? (
              <Image
                src={card.imageUrl}
                alt={card.nome}
                fill
                sizes="192px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-dark-border">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-16 h-16 opacity-20"
                >
                  <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Details panel */}
        <div className="flex-1 overflow-y-auto scrollbar-gold p-5">
          <h2 className="text-xl font-bold text-gold leading-tight mb-1">{card.nome}</h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">{card.tipo}</p>

          {card.desc && (
            <p className="text-sm text-gray-400 leading-relaxed mb-4 italic border-l-2 border-gold/40 pl-3">
              {card.desc}
            </p>
          )}

          <div className="space-y-0">
            <Row label="Raridade" value={card.raridade} />
            <Row label="Coleção" value={card.colecao} />
            <Row label="Idioma" value={card.idioma} />
            <Row label="Condição" value={card.condicao} />
            <Row label="Quantidade" value={card.quantidade} />
            {card.level !== undefined && <Row label="Nível" value={card.level} />}
            {card.atk !== undefined && <Row label="ATK" value={card.atk} />}
            {card.def !== undefined && <Row label="DEF" value={card.def} />}
            {card.race && <Row label="Tipo/Raça" value={card.race} />}
            {card.attribute && <Row label="Atributo" value={card.attribute} />}
          </div>

          <div className="mt-4 pt-4 border-t border-dark-border flex items-center justify-between">
            <span className="text-xs text-gray-500 uppercase tracking-widest">Valor estimado</span>
            <span className="text-2xl font-bold text-gold">{formattedPrice}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
