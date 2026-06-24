import { createClient } from "@libsql/client"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, "..", "dev.db")

const client = createClient({ url: `file:${dbPath}` })

const result = await client.execute("SELECT id, email, name, createdAt FROM User ORDER BY createdAt ASC")

if (result.rows.length === 0) {
  console.log("Nenhum usuário cadastrado ainda.")
} else {
  console.log(`Total: ${result.rows.length} usuário(s)\n`)
  for (const u of result.rows) {
    console.log(`ID:        ${u.id}`)
    console.log(`Email:     ${u.email}`)
    console.log(`Nome:      ${u.name ?? "(sem nome)"}`)
    console.log(`Cadastro:  ${u.createdAt}`)
    console.log("─".repeat(50))
  }
}

client.close()
