/**
 * API de volums macOS.
 * Llista les unitats muntades a /Volumes, excloent
 * les unitats del sistema (Macintosh HD, Preboot, Recovery, etc.).
 */

import type { APIRoute } from "astro"
import fs from "node:fs"
import path from "node:path"

// GET /api/volumes — retorna volums externs i xarxa muntats a macOS
export const GET: APIRoute = async () => {
  const volDir = "/Volumes"
  const volums: { nom: string; ruta: string }[] = []

  if (!fs.existsSync(volDir)) {
    return new Response(JSON.stringify(volums), { headers: { "Content-Type": "application/json" } })
  }

  try {
    for (const nom of fs.readdirSync(volDir)) {
      const ruta = path.join(volDir, nom)
      const sistema = ["Macintosh HD", "BOOTCAMP", "Preboot", "Recovery", "VM", "Update", "xART"] // Unitats internes ignorades
      if (fs.statSync(ruta).isDirectory() && !nom.startsWith(".") && !sistema.includes(nom)) {
        volums.push({ nom, ruta })
      }
    }
  } catch {
    // sense permisos
  }

  return new Response(JSON.stringify(volums), { headers: { "Content-Type": "application/json" } })
}
