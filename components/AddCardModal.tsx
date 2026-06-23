"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

interface SearchResult {
  setCode: string
  setName: string
  setRarity: string | null
  card: {
    id: number
    name: string
    namePt: string | null
    type: string
    imageUrl: string
    atk: number | null
    def: number | null
    level: number | null
    attribute: string | null
  }
}

const CONDICOES = ["NM", "LP", "MP", "HP", "DMG"]
const IDIOMAS = ["Português", "Inglês", "Japonês", "Coreano"]
const CARD_BACK = "https://images.ygoprodeck.com/images/cards/back.jpg"

interface AddCardModalProps {
  open: boolean
  onClose: () => void
}

export default function AddCardModal({ open, onClose }: AddCardModalProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<SearchResult | null>(null)
  const [idioma, setIdioma] = useState("Português")
  const [condicao, setCondicao] = useState("NM")
  const [quantidade, setQuantidade] = useState(1)
  const [preco, setPreco] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80)
    } else {
      reset()
    }
  }, [open])

  useEffect(() => {
    if (selected) return
    const timer = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([])
        return
      }
      setSearching(true)
      try {
        const res = await fetch(`/api/cards/search?q=${encodeURIComponent(query.trim())}`)
        const data = await res.json()
        setResults(data)
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [query, selected])

  function reset() {
    setQuery("")
    setResults([])
    setSearching(false)
    setSelected(null)
    setIdioma("Português")
    setCondicao("NM")
    setQuantidade(1)
    setPreco("")
    setSubmitError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    setSubmitting(true)
    setSubmitError("")

    const res = await fetch("/api/collection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setCode: selected.setCode,
        idioma,
        condicao,
        quantidade,
        preco: parseFloat(preco) || 0,
      }),
    })

    setSubmitting(false)

    if (!res.ok) {
      const data = await res.json()
      setSubmitError(data.error ?? "Erro ao adicionar carta.")
      return
    }

    router.refresh()
    onClose()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,.75)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-[520px] bg-surface border border-white/[.08] rounded-[10px] overflow-hidden"
        style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[.07]">
          <h2 className="font-condensed font-bold text-[16px] tracking-[.1em] text-secondary uppercase">
            Adicionar Carta
          </h2>
          <button
            onClick={onClose}
            className="text-dim hover:text-secondary text-[20px] leading-none transition-colors"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 flex flex-col gap-5">
          {/* Search */}
          {!selected && (
            <>
              <div className="flex flex-col gap-[7px]">
                <label className="font-condensed font-semibold text-[10px] tracking-[.18em] text-dim uppercase">
                  Buscar por nome ou código (ex: SR13-PT001)
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Dark Magician, SR13, Dragão Branco…"
                  className="bg-bg border border-white/[.09] focus:border-gold/40 rounded-[6px] px-[14px] py-[11px] text-[14px] outline-none transition-colors"
                />
              </div>

              {searching && (
                <p className="text-[12px] text-dim text-center">Buscando…</p>
              )}

              {!searching && results.length > 0 && (
                <ul className="flex flex-col gap-2">
                  {results.map((r) => (
                    <li key={r.setCode}>
                      <button
                        type="button"
                        onClick={() => setSelected(r)}
                        className="w-full flex items-center gap-3 bg-card border border-white/[.06] hover:border-gold/30 rounded-[6px] p-3 text-left transition-colors cursor-pointer"
                      >
                        <div
                          className="shrink-0 relative rounded overflow-hidden bg-black/20"
                          style={{ width: 34, height: 50 }}
                        >
                          <Image
                            src={r.card.imageUrl ?? CARD_BACK}
                            alt={r.card.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-condensed font-semibold text-[13px] text-secondary truncate">
                            {r.card.namePt ?? r.card.name}
                          </div>
                          <div className="font-mono text-[10px] text-dim mt-0.5">
                            {r.setCode}
                          </div>
                          <div className="text-[10px] text-dim/70 mt-0.5 truncate">
                            {r.setRarity} · {r.setName}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {!searching && query.trim().length >= 2 && results.length === 0 && (
                <p className="text-[12px] text-dim text-center">
                  Nenhum resultado para &ldquo;{query}&rdquo;
                </p>
              )}
            </>
          )}

          {/* Selected card + form */}
          {selected && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Selected card preview */}
              <div className="flex items-center gap-3 bg-card border border-gold/20 rounded-[6px] p-3">
                <div
                  className="shrink-0 relative rounded overflow-hidden"
                  style={{ width: 34, height: 50 }}
                >
                  <Image
                    src={selected.card.imageUrl ?? CARD_BACK}
                    alt={selected.card.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-condensed font-semibold text-[13px] text-gold truncate">
                    {selected.card.namePt ?? selected.card.name}
                  </div>
                  <div className="font-mono text-[10px] text-dim mt-0.5">
                    {selected.setCode}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="text-dim hover:text-secondary text-[18px] leading-none shrink-0 ml-1"
                  aria-label="Trocar carta"
                >
                  ✕
                </button>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="IDIOMA"
                  value={idioma}
                  options={IDIOMAS}
                  onChange={setIdioma}
                />
                <SelectField
                  label="CONDIÇÃO"
                  value={condicao}
                  options={CONDICOES}
                  onChange={setCondicao}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <NumberField
                  label="QUANTIDADE"
                  value={quantidade}
                  min={1}
                  max={99}
                  onChange={setQuantidade}
                />
                <div className="flex flex-col gap-[7px]">
                  <label className="font-condensed font-semibold text-[10px] tracking-[.18em] text-dim uppercase">
                    PREÇO (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={preco}
                    onChange={(e) => setPreco(e.target.value)}
                    placeholder="0,00"
                    className="bg-bg border border-white/[.09] focus:border-gold/40 rounded-[6px] px-[14px] py-[11px] text-[14px] outline-none transition-colors"
                  />
                </div>
              </div>

              {submitError && (
                <p className="text-[13px] text-red-400 text-center">{submitError}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="bg-gold/10 border border-gold/40 text-gold font-condensed font-semibold text-[14px] tracking-[.08em] py-[13px] rounded-[6px] hover:bg-gold/15 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "ADICIONANDO…" : "ADICIONAR À COLEÇÃO"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function SelectField({
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
    <div className="flex flex-col gap-[7px]">
      <label className="font-condensed font-semibold text-[10px] tracking-[.18em] text-dim uppercase">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-bg border border-white/[.09] rounded-[6px] pl-[13px] pr-8 py-[11px] text-[13px] outline-none cursor-pointer"
          style={{ color: "#dfe6ef" }}
        >
          {options.map((opt) => (
            <option key={opt} value={opt} style={{ background: "#0a0e14" }}>
              {opt}
            </option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dim text-[9px] pointer-events-none">
          ▼
        </span>
      </div>
    </div>
  )
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-col gap-[7px]">
      <label className="font-condensed font-semibold text-[10px] tracking-[.18em] text-dim uppercase">
        {label}
      </label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || min)))}
        className="bg-bg border border-white/[.09] focus:border-gold/40 rounded-[6px] px-[14px] py-[11px] text-[14px] outline-none transition-colors"
      />
    </div>
  )
}
