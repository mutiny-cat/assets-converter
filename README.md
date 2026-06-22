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

El mode `dev` s'executa ràpid i es recarrega automàticament en modificar el codi. És l'indicat per a ús local diari.

Per a un entorn de producció (sense recàrrega automàtica, més ràpid en execució):

```bash
pnpm build
node dist/server/entry.mjs
```

## Accés directe a l'escriptori (macOS)

Hi ha un `.app` a l'escriptori (`Assets Converter.app`). Fes-hi doble clic per executar el servidor i obrir el navegador automàticament.

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

Si no se sobreescriu i l'arxiu de sortida ja existeix, s'afegeix un sufix `_001`, `_002`...

## Plataformes

macOS, Linux, Windows.
