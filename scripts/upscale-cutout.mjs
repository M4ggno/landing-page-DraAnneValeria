/**
 * Remasteriza um recorte (webp com alfa) em resolução maior — upscale Lanczos3
 * + leve nitidez + reencode de qualidade alta.
 *
 * Serve para quando o arquivo entregue está abaixo da resolução de exibição
 * (ex.: um recorte 409px mostrado num espaço de ~750px em telas retina).
 * Não cria detalhe real: só evita o upscale cru do navegador. O ideal continua
 * sendo reexportar do original em alta.
 *
 * Uso:
 *   node scripts/upscale-cutout.mjs <src.webp> <dest.webp> [largura] [qualidade]
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const [src, dest, widthArg, qualityArg] = process.argv.slice(2);
if (!src || !dest) {
  console.error('usage: node scripts/upscale-cutout.mjs <src.webp> <dest.webp> [width] [quality]');
  process.exit(1);
}
const width = Number(widthArg ?? 818);
const quality = Number(qualityArg ?? 90);

const meta = await sharp(src).metadata();
if (!meta.width || !meta.height) {
  console.error(`não consegui ler ${src}`);
  process.exit(1);
}

const out = await sharp(src)
  .resize({ width, kernel: 'lanczos3' })
  .sharpen({ sigma: 0.8, m1: 0.55, m2: 0.4 })
  .webp({ quality, effort: 6 })
  .toBuffer();

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, out);

const outMeta = await sharp(out).metadata();
console.log(
  `ok ${meta.width}x${meta.height} -> ${outMeta.width}x${outMeta.height}  ${Math.round(out.length / 1024)} KB  (${dest})`,
);
