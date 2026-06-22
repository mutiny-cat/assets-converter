/**
 * Escàner de directoris.
 * Explora recursivament o plana un directori cercant fitxers
 * que coincideixin amb les extensions de l'eina seleccionada.
 */

import fs from "node:fs"
import path from "node:path"
import type { Eina, ResultatEscaneig } from "./types"
import { EXTENSIONS } from "./types"

// Escaneja un directori i retorna els fitxers trobats segons l'eina (imatges, vectors, fonts)
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

  // Funció interna recursiva: llegeix un directori i acumula els fitxers amb extensions vàlides
  function explorar(dir: string) {
    const entrades = fs.readdirSync(dir, { withFileTypes: true })
    for (const entrada of entrades) {
      const rutaCompleta = path.join(dir, entrada.name)
      if (entrada.isDirectory()) {
        if (recursiu && !entrada.name.startsWith(".")) { // Evita carpetes ocultes
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
