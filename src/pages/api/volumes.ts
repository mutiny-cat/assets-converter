import type { APIRoute } from "astro"
import fs from "node:fs"
import path from "node:path"

export const GET: APIRoute = async () => {
  const volDir = "/Volumes"
  const volums: { nom: string; ruta: string }[] = []

  if (!fs.existsSync(volDir)) {
    return new Response(JSON.stringify(volums), { headers: { "Content-Type": "application/json" } })
  }

  try {
    for (const nom of fs.readdirSync(volDir)) {
      const ruta = path.join(volDir, nom)
      if (fs.statSync(ruta).isDirectory() && !nom.startsWith(".") && nom !== "Macintosh HD") {
        volums.push({ nom, ruta })
      }
    }
  } catch {
    // sense permisos
  }

  return new Response(JSON.stringify(volums), { headers: { "Content-Type": "application/json" } })
}
