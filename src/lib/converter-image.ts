/**
 * Convertidor d'imatges a WebP.
 * Utilitza la llibreria sharp per convertir JPG i PNG a WebP
 * amb control de qualitat, velocitat i mode sense pèrdua.
 */

import fs from "node:fs"
import path from "node:path"
import sharp from "sharp"
import type { ConfigImatges, ProgresConversio } from "./types"
import { resoldreSortida } from "./suffix"

// Converteix una llista d'imatges a WebP emetent esdeveniments de progrés per cada fitxer
export async function convertirImatges(
  arxius: string[],
  directoriSortida: string,
  config: ConfigImatges,
  sobreescriure: boolean,
  onProgres: (ev: ProgresConversio) => void,
): Promise<void> {
  const { qualitat, velocitat, sensePerdua } = config
  const inici = Date.now()
  let actual = 0

  for (const arxiu of arxius) {
    actual++
    const nomBase = path.basename(arxiu, path.extname(arxiu))
    const sortida = resoldreSortida(directoriSortida, nomBase, ".webp", sobreescriure)

    // Omès si ja existeix una sortida amb sufix (evita duplicar a cada execució)
    if (!sobreescriure && fs.existsSync(sortida) && sortida !== path.join(directoriSortida, `${nomBase}.webp`)) {
      onProgres({ arxiu, estat: "skip", actual, total: arxius.length, transcorregut: (Date.now() - inici) / 1000, sortida })
      continue
    }

    try {
      const midaAbans = fs.statSync(arxiu).size
      await sharp(arxiu).webp({ quality: qualitat, effort: velocitat, lossless: sensePerdua }).toFile(sortida)
      const midaDespres = fs.statSync(sortida).size
      onProgres({ arxiu, estat: "ok", actual, total: arxius.length, transcorregut: (Date.now() - inici) / 1000, midaAbans, midaDespres, sortida })
    } catch (err) {
      onProgres({ arxiu, estat: "fail", actual, total: arxius.length, transcorregut: (Date.now() - inici) / 1000, missatge: err instanceof Error ? err.message : "Error desconegut" })
    }
  }
}
