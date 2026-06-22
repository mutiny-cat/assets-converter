import fs from "node:fs"
import path from "node:path"

export function resoldreSortida(
  directoriSortida: string,
  nomBase: string,
  extensioSortida: string,
  sobreescriure: boolean,
): string {
  const candidat = path.join(directoriSortida, `${nomBase}${extensioSortida}`)

  if (sobreescriure || !fs.existsSync(candidat)) return candidat

  let contador = 1
  while (true) {
    const sufix = String(contador).padStart(3, "0")
    const alternatiu = path.join(directoriSortida, `${nomBase}__${sufix}${extensioSortida}`)
    if (!fs.existsSync(alternatiu)) return alternatiu
    contador++
  }
}
