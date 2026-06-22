import fs from "node:fs"
import path from "node:path"
import wawoff2 from "wawoff2"
import * as opentype from "opentype.js"
import type { ProgresConversio } from "./types"
import { resoldreSortida } from "./suffix"

export async function convertirFonts(
  arxius: string[],
  directoriSortida: string,
  sobreescriure: boolean,
  onProgres: (ev: ProgresConversio) => void,
): Promise<void> {
  const inici = Date.now()
  let actual = 0

  for (const arxiu of arxius) {
    actual++
    const ext = path.extname(arxiu).toLowerCase()
    const nomBase = path.basename(arxiu, ext)
    const sortida = resoldreSortida(directoriSortida, nomBase, ".woff2", sobreescriure)

    if (!sobreescriure && fs.existsSync(sortida) && sortida !== path.join(directoriSortida, `${nomBase}.woff2`)) {
      onProgres({ arxiu, estat: "skip", actual, total: arxius.length, transcorregut: (Date.now() - inici) / 1000, sortida })
      continue
    }

    try {
      const midaAbans = fs.statSync(arxiu).size
      let ttfBuffer: Uint8Array

      if (ext === ".ttf") {
        ttfBuffer = fs.readFileSync(arxiu)
      } else {
        const font = opentype.parse(fs.readFileSync(arxiu).buffer as ArrayBuffer)
        ttfBuffer = new Uint8Array(font.toArrayBuffer())
      }

      const woff2Buffer = wawoff2.compress(Buffer.from(ttfBuffer))
      fs.writeFileSync(sortida, woff2Buffer)
      const midaDespres = fs.statSync(sortida).size
      onProgres({ arxiu, estat: "ok", actual, total: arxius.length, transcorregut: (Date.now() - inici) / 1000, midaAbans, midaDespres, sortida })
    } catch (err) {
      onProgres({ arxiu, estat: "fail", actual, total: arxius.length, transcorregut: (Date.now() - inici) / 1000, missatge: err instanceof Error ? err.message : "Error desconegut" })
    }
  }
}
