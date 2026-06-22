/**
 * API de navegació de directoris.
 * Retorna el contingut d'una carpeta (subcarpetes i fitxers),
 * filtrant per extensió si s'especifica una eina.
 * Les carpetes ocultes i fitxers començats per "." s'ometen.
 */

import type { APIRoute } from "astro"
import fs from "node:fs"
import path from "node:path"
import { EXTENSIONS } from "../../lib/types"
import type { Eina, EntradaDirectori, ResultatBrowse } from "../../lib/types"

// GET /api/browse?dir=<ruta>&tool=<imatges|vectors|fonts>
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
    const extensions = tool ? EXTENSIONS[tool] : null // Si no hi ha eina, mostra tots els fitxers

  const entries: EntradaDirectori[] = []

  try {
    const items = fs.readdirSync(dir, { withFileTypes: true })

    const dirs = items
      .filter((d) => d.isDirectory() && !d.name.startsWith(".")) // Omet carpetes ocultes
      .map((d) => ({ nom: d.name, ruta: path.join(dir, d.name), esDirectori: true }))
      .sort((a, b) => a.nom.localeCompare(b.nom))

    const files = items
      .filter((d) => {
        if (!d.isFile() || d.name.startsWith(".")) return false // Omet fitxers ocults
        if (extensions) return extensions.includes(path.extname(d.name).toLowerCase()) // Filtra per extensió si cal
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
