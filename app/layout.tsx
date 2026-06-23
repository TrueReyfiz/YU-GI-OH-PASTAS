import type { Metadata } from "next"
import { Roboto, Roboto_Condensed, Roboto_Mono } from "next/font/google"
import "./globals.css"

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
})

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-roboto-condensed",
  display: "swap",
})

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-roboto-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Coleção Yu-Gi-Oh!",
  description: "Catálogo pessoal de cartas Yu-Gi-Oh!",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${roboto.variable} ${robotoCondensed.variable} ${robotoMono.variable}`}
    >
      <body className="antialiased min-h-screen bg-bg text-primary font-sans">{children}</body>
    </html>
  )
}
