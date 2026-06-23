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
    <header className="sticky top-0 z-40 bg-dark border-b border-dark-border shadow-gold">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-gold tracking-wider uppercase">
            Yu-Gi-Oh!
          </span>
          <span className="text-dark-border text-xl">|</span>
          <span className="text-sm text-gray-400 tracking-widest uppercase">Coleção</span>
        </div>

        <div className="flex items-center gap-6">
          <Stat label="Total de Cartas" value={String(totalCards)} />
          <div className="w-px h-8 bg-dark-border" />
          <Stat label="Valor da Coleção" value={formattedValue} />
        </div>
      </div>
    </header>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-xs text-gray-500 uppercase tracking-widest">{label}</p>
      <p className="text-lg font-bold text-gold">{value}</p>
    </div>
  )
}
