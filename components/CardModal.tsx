"use client"

import { EnrichedCard, PriceResult } from "@/types/card"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const CONDICOES = ["NM", "LP", "MP", "HP", "DMG"]
const IDIOMAS = ["Português", "Inglês", "Japonês", "Coreano"]

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
    RARITY_MAP[raridade.toLowerCase()] ?? {
      label: raridade.toUpperCase(),
      color: "#8b98a8",
    }
  )
}

interface CardModalProps {
  card: EnrichedCard | null
  onClose: () => void
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: string | number | undefined
}) {
  if (value === undefined || value === null || value === "") return null
  return (
    <div className="flex justify-between gap-4 py-[9px] border-b border-white/[0.06]">
      <span className="font-condensed font-semibold text-[10px] tracking-[.14em] text-dim uppercase shrink-0 pt-[2px]">
        {label}
      </span>
      <span className="font-sans text-[13px] text-body text-right">{value}</span>
    </div>
  )
}

function StatChip({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="flex-1 bg-surface border border-white/[0.07] rounded-[6px] py-[11px] px-3 text-center">
      <div className="font-condensed font-medium text-[9px] tracking-[.16em] text-dim uppercase">
        {label}
      </div>
      <div className="font-mono font-medium text-[17px] text-secondary mt-1">
        {value}
      </div>
    </div>
  )
}

function ModalSelect({
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
    <div className="flex flex-col gap-[6px]">
      <label className="font-condensed font-semibold text-[10px] tracking-[.14em] text-dim uppercase">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-bg border border-white/[.09] rounded-[6px] pl-[11px] pr-7 py-[9px] text-[13px] outline-none cursor-pointer"
          style={{ color: "#dfe6ef" }}
        >
          {options.map((opt) => (
            <option key={opt} value={opt} style={{ background: "#0a0e14" }}>
              {opt}
            </option>
          ))}
        </select>
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dim text-[9px] pointer-events-none">
          ▼
        </span>
      </div>
    </div>
  )
}

