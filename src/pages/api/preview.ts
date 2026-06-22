import type { APIRoute } from "astro"
import fs from "node:fs"
import path from "node:path"

export const GET: APIRoute = async ({ url }) => {
  const ruta = url.searchParams.get("path")
  if (!ruta) return new Response("Falta path", { status: 400 })

  const rutaAbsoluta = path.resolve(ruta)
  if (!fs.existsSync(rutaAbsoluta) || !fs.statSync(rutaAbsoluta).isFile()) {
    return new Response("No trobat", { status: 404 })
  }

  const ext = path.extname(rutaAbsoluta).toLowerCase()
  const mimes: Record<string, string> = {
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
    ".webp": "image/webp", ".svg": "image/svg+xml",
  }
  const mime = mimes[ext]
  if (!mime) return new Response("Tipus no permès", { status: 403 })

  return new Response(fs.readFileSync(rutaAbsoluta), {
    headers: { "Content-Type": mime, "Cache-Control": "no-cache" },
  })
}
