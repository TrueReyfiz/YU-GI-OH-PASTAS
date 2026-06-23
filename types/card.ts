export interface CollectionCard {
  nome: string
  idioma: string
  tipo: string
  raridade: string
  colecao: string
  quantidade: number
  condicao: string
  preco: number
}

export interface APICard {
  id: number
  name: string
  pt_name?: string
  type: string
  desc: string
  atk?: number
  def?: number
  level?: number
  race?: string
  attribute?: string
  card_images?: { id: number; image_url: string; image_url_small: string }[]
  card_sets?: { set_name: string; set_code: string; set_rarity: string }[]
}

export interface APISetResponse {
  data: APICard[]
}

export interface EnrichedCard extends CollectionCard {
  apiId?: number
  desc?: string
  descPt?: string
  descEn?: string
  atk?: number
  def?: number
  level?: number
  race?: string
  attribute?: string
  imageUrl?: string
}
