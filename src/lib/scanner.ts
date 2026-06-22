import fs from "node:fs"
import path from "node:path"
import type { Eina, ResultatEscaneig } from "./types"
import { EXTENSIONS } from "./types"

export function escanejarDirectori(
  directori: string,
  eina: Eina,
  recursiu: boolean,
): ResultatEscaneig {
  const arxius: string[] = []
  const extensions = EXTENSIONS[eina]

  if (!fs.existsSync(directori) || !fs.statSync(directori).isDirectory()) {
    return { arxius: [], total: 0, missatge: `Directori no trobat: ${directori}` }
  }

  function explorar(dir: string) {
    const entrades = fs.readdirSync(dir, { withFileTypes: true })
    for (const entrada of entrades) {
      const rutaCompleta = path.join(dir, entrada.name)
      if (entrada.isDirectory()) {
        if (recursiu && !entrada.name.startsWith(".")) {
          explorar(rutaCompleta)
        }
      } else if (entrada.isFile()) {
        const ext = path.extname(entrada.name).toLowerCase()
        if (extensions.includes(ext)) arxius.push(rutaCompleta)
      }
    }
  }

  explorar(directori)
  arxius.sort()

  const missatge =
    arxius.length > 0
      ? `${arxius.length} arxiu(s) trobat(s)`
      : `No s'han trobat arxius (${extensions.join(", ")}) a ${directori}`

  return { arxius, total: arxius.length, missatge }
}
