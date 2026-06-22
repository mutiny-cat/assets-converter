/**
 * Tipus i interfícies del convertidor d'actius.
 * Defineix les eines disponibles, les configuracions de conversió,
 * els resultats d'escaneig, el progrés i les entrades de directori
 * que s'usen a tota l'aplicació.
 */

// Tipus d'eina: imatges, vectors SVG o fonts
export type Eina = "imatges" | "vectors" | "fonts"

// Extensions de fitxer reconegudes per a cada eina
export const EXTENSIONS: Record<Eina, string[]> = {
  imatges: [".jpg", ".jpeg", ".png"],
  vectors: [".svg"],
  fonts: [".ttf", ".otf", ".woff"],
}

// Configuració per a la conversió d'imatges a WebP
export interface ConfigImatges {
  qualitat: number
  velocitat: number
  sensePerdua: boolean
}

// Configuració per a l'optimització de vectors SVG
export interface ConfigVectors {
  precisio: number
}

// Resultat d'un escaneig de directori: llista d'arxius trobats, total i missatge descriptiu
export interface ResultatEscaneig {
  arxius: string[]
  total: number
  missatge: string
}

// Estat de la conversió d'un fitxer: correcte, error o omès perquè ja existeix
export type EstatConversio = "ok" | "fail" | "skip"

// Esdeveniment de progrés emès durant la conversió, amb mides abans/després i temporització
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

// Una entrada dins d'un directori: pot ser un fitxer o una carpeta
export interface EntradaDirectori {
  nom: string
  ruta: string
  esDirectori: boolean
}

// Resultat de navegar un directori: ruta actual, ruta pare i llista d'entrades
export interface ResultatBrowse {
  ruta: string
  pare: string
  entries: EntradaDirectori[]
}
