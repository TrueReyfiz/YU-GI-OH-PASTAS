interface HeaderProps {
  totalCards: number
  totalValue: number
}

export default function Header({ totalCards, totalValue }: HeaderProps) {
  const formattedValue = totalValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })

  return (
    <header
      className="sticky top-0 z-30 border-b"
      style={{
        background: "rgba(8,11,16,.92)",
        backdropFilter: "blur(10px)",
        borderBottomColor: "rgba(255,255,255,0.07)",
      }}
    >
      <div className="max-w-[1240px] mx-auto px-6 py-[18px] flex items-center justify-between gap-5 flex-wrap">
        <div>
          <div className="font-condensed font-bold text-[24px] tracking-[.05em] text-primary leading-none">
            A COLEÇÃO
          </div>
          <div className="font-condensed font-medium text-[10px] tracking-[.24em] text-dim mt-[6px] uppercase">
            Yu-Gi-Oh! Estampas Ilustradas · Acervo Pessoal
          </div>
        </div>

        <div className="flex items-center gap-8">
          <Stat label="CARTAS" value={String(totalCards)} />
          <div className="w-px h-[34px] bg-white/[0.09]" />
          <Stat label="VALOR DA COLEÇÃO" value={formattedValue} isGold />
        </div>
      </div>
    </header>
  )
}

function Stat({ label, value, isGold }: { label: string; value: string; isGold?: boolean }) {
  return (
    <div className="text-right">
      <p className="font-condensed font-medium text-[9px] tracking-[.18em] text-dim uppercase">{label}</p>
      <p className={`font-condensed font-bold text-[24px] leading-tight ${isGold ? "text-gold" : "text-primary"}`}>
        {value}
      </p>
    </div>
  )
}
