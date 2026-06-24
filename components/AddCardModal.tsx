"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import type { PriceResult } from "@/types/card"

interface GlobalCardResult {
  id: number
  name: string
  namePt: string | null
  type: string
  imageUrl: string | null
  atk: number | null
  def: number | null
  level: number | null
  attribute: string | null
}

interface EditionResult {
  setCode: string
  setName: string | null
  setRarity: string | null
}

type Stage = "search" | "editions" | "form"

const CONDICOES = ["NM", "LP", "MP", "HP", "DMG"]
const IDIOMAS = ["Português", "Inglês", "Japonês", "Coreano"]
const CARD_BACK = "https://images.ygoprodeck.com/images/cards/back.jpg"

interface AddCardModalProps {
  open: boolean
  onClose: () => void
}

export default function AddCardModal({ open, onClose }: AddCardModalProps) {
  const [stage, setStage] = useState<Stage>("search")
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<GlobalCardResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedCard, setSelectedCard] = useState<GlobalCardResult | null>(null)
  const [editions, setEditions] = useState<EditionResult[]>([])
  const [loadingEditions, setLoadingEditions] = useState(false)
  const [selectedEdition, setSelectedEdition] = useState<EditionResult | null>(null)
  const [idioma, setIdioma] = useState("Português")
  const [condicao, setCondicao] = useState("NM")
  const [quantidade, setQuantidade] = useState(1)
  const [preco, setPreco] = useState("")
  const [fetchingPrice, setFetchingPrice] = useState(false)
  const [priceResult, setPriceResult] = useState<PriceResult | null>(null)
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

  // Clear price when edition changes
  useEffect(() => {
    setPriceResult(null)
    setPreco("")
  }, [selectedEdition])

  // Debounced search — only active in "search" stage
  useEffect(() => {
    if (stage !== "search") return
    const timer = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([])
        return
      }
      setSearching(true)
      try {
        const res = await fetch(
          `/api/cards/search?q=${encodeURIComponent(query.trim())}`,
        )
        const data = await res.json()
        setResults(Array.isArray(data) ? data : [])
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [query, stage])

  function reset() {
    setStage("search")
    setQuery("")
    setResults([])
    setSearching(false)
    setSelectedCard(null)
    setEditions([])
    setLoadingEditions(false)
    setSelectedEdition(null)
    setIdioma("Português")
    setCondicao("NM")
    setQuantidade(1)
    setPreco("")
    setFetchingPrice(false)
    setPriceResult(null)
    setSubmitError("")
  }

  function goBack() {
    if (stage === "editions") {
      setSelectedCard(null)
      setEditions([])
      setStage("search")
    } else if (stage === "form") {
      setSelectedEdition(null)
      setStage("editions")
    }
  }

  async function handleSelectCard(card: GlobalCardResult) {
    setSelectedCard(card)
    setStage("editions")
    setLoadingEditions(true)
    try {
      const res = await fetch(`/api/cards/editions?cardId=${card.id}`)
      const data = await res.json()
      setEditions(Array.isArray(data) ? data : [])
    } catch {
      setEditions([])
    } finally {
      setLoadingEditions(false)
    }
  }

  async function handleFetchPrice() {
    if (!selectedEdition || fetchingPrice) return
    setFetchingPrice(true)
    setPriceResult(null)
    try {
      const res = await fetch(
        `/api/price-scraper?codigo=${encodeURIComponent(selectedEdition.setCode)}`,
      )
      if (!res.ok) throw new Error()
      const data: PriceResult = await res.json()
      setPreco(String(data.preco))
      setPriceResult(data)
    } catch {
      // falha silenciosa — usuário digita manualmente
    } finally {
      setFetchingPrice(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedEdition) return
    setSubmitting(true)
    setSubmitError("")

    const res = await fetch("/api/collection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setCode: selectedEdition.setCode,
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

  const stageTitle = {
    search: "Adicionar Carta",
    editions: "Escolher Edição",
    form: "Detalhes da Carta",
  }[stage]

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
          <div className="flex items-center gap-3">
            {stage !== "search" && (
              <button
                type="button"
                onClick={goBack}
                className="text-dim hover:text-secondary text-[18px] leading-none transition-colors"
                aria-label="Voltar"
              >
                ←
              </button>
            )}
            <h2 className="font-condensed font-bold text-[16px] tracking-[.1em] text-secondary uppercase">
              {stageTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-dim hover:text-secondary text-[20px] leading-none transition-colors"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 flex flex-col gap-5">
          {/* STAGE 1 — Busca de cartas */}
          {stage === "search" && (
            <>
              <div className="flex flex-col gap-[7px]">
                <label className="font-condensed font-semibold text-[10px] tracking-[.18em] text-dim uppercase">
                  Nome (PT ou EN) ou Código (ex: LOB-PT001)
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Dragão Branco, Blue-Eyes, SR13-PT001…"
                  className="bg-bg border border-white/[.09] focus:border-gold/40 rounded-[6px] px-[14px] py-[11px] text-[14px] outline-none transition-colors"
                />
              </div>

              {searching && (
                <p className="text-[12px] text-dim text-center">Buscando…</p>
              )}

              {!searching && results.length > 0 && (
                <ul className="flex flex-col gap-2">
                  {results.map((r) => (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectCard(r)}
                        className="w-full flex items-center gap-3 bg-card border border-white/[.06] hover:border-gold/30 rounded-[6px] p-3 text-left transition-colors cursor-pointer"
                      >
                        <div
                          className="shrink-0 relative rounded overflow-hidden bg-black/20"
                          style={{ width: 34, height: 50 }}
                        >
                          <Image
                            src={r.imageUrl ?? CARD_BACK}
                            alt={r.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-condensed font-semibold text-[13px] text-secondary truncate">
                            {r.namePt ?? r.name}
                          </div>
                          {r.namePt && (
                            <div className="text-[10px] text-dim/60 truncate">
                              {r.name}
                            </div>
                          )}
                          <div className="text-[10px] text-dim/70 mt-0.5">
                            {r.type}
                          </div>
                        </div>
                        <span className="text-dim text-[16px] shrink-0">›</span>
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

          {/* STAGE 2 — Seleção de edição */}
          {stage === "editions" && selectedCard && (
            <>
              {/* Card preview */}
              <div className="flex items-center gap-3 bg-card border border-white/[.06] rounded-[6px] p-3">
                <div
                  className="shrink-0 relative rounded overflow-hidden bg-black/20"
                  style={{ width: 34, height: 50 }}
                >
                  <Image
                    src={selectedCard.imageUrl ?? CARD_BACK}
                    alt={selectedCard.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-condensed font-semibold text-[13px] text-secondary truncate">
                    {selectedCard.namePt ?? selectedCard.name}
                  </div>
                  <div className="text-[10px] text-dim/70">
                    {selectedCard.type}
                  </div>
                </div>
              </div>

              <p className="font-condensed font-semibold text-[10px] tracking-[.18em] text-dim uppercase -mb-2">
                Selecionar Edição
              </p>

              {loadingEditions && (
                <p className="text-[12px] text-dim text-center">
                  Carregando edições…
                </p>
              )}

              {!loadingEditions && editions.length > 0 && (
                <ul className="flex flex-col gap-2">
                  {editions.map((ed) => (
                    <li key={ed.setCode}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEdition(ed)
                          setStage("form")
                        }}
                        className="w-full flex items-center justify-between gap-3 bg-card border border-white/[.06] hover:border-gold/30 rounded-[6px] px-4 py-3 text-left transition-colors cursor-pointer"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-[12px] text-gold/80">
                            {ed.setCode}
                          </div>
                          {ed.setName && (
                            <div className="text-[10px] text-dim/60 truncate mt-0.5">
                              {ed.setName}
                            </div>
                          )}
                        </div>
                        {ed.setRarity && (
                          <span className="text-[9px] text-dim bg-white/[.05] px-2 py-0.5 rounded shrink-0">
                            {ed.setRarity}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {!loadingEditions && editions.length === 0 && (
                <p className="text-[12px] text-dim text-center">
                  Nenhuma edição encontrada.
                </p>
              )}
            </>
          )}

          {/* STAGE 3 — Formulário de atributos */}
          {stage === "form" && selectedCard && selectedEdition && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Preview carta + edição selecionada */}
              <div className="flex items-center gap-3 bg-card border border-gold/20 rounded-[6px] p-3">
                <div
                  className="shrink-0 relative rounded overflow-hidden"
                  style={{ width: 34, height: 50 }}
                >
                  <Image
                    src={selectedCard.imageUrl ?? CARD_BACK}
                    alt={selectedCard.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-condensed font-semibold text-[13px] text-gold truncate">
                    {selectedCard.namePt ?? selectedCard.name}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-[11px] text-gold/70 bg-gold/10 px-2 py-0.5 rounded">
                      {selectedEdition.setCode}
                    </span>
                    {selectedEdition.setRarity && (
                      <span className="text-[10px] text-dim bg-white/[.05] px-2 py-0.5 rounded">
                        {selectedEdition.setRarity}
                      </span>
                    )}
                  </div>
                  {selectedEdition.setName && (
                    <div className="text-[10px] text-dim/60 mt-0.5 truncate">
                      {selectedEdition.setName}
                    </div>
                  )}
                </div>
              </div>

              {/* Idioma / Condição */}
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

              {/* Quantidade */}
              <NumberField
                label="QUANTIDADE"
                value={quantidade}
                min={1}
                max={99}
                onChange={setQuantidade}
              />

              {/* Preço com busca automática */}
              <div className="flex flex-col gap-[7px]">
                <label className="font-condensed font-semibold text-[10px] tracking-[.18em] text-dim uppercase">
                  PREÇO (R$)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={preco}
                    onChange={(e) => {
                      setPreco(e.target.value)
                      setPriceResult(null)
                    }}
                    placeholder="0,00"
                    className="flex-1 bg-bg border border-white/[.09] focus:border-gold/40 rounded-[6px] px-[14px] py-[11px] text-[14px] outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleFetchPrice}
                    disabled={fetchingPrice}
                    className="shrink-0 bg-bg border border-white/[.09] hover:border-gold/30 hover:text-secondary rounded-[6px] px-4 text-[11px] font-condensed font-semibold tracking-[.05em] text-dim transition-colors disabled:opacity-40 cursor-pointer whitespace-nowrap"
                  >
                    {fetchingPrice ? "Buscando…" : "Buscar Preço BR"}
                  </button>
                </div>
                {priceResult && (
                  <p className="text-[10px] text-gold/60">
                    Fonte: {priceResult.fonte}
                    {priceResult.moeda === "BRL_estimado" && (
                      <span className="text-dim"> · estimativa convertida</span>
                    )}
                  </p>
                )}
              </div>

              {submitError && (
                <p className="text-[13px] text-red-400 text-center">
                  {submitError}
                </p>
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
        onChange={(e) =>
          onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || min)))
        }
        className="bg-bg border border-white/[.09] focus:border-gold/40 rounded-[6px] px-[14px] py-[11px] text-[14px] outline-none transition-colors"
      />
    </div>
  )
}
