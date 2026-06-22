# TODO — Properes modificacions

## AVIF (v2.0)

El successor de WebP. Comprimeix fins a un 50 % més que JPEG amb la mateixa qualitat visual. Suporta HDR i profunditat de color de 12 bits. La llibreria `sharp` ja el suporta; només cal afegir l'opció al selector de format. L'hem deixat per a la versió 2.0 perquè la codificació AVIF és més lenta i volíem una versió 1.0 sòlida primer.

## Subset de fonts

Una font tipogràfica completa (700 caràcters) pot ocupar 200 KB. Si només necessites 60 caràcters (A-Z, a-z, 0-9), pots generar una versió reduïda de només 15 KB. Eines com `harfbuzzjs` permeten extreure únicament els caràcters que fas servir al projecte.

## Optimització de PNG i JPEG addicional

De vegades cal optimitzar els PNG i JPEG originals sense canviar de format. Per exemple: reduir la paleta de colors d'un PNG amb compressió amb pèrdua, o recomprimir un JPEG amb paràmetres més eficients. `sharp` cobreix part d'aquestes necessitats, però eines especialitzades com `pngquant` o `mozjpeg` poden aconseguir millors resultats en casos concrets.
