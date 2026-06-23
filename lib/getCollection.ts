import { CollectionCard } from "@/types/card"
import { promises as fs } from "fs"
import path from "path"

interface CollectionFile {
  meta?: unknown
  cartas: CollectionCard[]
}

export async function getCollection(): Promise<CollectionCard[]> {
  const filePath = path.join(process.cwd(), "public", "data", "collection.json")
  const raw = await fs.readFile(filePath, "utf-8")
  const parsed: CollectionCard[] | CollectionFile = JSON.parse(raw)
  if (Array.isArray(parsed)) return parsed
  return parsed.cartas
}
