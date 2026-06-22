/**
 * API de conversió de fonts a WOFF2.
 * Rep una llista de fitxers de font i retorna un flux SSE
 * amb el progrés de la conversió de cada fitxer.
 */

import type { APIRoute } from "astro"
import fs from "node:fs"
import { convertirFonts } from "../../lib/converter-font"
import type { ProgresConversio } from "../../lib/types"

// GET /api/convert-fonts?dir=...&output=...&overwrite=...&files=...
export const GET: APIRoute = async ({ url }) => {
  const dir = url.searchParams.get("dir")
  const output = url.searchParams.get("output")
  const overwrite = url.searchParams.get("overwrite") === "true"
  const filesParam = url.searchParams.get("files")

  if (!dir || !filesParam) return new Response("Falten paràmetres", { status: 400 })

  const files = filesParam.split(",")
  const sortida = output || dir
  if (!fs.existsSync(sortida)) fs.mkdirSync(sortida, { recursive: true })

  const stream = new ReadableStream({
    async start(controller) {
      try {
        await convertirFonts(files, sortida, overwrite, (ev: ProgresConversio) => {
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
