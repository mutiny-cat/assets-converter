/**
 * Resolució de noms de fitxer de sortida.
 * Evita col·lisions generant un sufix __001, __002, etc.
 * si el fitxer ja existeix i no es vol sobreescriure.
 */

import fs from "node:fs"
import path from "node:path"

// Retorna la ruta de sortida definitiva: si ja existeix i no se sobreescriu,
// afegeix un sufix numèric incremental (__001, __002, ...)
export function resoldreSortida(
  directoriSortida: string,
  nomBase: string,
  extensioSortida: string,
  sobreescriure: boolean,
): string {
  const candidat = path.join(directoriSortida, `${nomBase}${extensioSortida}`)

  if (sobreescriure || !fs.existsSync(candidat)) return candidat

  // Genera sufixos incrementals (__001, __002...) fins a trobar un nom lliure
  let contador = 1
  while (true) {
    const sufix = String(contador).padStart(3, "0")
    const alternatiu = path.join(directoriSortida, `${nomBase}__${sufix}${extensioSortida}`)
    if (!fs.existsSync(alternatiu)) return alternatiu
    contador++
  }
}
