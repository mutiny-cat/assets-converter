export type Eina = "imatges" | "vectors" | "fonts"

export const EXTENSIONS: Record<Eina, string[]> = {
  imatges: [".jpg", ".jpeg", ".png"],
  vectors: [".svg"],
  fonts: [".ttf", ".otf", ".woff"],
}

export interface ConfigImatges {
  qualitat: number
  velocitat: number
  sensePerdua: boolean
}

export interface ConfigVectors {
  precisio: number
}

export interface ResultatEscaneig {
  arxius: string[]
  total: number
  missatge: string
}

export type EstatConversio = "ok" | "fail" | "skip"

export interface ProgresConversio {
  arxiu: string
  estat: EstatConversio
  actual: number
  total: number
  transcorregut: number
  midaAbans?: number
  midaDespres?: number
  sortida?: string
  missatge?: string
}

export interface EntradaDirectori {
  nom: string
  ruta: string
  esDirectori: boolean
}

export interface ResultatBrowse {
  ruta: string
  pare: string
  entries: EntradaDirectori[]
}
