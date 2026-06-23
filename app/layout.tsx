import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Coleção Yu-Gi-Oh!",
  description: "Catálogo pessoal de cartas Yu-Gi-Oh!",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased min-h-screen bg-dark text-gray-100">{children}</body>
    </html>
  )
}
