/**
 * Optimitzador de fitxers SVG.
 * Utilitza SVGO per reduir la mida dels SVG eliminant metadades
 * i optimitzant la precisió dels nombres decimals.
 */

import fs from "node:fs"
import path from "node:path"
import { optimize } from "svgo"
import type { ConfigVectors, ProgresConversio } from "./types"
import { resoldreSortida } from "./suffix"

// Optimitza una llista de fitxers SVG amb SVGO, emetent esdeveniments de progrés
export async function optimitzarSvgs(
  arxius: string[],
  directoriSortida: string,
  config: ConfigVectors,
  sobreescriure: boolean,
  onProgres: (ev: ProgresConversio) => void,
): Promise<void> {
  const { precisio } = config
  const inici = Date.now()
  let actual = 0

  for (const arxiu of arxius) {
    actual++
    const nomBase = path.basename(arxiu, path.extname(arxiu))
    const sortida = resoldreSortida(directoriSortida, nomBase, ".svg", sobreescriure)

    // Omès si la sortida amb sufix ja existeix
    if (!sobreescriure && fs.existsSync(sortida) && sortida !== path.join(directoriSortida, `${nomBase}.svg`)) {
      onProgres({ arxiu, estat: "skip", actual, total: arxius.length, transcorregut: (Date.now() - inici) / 1000, sortida })
      continue
    }

    try {
      const midaAbans = fs.statSync(arxiu).size
      const resultat = optimize(fs.readFileSync(arxiu, "utf-8"), { floatPrecision: precisio, multipass: true })
      fs.writeFileSync(sortida, resultat.data, "utf-8")
      const midaDespres = fs.statSync(sortida).size
      onProgres({ arxiu, estat: "ok", actual, total: arxius.length, transcorregut: (Date.now() - inici) / 1000, midaAbans, midaDespres, sortida })
    } catch (err) {
      onProgres({ arxiu, estat: "fail", actual, total: arxius.length, transcorregut: (Date.now() - inici) / 1000, missatge: err instanceof Error ? err.message : "Error desconegut" })
    }
  }
}