export default function CardModal({ card, onClose }: CardModalProps) {
  const router = useRouter()
  const [descLang, setDescLang] = useState<"pt" | "en">("pt")

  // Edit / delete state
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [fetchingPrice, setFetchingPrice] = useState(false)
  const [editPreco, setEditPreco] = useState("")
  const [editCondicao, setEditCondicao] = useState("NM")
  const [editIdioma, setEditIdioma] = useState("Português")
  const [editQuantidade, setEditQuantidade] = useState(1)
  const [editPriceResult, setEditPriceResult] = useState<PriceResult | null>(null)

  // Reset on card change
  useEffect(() => {
    setEditing(false)
    setConfirmDelete(false)
    setSaving(false)
    setDeleting(false)
    setFetchingPrice(false)
    setEditPriceResult(null)
  }, [card])

  // ESC + scroll lock
  useEffect(() => {
    if (!card) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editing) {
          setEditing(false)
        } else if (confirmDelete) {
          setConfirmDelete(false)
        } else {
          onClose()
        }
      }
    }
    document.addEventListener("keydown", handleKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = ""
    }
  }, [card, onClose, editing, confirmDelete])

  if (!card) return null

  const rar = getRarity(card.raridade)
  const formattedPrice = card.preco.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
  const hasBothLangs = !!(
    card.descPt &&
    card.descEn &&
    card.descPt.trim() !== card.descEn.trim()
  )
  const activeDesc =
    descLang === "pt"
      ? card.descPt ?? card.descEn
      : card.descEn ?? card.descPt

  const stats: { label: string; value: number }[] = []
  if (card.level != null) stats.push({ label: "NÍVEL", value: card.level })
  if (card.atk != null) stats.push({ label: "ATK", value: card.atk })
  if (card.def != null) stats.push({ label: "DEF", value: card.def })

  function startEdit() {
    setEditPreco(card!.preco > 0 ? String(card!.preco) : "")
    setEditCondicao(card!.condicao)
    setEditIdioma(card!.idioma)
    setEditQuantidade(card!.quantidade)
    setEditPriceResult(null)
    setEditing(true)
  }

  async function handleSave() {
    if (!card?.userCardId) return
    setSaving(true)
    try {
      const res = await fetch(`/api/collection/${card.userCardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preco: parseFloat(editPreco) || 0,
          condicao: editCondicao,
          idioma: editIdioma,
          quantidade: editQuantidade,
        }),
      })
      if (res.ok) {
        onClose()
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!card?.userCardId) return
    setDeleting(true)
    try {
      await fetch(`/api/collection/${card.userCardId}`, { method: "DELETE" })
      onClose()
      router.refresh()
    } finally {
      setDeleting(false)
    }
  }

  async function handleFetchPrice() {
    if (fetchingPrice) return
    setFetchingPrice(true)
    setEditPriceResult(null)
    try {
      const res = await fetch(
        `/api/price-scraper?codigo=${encodeURIComponent(card!.colecao)}`,
      )
      if (!res.ok) throw new Error()
      const data: PriceResult = await res.json()
      setEditPreco(String(data.preco))
      setEditPriceResult(data)
    } catch {
      // fail silently
    } finally {
      setFetchingPrice(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-7"
      style={{
        background: "rgba(3,5,8,.82)",
        backdropFilter: "blur(6px)",
        animation: "vtFade .18s ease",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label={card.nome}
    >
      <div
        className="relative flex w-full max-w-[860px] max-h-[88vh] bg-card border border-white/[0.09] rounded-[10px] overflow-hidden"
        style={{
          boxShadow: "0 30px 80px rgba(0,0,0,.6)",
          animation: "vtPop .26s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-[14px] right-[14px] z-10 w-8 h-8 rounded-[6px] flex items-center justify-center text-muted hover:text-gold transition-colors"
          style={{
            background: "rgba(5,8,12,.7)",
            border: "1px solid rgba(255,255,255,.1)",
          }}
          aria-label="Fechar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>

        {/* Left: image panel */}
        <div
          className="hidden sm:flex flex-none w-[300px] bg-surface items-center justify-center relative"
          style={{ padding: "28px 24px" }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{
              background: rar.color,
              boxShadow: `0 0 16px ${rar.color}`,
            }}
          />
          {card.imageUrl ? (
            <img
              src={card.imageUrl}
              alt={card.nome}
              className="w-full rounded-[6px]"
              style={{ boxShadow: "0 16px 40px rgba(0,0,0,.55)" }}
            />
          ) : (
            <div
              className="w-full flex items-center justify-center opacity-10"
              style={{ aspectRatio: "421/614" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="#5e6b7a"
                className="w-20 h-20"
              >
                <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
              </svg>
            </div>
          )}
        </div>

        {/* Right: details panel */}
        <div
          className="flex-1 overflow-y-auto scrollbar-design"
          style={{ padding: "30px 30px 28px" }}
        >
          <div
            className="font-condensed font-bold text-[10px] tracking-[.2em] uppercase mb-[9px]"
            style={{ color: rar.color }}
          >
            {rar.label}
          </div>
          <h2
            className="font-condensed font-bold text-[27px] leading-[1.05] text-primary mb-[6px]"
            style={{ textWrap: "pretty" } as React.CSSProperties}
          >
            {card.nome}
          </h2>
          <p className="font-condensed font-medium text-[11px] tracking-[.16em] text-dim uppercase mb-5">
            {card.tipo}
          </p>

          {activeDesc && (
            <div className="mb-[22px]">
              {hasBothLangs && (
                <div className="flex gap-[6px] mb-[10px]">
                  {(["pt", "en"] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setDescLang(lang)}
                      className="font-condensed font-bold text-[10px] tracking-[.16em] px-[10px] py-[4px] rounded-[4px] transition-colors"
                      style={{
                        background:
                          descLang === lang
                            ? `${rar.color}22`
                            : "transparent",
                        color:
                          descLang === lang ? rar.color : "#5e6b7a",
                        border: `1px solid ${descLang === lang ? rar.color + "55" : "rgba(255,255,255,0.08)"}`,
                      }}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
              <p
                className="font-sans text-[13px] leading-[1.6] text-muted italic pl-[14px]"
                style={{ borderLeft: `2px solid ${rar.color}` }}
              >
                {activeDesc}
              </p>
            </div>
          )}

          {stats.length > 0 && (
            <div className="flex gap-[10px] mb-[22px]">
              {stats.map((s) => (
                <StatChip key={s.label} label={s.label} value={s.value} />
              ))}
            </div>
          )}

          <div>
            <DetailRow label="COLEÇÃO" value={card.colecao} />
            <DetailRow label="IDIOMA" value={card.idioma} />
            <DetailRow label="CONDIÇÃO" value={card.condicao} />
            <DetailRow label="QUANTIDADE" value={`×${card.quantidade}`} />
            {card.race && <DetailRow label="TIPO/RAÇA" value={card.race} />}
            {card.attribute && (
              <DetailRow label="ATRIBUTO" value={card.attribute} />
            )}
          </div>

          {/* Price + action area */}
          {!editing ? (
            <>
              <div className="flex items-center justify-between mt-[22px] pt-[18px] border-t border-white/[0.1]">
                <span className="font-condensed font-semibold text-[10px] tracking-[.18em] text-dim uppercase">
                  VALOR ESTIMADO
                </span>
                <span className="font-condensed font-bold text-[30px] text-gold">
                  {formattedPrice}
                </span>
              </div>

              {card.userCardId && (
                !confirmDelete ? (
                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="font-condensed font-semibold text-[11px] tracking-[.05em] text-dim hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer"
                    >
                      Remover da Coleção
                    </button>
                    <button
                      onClick={startEdit}
                      className="font-condensed font-semibold text-[12px] tracking-[.08em] text-gold border border-gold/40 hover:bg-gold/10 rounded-[6px] px-4 py-[8px] transition-colors cursor-pointer"
                    >
                      EDITAR
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-col gap-3">
                    <p className="text-[12px] text-dim leading-relaxed">
                      Remover esta carta da coleção? Essa ação não pode ser
                      desfeita.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex-1 bg-red-500/10 border border-red-500/40 text-red-400 font-condensed font-semibold text-[12px] tracking-[.06em] py-[9px] rounded-[6px] hover:bg-red-500/20 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {deleting ? "Removendo…" : "Sim, Remover"}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="flex-1 bg-surface border border-white/[.09] text-dim font-condensed font-semibold text-[12px] tracking-[.06em] py-[9px] rounded-[6px] hover:text-secondary transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )
              )}
            </>
          ) : (
            /* Edit mode */
            <div className="mt-[22px] pt-[18px] border-t border-white/[0.1] flex flex-col gap-4">
              {/* Preço */}
              <div className="flex flex-col gap-[6px]">
                <label className="font-condensed font-semibold text-[10px] tracking-[.14em] text-dim uppercase">
                  PREÇO (R$)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editPreco}
                    onChange={(e) => {
                      setEditPreco(e.target.value)
                      setEditPriceResult(null)
                    }}
                    placeholder="0,00"
                    className="flex-1 bg-bg border border-white/[.09] focus:border-gold/40 rounded-[6px] px-3 py-[9px] text-[14px] outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleFetchPrice}
                    disabled={fetchingPrice}
                    className="shrink-0 bg-bg border border-white/[.09] hover:border-gold/30 rounded-[6px] px-3 text-[10px] font-condensed font-semibold text-dim transition-colors disabled:opacity-40 cursor-pointer whitespace-nowrap"
                  >
                    {fetchingPrice ? "…" : "Buscar BR"}
                  </button>
                </div>
                {editPriceResult && (
                  <p className="text-[10px] text-gold/60">
                    Fonte: {editPriceResult.fonte}
                    {editPriceResult.moeda === "BRL_estimado" && (
                      <span className="text-dim"> · estimativa</span>
                    )}
                  </p>
                )}
              </div>

              {/* Condição / Idioma */}
              <div className="grid grid-cols-2 gap-3">
                <ModalSelect
                  label="CONDIÇÃO"
                  value={editCondicao}
                  options={CONDICOES}
                  onChange={setEditCondicao}
                />
                <ModalSelect
                  label="IDIOMA"
                  value={editIdioma}
                  options={IDIOMAS}
                  onChange={setEditIdioma}
                />
              </div>

              {/* Quantidade */}
              <div className="flex flex-col gap-[6px]">
                <label className="font-condensed font-semibold text-[10px] tracking-[.14em] text-dim uppercase">
                  QUANTIDADE
                </label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={editQuantidade}
                  onChange={(e) =>
                    setEditQuantidade(
                      Math.max(1, Math.min(99, parseInt(e.target.value) || 1)),
                    )
                  }
                  className="bg-bg border border-white/[.09] focus:border-gold/40 rounded-[6px] px-3 py-[9px] text-[14px] outline-none transition-colors"
                />
              </div>

              {/* Botões */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-gold/10 border border-gold/40 text-gold font-condensed font-semibold text-[12px] tracking-[.06em] py-[9px] rounded-[6px] hover:bg-gold/15 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Salvando…" : "SALVAR"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false)
                    setEditPriceResult(null)
                  }}
                  className="flex-1 bg-surface border border-white/[.09] text-dim font-condensed font-semibold text-[12px] tracking-[.06em] py-[9px] rounded-[6px] hover:text-secondary transition-colors cursor-pointer"
                >
                  CANCELAR
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
