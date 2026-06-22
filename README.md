# Assets Converter

Convertidor d'arxius de recursos locals pel desenvolupament de projectes web: imatges a WebP, optimització SVG i fonts a WOFF2.

---

## Tecnologies

| Capa | Tecnologia |
|---|---|
| Servidor | [Astro](https://astro.build) + adaptador Node.js |
| Bundler | [Vite](https://vite.dev) (integrat a Astro) |
| Gestor de paquets | [pnpm](https://pnpm.io) |
| Llenguatge | TypeScript |
| UI | HTML + CSS + JavaScript (sense framework) |
| Progrés en temps real | SSE (Server-Sent Events) |

## Requisits

- Node.js >= 22
- pnpm >= 9

## Dependències

| Paquet | Ús |
|---|---|
| `sharp` | Imatges → WebP |
| `svgo` | SVG → SVG optimitzat |
| `wawoff2` | TTF → WOFF2 |
| `opentype.js` | OTF / WOFF → TTF |

## Ús

### Desenvolupament

```bash
pnpm install
pnpm dev
```

Obre http://localhost:9999 al navegador. El mode `dev` s'executa ràpid i es recarrega automàticament en modificar el codi.

### Producció

```bash
pnpm build
node dist/server/entry.mjs
```

## Plataformes

macOS, Linux, Windows.

## Eines

| Eina | Funció | Entrada | Sortida |
|---|---|---|---|
| Imatges | Converteix a WebP | `.jpg` `.jpeg` `.png` | `.webp` |
| Vectors | Optimitza SVG | `.svg` | `.svg` |
| Fonts | Converteix a WOFF2 | `.ttf` `.otf` `.woff` | `.woff2` |

## Comportament de sobreescriptura

Si no se sobreescriu i l'arxiu de sortida ja existeix, s'afegeix un sufix `_001`, `_002`...
