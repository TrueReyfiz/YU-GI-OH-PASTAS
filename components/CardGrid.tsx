"use client"

import { EnrichedCard } from "@/types/card"
import { useMemo, useState } from "react"
import CardItem from "./CardItem"
import CardModal from "./CardModal"

interface CardGridProps {
  cards: EnrichedCard[]
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values)).sort()
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-[7px] min-w-[148px]">
      <label className="font-condensed font-semibold text-[10px] tracking-[.18em] text-dim uppercase">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-surface border border-white/[0.09] rounded-[6px] pl-[13px] pr-8 py-[11px] text-[13px] font-sans outline-none cursor-pointer"
          style={{ color: value ? "#22d3ee" : "#aeb8c6" }}
        >
          <option value="" style={{ background: "#0a0e14", color: "#dfe6ef" }}>
            Todos
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt} style={{ background: "#0a0e14", color: "#dfe6ef" }}>
              {opt}
            </option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dim text-[9px] pointer-events-none select-none">
          ▼
        </span>
      </div>
    </div>
  )
}

export default function CardGrid({ cards }: CardGridProps) {
  const [search, setSearch] = useState("")
  const [searchFocus, setSearchFocus] = useState(false)
  const [filterTipo, setFilterTipo] = useState("")
  const [filterRaridade, setFilterRaridade] = useState("")
  const [filterCondicao, setFilterCondicao] = useState("")
  const [filterIdioma, setFilterIdioma] = useState("")
  const [selected, setSelected] = useState<EnrichedCard | null>(null)

  const tipos = useMemo(() => unique(cards.map((c) => c.tipo)), [cards])
  const raridades = useMemo(() => unique(cards.map((c) => c.raridade)), [cards])
  const condicoes = useMemo(() => unique(cards.map((c) => c.condicao)), [cards])
  const idiomas = useMemo(() => unique(cards.map((c) => c.idioma)), [cards])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return cards.filter((c) => {
      if (q && !c.nome.toLowerCase().includes(q)) return false
      if (filterTipo && c.tipo !== filterTipo) return false
      if (filterRaridade && c.raridade !== filterRaridade) return false
      if (filterCondicao && c.condicao !== filterCondicao) return false
      if (filterIdioma && c.idioma !== filterIdioma) return false
      return true
    })
  }, [cards, search, filterTipo, filterRaridade, filterCondicao, filterIdioma])

  const hasFilters = !!(search || filterTipo || filterRaridade || filterCondicao || filterIdioma)

  function clearFilters() {
    setSearch("")
    setFilterTipo("")
    setFilterRaridade("")
    setFilterCondicao("")
    setFilterIdioma("")
  }

  return (
    <>
      {/* Filter bar */}
      <div className="w-full max-w-[1240px] mx-auto px-6 pt-6 pb-1.5">
        <div className="flex items-end gap-[14px] flex-wrap">
          {/* Search */}
          <div className="flex flex-col gap-[7px] flex-1 min-w-[240px]">
            <label className="font-condensed font-semibold text-[10px] tracking-[.18em] text-dim uppercase">
              BUSCAR
            </label>
            <div
              className="flex items-center gap-[10px] bg-surface rounded-[6px] px-[14px] py-[11px] transition-colors"
              style={{
                border: `1px solid ${searchFocus ? "rgba(34,211,238,.5)" : "rgba(255,255,255,0.09)"}`,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#566273"
                className="w-4 h-4 shrink-0"
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setSearchFocus(false)}
                placeholder="Nome da carta…"
                className="flex-1 bg-transparent border-none outline-none text-[14px] font-sans text-secondary placeholder:text-[#4d5969]"
              />
            </div>
          </div>

          <FilterSelect label="TIPO" value={filterTipo} options={tipos} onChange={setFilterTipo} />
          <FilterSelect label="RARIDADE" value={filterRaridade} options={raridades} onChange={setFilterRaridade} />
          <FilterSelect label="CONDIÇÃO" value={filterCondicao} options={condicoes} onChange={setFilterCondicao} />
          <FilterSelect label="IDIOMA" value={filterIdioma} options={idiomas} onChange={setFilterIdioma} />

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="font-condensed font-semibold text-[12px] tracking-[.06em] text-gold hover:opacity-70 transition-opacity pb-[11px] bg-transparent border-none cursor-pointer"
            >
              LIMPAR ×
            </button>
          )}
        </div>

        <div className="font-mono text-[11px] text-[#566273] mt-[18px] tracking-[.02em]">
          {filtered.length === cards.length
            ? `${cards.length} ENTRADAS NA VITRINE`
            : `${filtered.length} DE ${cards.length} ENTRADAS`}
        </div>
      </div>

      {/* Grid */}
      <main className="w-full max-w-[1240px] mx-auto px-6 pt-3.5 pb-[60px]">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-[14px] text-center">
            <p className="font-condensed font-semibold text-[18px] text-dim">
              Nenhuma carta encontrada com esses filtros
            </p>
            <button
              onClick={clearFilters}
              className="font-condensed font-semibold text-[13px] tracking-[.06em] text-gold border border-gold/40 rounded-[6px] py-[10px] px-[18px] hover:bg-gold/5 transition-colors"
            >
              LIMPAR FILTROS
            </button>
          </div>
        ) : (
          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(186px, 1fr))",
              gap: "22px 18px",
            }}
          >
            {filtered.map((card, i) => (
              <CardItem key={`${card.colecao}-${i}`} card={card} onClick={() => setSelected(card)} />
            ))}
          </div>
        )}
      </main>

      <CardModal card={selected} onClose={() => setSelected(null)} />
    </>
  )
}
