"use client"

import { EnrichedCard } from "@/types/card"
import { useMemo, useState } from "react"
import CardItem from "./CardItem"
import CardModal from "./CardModal"

interface CardGridProps {
  cards: EnrichedCard[]
}

function uniqueSorted(values: string[]): string[] {
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
    <div className="flex flex-col gap-1 min-w-[130px]">
      <label className="text-xs text-gray-500 uppercase tracking-wider">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-dark-surface border border-dark-border text-gray-200 text-sm rounded-md px-3 py-2
                   focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50 transition-colors"
      >
        <option value="">Todos</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function CardGrid({ cards }: CardGridProps) {
  const [search, setSearch] = useState("")
  const [filterTipo, setFilterTipo] = useState("")
  const [filterRaridade, setFilterRaridade] = useState("")
  const [filterCondicao, setFilterCondicao] = useState("")
  const [filterIdioma, setFilterIdioma] = useState("")
  const [selected, setSelected] = useState<EnrichedCard | null>(null)

  const tipos = useMemo(() => uniqueSorted(cards.map((c) => c.tipo)), [cards])
  const raridades = useMemo(() => uniqueSorted(cards.map((c) => c.raridade)), [cards])
  const condicoes = useMemo(() => uniqueSorted(cards.map((c) => c.condicao)), [cards])
  const idiomas = useMemo(() => uniqueSorted(cards.map((c) => c.idioma)), [cards])

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

  const hasFilters = search || filterTipo || filterRaridade || filterCondicao || filterIdioma

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
      <div className="bg-dark-card border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4">
          {/* Search */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 uppercase tracking-wider">Buscar por nome</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ex: Blue-Eyes White Dragon..."
              className="bg-dark-surface border border-dark-border text-gray-200 text-sm rounded-md px-3 py-2
                         focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50 transition-colors
                         placeholder:text-gray-600 w-full max-w-md"
            />
          </div>

          {/* Dropdowns */}
          <div className="flex flex-wrap gap-3 items-end">
            <FilterSelect label="Tipo" value={filterTipo} options={tipos} onChange={setFilterTipo} />
            <FilterSelect label="Raridade" value={filterRaridade} options={raridades} onChange={setFilterRaridade} />
            <FilterSelect label="Condição" value={filterCondicao} options={condicoes} onChange={setFilterCondicao} />
            <FilterSelect label="Idioma" value={filterIdioma} options={idiomas} onChange={setFilterIdioma} />

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-gray-500 hover:text-gold underline underline-offset-2 transition-colors pb-2"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results summary */}
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-1 flex items-center justify-between">
        <p className="text-xs text-gray-600">
          {filtered.length === cards.length
            ? `${cards.length} cartas`
            : `${filtered.length} de ${cards.length} cartas`}
        </p>
      </div>

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-4 pb-10">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <p className="text-gray-600 text-lg">Nenhuma carta encontrada</p>
            <button onClick={clearFilters} className="text-sm text-gold hover:text-gold-light transition-colors">
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 pt-3">
            {filtered.map((card, i) => (
              <CardItem key={`${card.nome}-${i}`} card={card} onClick={() => setSelected(card)} />
            ))}
          </div>
        )}
      </main>

      <CardModal card={selected} onClose={() => setSelected(null)} />
    </>
  )
}
