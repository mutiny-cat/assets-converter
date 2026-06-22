import type { APIRoute } from "astro"
import fs from "node:fs"
import path from "node:path"
import { EXTENSIONS } from "../../lib/types"
import type { Eina, EntradaDirectori, ResultatBrowse } from "../../lib/types"

export const GET: APIRoute = async ({ url }) => {
  const dir = url.searchParams.get("dir") || "/"
  const tool = url.searchParams.get("tool") as Eina | null

  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    return new Response(JSON.stringify({ error: `Directori no trobat` }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    })
  }

  const parent = path.resolve(dir, "..")
  const extensions = tool ? EXTENSIONS[tool] : null

  const entries: EntradaDirectori[] = []

  try {
    const items = fs.readdirSync(dir, { withFileTypes: true })

    const dirs = items
      .filter((d) => d.isDirectory() && !d.name.startsWith("."))
      .map((d) => ({ nom: d.name, ruta: path.join(dir, d.name), esDirectori: true }))
      .sort((a, b) => a.nom.localeCompare(b.nom))

    const files = items
      .filter((d) => {
        if (!d.isFile() || d.name.startsWith(".")) return false
        if (extensions) return extensions.includes(path.extname(d.name).toLowerCase())
        return true
      })
      .map((d) => ({ nom: d.name, ruta: path.join(dir, d.name), esDirectori: false }))
      .sort((a, b) => a.nom.localeCompare(b.nom))

    entries.push(...dirs, ...files)
  } catch {
    return new Response(JSON.stringify({ error: `Permís denegat` }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    })
  }

  const resultat: ResultatBrowse = { ruta: dir, pare: parent, entries }
  return new Response(JSON.stringify(resultat), {
    headers: { "Content-Type": "application/json" },
  })
}
