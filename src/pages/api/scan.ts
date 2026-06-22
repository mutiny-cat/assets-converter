/**
 * API d'escaneig de fitxers.
 * Rep un directori, eina i mode recursiu, i delega en
 * el mòdul escàner per retornar la llista de fitxers trobats.
 */

import type { APIRoute } from "astro"
import { escanejarDirectori } from "../../lib/scanner"
import type { Eina } from "../../lib/types"

// POST /api/scan — body: { directory, tool, recursive }
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const { directory, tool, recursive } = body as { directory: string; tool: string; recursive: boolean }

    if (!directory || !tool) {
      return new Response(JSON.stringify({ error: "Falten paràmetres" }), { status: 400 })
    }

    const resultat = escanejarDirectori(directory, tool as Eina, recursive)
    return new Response(JSON.stringify(resultat))
  } catch {
    return new Response(JSON.stringify({ error: "Error intern" }), { status: 500 })
  }
}
