import type { APIRoute } from "astro"
import fs from "node:fs"
import { convertirImatges } from "../../lib/converter-image"
import type { ConfigImatges, ProgresConversio } from "../../lib/types"

export const GET: APIRoute = async ({ url }) => {
  const dir = url.searchParams.get("dir")
  const output = url.searchParams.get("output")
  const quality = Number(url.searchParams.get("quality") ?? "80")
  const speed = Number(url.searchParams.get("speed") ?? "4")
  const lossless = url.searchParams.get("lossless") === "true"
  const overwrite = url.searchParams.get("overwrite") === "true"
  const filesParam = url.searchParams.get("files")

  if (!dir || !filesParam) return new Response("Falten paràmetres", { status: 400 })

  const files = filesParam.split(",")
  const config: ConfigImatges = { qualitat: quality, velocitat: speed, sensePerdua: lossless }
  const sortida = output || dir
  if (!fs.existsSync(sortida)) fs.mkdirSync(sortida, { recursive: true })

  const stream = new ReadableStream({
    async start(controller) {
      try {
        await convertirImatges(files, sortida, config, overwrite, (ev: ProgresConversio) => {
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
