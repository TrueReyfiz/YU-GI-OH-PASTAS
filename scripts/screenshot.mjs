import { chromium } from "playwright"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, "..", "tmp_screenshots")

const { mkdirSync } = await import("fs")
try { mkdirSync(OUT) } catch {}

const browser = await chromium.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" })
const page = await browser.newPage()
await page.setViewportSize({ width: 1440, height: 900 })

// 1. Página inicial
await page.goto("http://localhost:3001/login", { waitUntil: "load", timeout: 30000 })
await page.screenshot({ path: path.join(OUT, "01_home.png"), fullPage: false })
console.log("✓ 01_home.png")

// 2. Filtro por código SR13-PT001
await page.fill('input[placeholder="Ex: SR13-PT001"]', "SR13-PT001")
await page.waitForTimeout(500)
await page.screenshot({ path: path.join(OUT, "02_filtro_codigo.png") })
console.log("✓ 02_filtro_codigo.png")

// 3. Clica na carta e abre o modal
const card = page.locator('button').first()
await card.click()
await page.waitForTimeout(600)
await page.screenshot({ path: path.join(OUT, "03_modal.png") })
console.log("✓ 03_modal.png")

// 4. Troca para EN no toggle
const enBtn = page.locator('button', { hasText: 'EN' }).first()
if (await enBtn.isVisible()) {
  await enBtn.click()
  await page.waitForTimeout(300)
  await page.screenshot({ path: path.join(OUT, "04_modal_en.png") })
  console.log("✓ 04_modal_en.png")
} else {
  console.log("  toggle EN não visível (carta sem dual-lang)")
}

await browser.close()
console.log("\nScreenshots em: scripts/../tmp_screenshots/")
