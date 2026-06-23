"use client"

import { EnrichedCard } from "@/types/card"
import Image from "next/image"
import { useCallback, useRef, useState } from "react"

const CARD_BACK = "https://images.ygoprodeck.com/images/cards/back.jpg"

const RARITY_MAP: Record<string, { label: string; color: string }> = {
  "Comum": { label: "COMUM", color: "#8b98a8" },
  "Raro": { label: "RARO", color: "#5aa9ff" },
  "Super Raro": { label: "SUPER RARO", color: "#c3b6ff" },
  "Ultra Raro": { label: "ULTRA RARO", color: "#fbbf24" },
  "Secreto Raro": { label: "SECRETO RARO", color: "#22d3ee" },
  "Gold Raro": { label: "GOLD RARO", color: "#e3a83a" },
  "Quarter Century Secret Rare": { label: "QUARTER CENTURY", color: "#9fe7ff" },
  "Parallel Raro": { label: "PARALLEL RARO", color: "#7ee0c0" },
  "Ultimate Raro": { label: "ULTIMATE RARO", color: "#ff9d5a" },
  "common": { label: "COMUM", color: "#8b98a8" },
  "rare": { label: "RARO", color: "#5aa9ff" },
  "super rare": { label: "SUPER RARO", color: "#c3b6ff" },
  "ultra rare": { label: "ULTRA RARO", color: "#fbbf24" },
  "secret rare": { label: "SECRETO RARO", color: "#22d3ee" },
  "ultimate rare": { label: "ULTIMATE RARO", color: "#ff9d5a" },
}

function getRarity(raridade: string) {
  return (
    RARITY_MAP[raridade] ??
    RARITY_MAP[raridade.toLowerCase()] ?? { label: raridade.toUpperCase(), color: "#8b98a8" }
  )
}

interface CardItemProps {
  card: EnrichedCard
  onClick: () => void
}

export default function CardItem({ card, onClick }: CardItemProps) {
  const rootRef = useRef<HTMLButtonElement>(null)
  const sheenRef = useRef<HTMLDivElement>(null)
  const rar = getRarity(card.raridade)
  const [imgSrc, setImgSrc] = useState(card.imageUrl ?? CARD_BACK)
  const [imgFailed, setImgFailed] = useState(false)

  const onTilt = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const el = rootRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    const ry = (px - 0.5) * 14
    const rx = -(py - 0.5) * 14
    el.style.transform = `perspective(900px) rotateY(${ry}deg) rotateX(${rx}deg) translateY(-4px) scale(1.02)`
    el.style.zIndex = "5"
    const sheen = sheenRef.current
    if (sheen) {
      sheen.style.opacity = "1"
      sheen.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,.45), rgba(140,225,255,.15) 32%, transparent 62%)`
    }
  }, [])

  const onLeave = useCallback(() => {
    const el = rootRef.current
    if (!el) return
    el.style.transform = ""
    el.style.zIndex = ""
    const sheen = sheenRef.current
    if (sheen) sheen.style.opacity = "0"
  }, [])

  function handleImgError() {
    if (imgSrc !== CARD_BACK) {
      setImgSrc(CARD_BACK)
    } else {
      setImgFailed(true)
    }
  }

  return (
    <button
      ref={rootRef}
      onClick={onClick}
      onMouseMove={onTilt}
      onMouseLeave={onLeave}
      className="relative w-full text-left rounded-[6px] overflow-hidden bg-card border border-white/[0.06] cursor-pointer"
      style={{
        transformStyle: "preserve-3d",
        transition: "transform .28s cubic-bezier(0.22,1,0.36,1)",
        willChange: "transform",
      }}
    >
      {/* Image area */}
      <div className="relative bg-surface" style={{ aspectRatio: "421/614" }}>
        {/* Rarity top fillet */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px] z-10"
          style={{ background: rar.color, boxShadow: `0 0 12px ${rar.color}` }}
        />

        {!imgFailed ? (
          <Image
            src={imgSrc}
            alt={card.nome}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
            className="object-cover"
            onError={handleImgError}
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#5e6b7a" className="w-12 h-12">
              <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
            </svg>
          </div>
        )}

        {/* Sheen overlay (tilt highlight) */}
        <div
          ref={sheenRef}
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: 0, transition: "opacity .2s", mixBlendMode: "overlay" }}
        />

        {/* Quantity badge */}
        {card.quantidade > 1 && (
          <span
            className="absolute top-2 right-2 z-10 font-condensed font-bold text-[11px] tracking-[.05em] text-[#e9eef5] border border-white/[.14] rounded-[3px] px-1.5 py-0.5"
            style={{ background: "rgba(5,8,12,.78)" }}
          >
            ×{card.quantidade}
          </span>
        )}
      </div>

      {/* Info footer */}
      <div className="px-[13px] pt-3 pb-[14px]">
        <div
          className="font-condensed font-bold text-[9px] tracking-[.18em] uppercase mb-[5px]"
          style={{ color: rar.color }}
        >
          {rar.label}
        </div>
        <div
          className="font-condensed font-semibold text-[14px] leading-[1.12] min-h-[32px] text-secondary"
          style={{ textWrap: "pretty" } as React.CSSProperties}
        >
          {card.nome}
        </div>
        <div className="flex items-baseline justify-between mt-[10px] gap-2">
          <span className="font-mono text-[10px] tracking-[.02em] text-dim truncate">
            {card.colecao}
          </span>
          <span className="font-condensed font-bold text-[14px] text-primary shrink-0">
            {card.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>
      </div>
    </button>
  )
}
