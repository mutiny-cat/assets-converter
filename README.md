# Assets Converter

Convertidor d'actius local: imatges a WebP, optimització SVG i fonts a WOFF2.

## Requisits

- Node.js >= 22
- pnpm >= 9

## Instal·lació

```bash
pnpm install
```

## Ús

```bash
pnpm dev
```

Obre http://localhost:9999 al navegador.

## Eines

| Eina | Funció | Entrada | Sortida |
|---|---|---|---|
| Imatges | Converteix a WebP | `.jpg` `.jpeg` `.png` | `.webp` |
| Vectors | Optimitza SVG | `.svg` | `.svg` |
| Fonts | Converteix a WOFF2 | `.ttf` `.otf` `.woff` | `.woff2` |

## Dependències

| Paquet | Ús |
|---|---|
| `sharp` | Imatges → WebP |
| `svgo` | SVG → SVG optimitzat |
| `wawoff2` | TTF → WOFF2 |
| `opentype.js` | OTF/WOFF → TTF |

## Comportament de sobreescriptura

Si no se sobreescriu i l'arxiu de sortida ja existeix, s'afegeix sufix `_001`, `_002`...

## Plataformes

macOS, Linux, Windows.
