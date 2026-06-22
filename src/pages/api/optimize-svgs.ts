/**
 * API d'optimització de fitxers SVG.
 * Rep paràmetres de configuració (precisió) i una llista de fitxers,
 * i retorna un flux SSE amb el progrés de l'optimització.
 */

import type { APIRoute } from "astro"
import fs from "node:fs"
import { optimitzarSvgs } from "../../lib/converter-svg"
import type { ConfigVectors, ProgresConversio } from "../../lib/types"

// GET /api/optimize-svgs?dir=...&output=...&precision=...&overwrite=...&files=...
export const GET: APIRoute = async ({ url }) => {
  const dir = url.searchParams.get("dir")
  const output = url.searchParams.get("output")
  const precision = Number(url.searchParams.get("precision") ?? "3")
  const overwrite = url.searchParams.get("overwrite") === "true"
  const filesParam = url.searchParams.get("files")

  if (!dir || !filesParam) return new Response("Falten paràmetres", { status: 400 })

  const files = filesParam.split(",")
  const config: ConfigVectors = { precisio: precision }
  const sortida = output || dir
  if (!fs.existsSync(sortida)) fs.mkdirSync(sortida, { recursive: true })

  const stream = new ReadableStream({
    async start(controller) {
      try {
        await optimitzarSvgs(files, sortida, config, overwrite, (ev: ProgresConversio) => {
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(ev)}\n\n`))
        })
        controller.close()
      } catch (err) {
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ error: err instanceof Error ? err.message : "Error" })}\n\n`))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  })
}
