import { NextRequest, NextResponse } from "next/server"
import * as cheerio from "cheerio"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
  Referer: "https://www.ligayugioh.com.br/",
  "Cache-Control": "no-cache",
}

function parseBRL(raw: string): number {
  return parseFloat(raw.replace(/\./g, "").replace(",", "."))
}

function extractPricesFromHTML(html: string): number[] {
  const prices: number[] = []
  const $ = cheerio.load(html)

  // Tentativa cheerio: seletores comuns de marketplace
  const selectors = [
    '[class*="price"]',
    '[class*="preco"]',
    '[class*="offer"]',
    '[class*="valor"]',
  ]
  for (const sel of selectors) {
    $(sel).each((_, el) => {
      const text = $(el).text()
      const m = text.match(/R\$\s*(\d{1,3}(?:\.\d{3})*,\d{2})/)
      if (m) prices.push(parseBRL(m[1]))
    })
    if (prices.length > 0) break
  }

  // Estratégia principal: regex sobre o HTML bruto inteiro
  if (prices.length === 0) {
    const matches = [...html.matchAll(/R\$\s*(\d{1,3}(?:\.\d{3})*,\d{2})/g)]
    for (const m of matches) prices.push(parseBRL(m[1]))
  }

  return prices.filter((p) => p > 0 && p < 100_000)
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!(session?.user as any)?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const codigo = req.nextUrl.searchParams.get("codigo")?.trim()
  if (!codigo) {
    return NextResponse.json(
      { error: "Parâmetro 'codigo' obrigatório" },
      { status: 400 },
    )
  }

  // === TENTATIVA 1: LigaYugioh ===
  try {
    const url = `https://www.ligayugioh.com.br/card/${encodeURIComponent(codigo)}`
    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(8_000),
    })

    if (res.ok) {
      const html = await res.text()
      const prices = extractPricesFromHTML(html)
      if (prices.length > 0) {
        return NextResponse.json({
          preco: Math.min(...prices),
          fonte: "LigaYugioh",
          moeda: "BRL",
        })
      }
    }
  } catch {
    // 403, timeout ou rede → vai para fallback
  }

  // === TENTATIVA 2: YGOProDeck + câmbio USD→BRL ===
  try {
    const cardSet = await (prisma as any).cardSet.findUnique({
      where: { setCode: codigo },
      include: { card: { select: { name: true } } },
    })

    if (!cardSet) {
      return NextResponse.json(
        { error: "Carta não encontrada no banco." },
        { status: 404 },
      )
    }

    const [ygoproRes, exchangeRes] = await Promise.all([
      fetch(
        `https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(cardSet.card.name)}`,
        { signal: AbortSignal.timeout(6_000) },
      ),
      fetch("https://open.er-api.com/v6/latest/USD", {
        signal: AbortSignal.timeout(6_000),
      }),
    ])

    if (!ygoproRes.ok || !exchangeRes.ok) throw new Error("api-down")

    const [ygoproData, exchangeData] = await Promise.all([
      ygoproRes.json(),
      exchangeRes.json(),
    ])

    const tcgUSD = parseFloat(
      ygoproData.data?.[0]?.card_prices?.[0]?.tcgplayer_price ?? "0",
    )
    const brlRate: number = exchangeData.rates?.BRL ?? 5.5

    if (!tcgUSD) throw new Error("no-price")

    return NextResponse.json({
      preco: parseFloat((tcgUSD * brlRate).toFixed(2)),
      fonte: "TCGPlayer (estimativa USD→BRL)",
      moeda: "BRL_estimado",
    })
  } catch (err: any) {
    return NextResponse.json({ error: "Preço não encontrado." }, { status: 404 })
  }
}
