import { APICard, APISetResponse, CollectionCard, EnrichedCard } from "@/types/card"
import { promises as fs } from "fs"
import path from "path"

const API_BASE = "https://db.ygoprodeck.com/api/v7/cardinfo.php"
const SETS_URL = "https://db.ygoprodeck.com/api/v7/cardsets.php"
const IMAGE_BASE = "https://images.ygoprodeck.com/images/cards_small"

const DIACRITICS_RE = /[̀-ͯ]/g

interface SetInfo {
  set_name: string
  set_code: string
}

// Strips diacritics: "Relampago" == "Relampago" and "Relampago" == "Relâmpago"
function norm(name: string): string {
  return name.toLowerCase().trim().normalize("NFD").replace(DIACRITICS_RE, "")
}

function extractSetCode(colecao: string): string {
  return colecao.split("-")[0]
}

// Convert any 2-letter language suffix to EN: -PT, -FR, -KR, -DE, -IT, etc.
// "SR13-PT001" -> "SR13-EN001", "CT04-FR003" -> "CT04-EN003", "LEHD-PTA22" -> "LEHD-ENA22"
function toEnCode(colecao: string): string {
  return colecao.replace(/-([A-Z]{2})(\w+)/, "-EN$2")
}

async function loadImageOverrides(): Promise<Map<string, string>> {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "image-overrides.json")
    const raw = await fs.readFile(filePath, "utf-8")
    const data: Record<string, number | null> = JSON.parse(raw)
    const map = new Map<string, string>()
    for (const [colecao, id] of Object.entries(data)) {
      if (id !== null) map.set(colecao, `${IMAGE_BASE}/${id}.jpg`)
    }
    return map
  } catch {
    return new Map()
  }
}

async function fetchCardByEnName(nome: string): Promise<APICard | null> {
  try {
    const url = `${API_BASE}?name=${encodeURIComponent(nome)}`
    const res = await fetch(url, { next: { revalidate: 86400 } })
    if (!res.ok) return null
    const json: APISetResponse = await res.json()
    return json.data?.[0] ?? null
  } catch {
    return null
  }
}

async function fetchSetList(): Promise<Map<string, string>> {
  try {
    const res = await fetch(SETS_URL, { next: { revalidate: 86400 } })
    if (!res.ok) return new Map()
    const sets: SetInfo[] = await res.json()
    const map = new Map<string, string>()
    for (const s of sets) map.set(s.set_code, s.set_name)
    return map
  } catch {
    return new Map()
  }
}

// language: "pt" | "fr" | "de" | "it" | undefined (undefined = English, no param)
async function fetchCardsBySetName(setName: string, language?: string): Promise<APICard[]> {
  try {
    const langParam = language ? `&language=${language}` : ""
    const url = `${API_BASE}?cardset=${encodeURIComponent(setName)}${langParam}`
    const res = await fetch(url, { next: { revalidate: 86400 } })
    if (!res.ok) return []
    const json: APISetResponse = await res.json()
    return json.data ?? []
  } catch {
    return []
  }
}

function toEnriched(local: CollectionCard, apiCard: APICard): EnrichedCard {
  return {
    ...local,
    apiId: apiCard.id,
    desc: apiCard.desc,
    atk: apiCard.atk,
    def: apiCard.def,
    level: apiCard.level,
    race: apiCard.race,
    attribute: apiCard.attribute,
    imageUrl: `${IMAGE_BASE}/${apiCard.id}.jpg`,
  }
}

export async function enrichCards(collection: CollectionCard[]): Promise<EnrichedCard[]> {
  const [setCodeToName, imageOverrides] = await Promise.all([fetchSetList(), loadImageOverrides()])
  const uniqueSetCodes = Array.from(new Set(collection.map((c) => extractSetCode(c.colecao))))

  const byPt = new Map<string, Map<string, APICard>>()
  const byEn = new Map<string, Map<string, APICard>>()
  // Flat map: "SR13-EN010" -> APICard, built from card_sets of every EN card fetched
  const bySetCode = new Map<string, APICard>()

  await Promise.all(
    uniqueSetCodes.map(async (code) => {
      const setName = setCodeToName.get(code)
      if (!setName) return

      const [ptCards, enCards] = await Promise.all([
        fetchCardsBySetName(setName, "pt"),
        fetchCardsBySetName(setName), // English: no language param
      ])

      const ptMap = new Map<string, APICard>()
      for (const card of ptCards) ptMap.set(norm(card.name), card)
      byPt.set(code, ptMap)

      const enMap = new Map<string, APICard>()
      for (const card of enCards) {
        enMap.set(norm(card.name), card)
        for (const cs of card.card_sets ?? []) {
          if (!bySetCode.has(cs.set_code)) bySetCode.set(cs.set_code, card)
        }
      }
      byEn.set(code, enMap)
    })
  )

  const enriched = collection.map((local): EnrichedCard => {
    const code = extractSetCode(local.colecao)
    const key = norm(local.nome)

    // 1. PT name match (diacritic-normalized)
    const ptCard = byPt.get(code)?.get(key)
    if (ptCard) return toEnriched(local, ptCard)

    // 2. EN name match (for English-language cards whose nome is already in English)
    const enCard = byEn.get(code)?.get(key)
    if (enCard) return toEnriched(local, enCard)

    // 3. Set-code match: any language suffix -> EN suffix -> lookup in bySetCode
    const enCode = toEnCode(local.colecao)
    const codeCard = bySetCode.get(enCode) ?? bySetCode.get(local.colecao)
    if (codeCard) return toEnriched(local, codeCard)

    // 4. Manual override from image-overrides.json (tokens, promos, accessories)
    const overrideUrl = imageOverrides.get(local.colecao)
    if (overrideUrl) return { ...local, imageUrl: overrideUrl }

    return { ...local }
  })

  // 5. English exact-name search for EN cards whose set isn't tracked in the API
  const unmatchedEn = enriched
    .filter((c) => !c.imageUrl && c.idioma === "Inglês")
    .map((c) => c.nome)
  const uniqueEnNames = Array.from(new Set(unmatchedEn))

  const enNameCache = new Map<string, APICard | null>()
  await Promise.all(uniqueEnNames.map(async (nome) => {
    enNameCache.set(nome, await fetchCardByEnName(nome))
  }))

  const afterEnSearch = enriched.map((card) => {
    if (card.imageUrl || card.idioma !== "Inglês") return card
    const apiCard = enNameCache.get(card.nome)
    return apiCard ? toEnriched(card, apiCard) : card
  })

  // 6. Name deduplication: if another card with the same nome already has an image, reuse it
  //    e.g. "Dente-de-Leao" SR01 matched -> DUDA and 20AP versions inherit the image
  const nameToImage = new Map<string, string>()
  for (const card of afterEnSearch) {
    if (card.imageUrl) nameToImage.set(norm(card.nome), card.imageUrl)
  }
  return afterEnSearch.map((card) =>
    !card.imageUrl && nameToImage.has(norm(card.nome))
      ? { ...card, imageUrl: nameToImage.get(norm(card.nome)) }
      : card
  )
}
