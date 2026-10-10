/**
 * Suaviza o canal alfa de um recorte (remove o "corte seco" das bordas).
 *
 * Gera um novo arquivo onde a silhueta tem uma borda macia (feather),
 * em vez de um corte binário duro. O degradê da borda fica proporcional
 * ao tamanho em que a foto é exibida no site.
 *
 * Uso:
 *   node scripts/soft-alpha.mjs <src.webp> <dest.webp> [sigma]
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const [src, dest, sigmaArg] = process.argv.slice(2);
if (!src || !dest) {
  console.error('usage: node scripts/soft-alpha.mjs <src> <dest> [sigma]');
  process.exit(1);
}
const sigma = Number(sigmaArg ?? 8);

const meta = await sharp(src).metadata();
if (!meta.width || !meta.height || (meta.channels ?? 0) < 4) {
  console.error(`no alpha channel in ${src} (channels=${meta.channels})`);
  process.exit(1);
}

// RGB da origem + alfa desfocado (borda macia), montados manualmente em RGBA
const rgb = await sharp(src).removeAlpha().raw().toBuffer();
if (rgb.length !== meta.width * meta.height * 3) {
  throw new Error('unexpected RGB buffer size');
}
const alpha = await sharp(src).extractChannel(3).blur(sigma).raw().toBuffer();
if (alpha.length !== meta.width * meta.height * 1) {
  throw new Error('unexpected alpha buffer size');
}

const rgba = Buffer.alloc(meta.width * meta.height * 4);
for (let i = 0; i < meta.width * meta.height; i++) {
  rgba[i * 4 + 0] = rgb[i * 3 + 0];
  rgba[i * 4 + 1] = rgb[i * 3 + 1];
  rgba[i * 4 + 2] = rgb[i * 3 + 2];
  rgba[i * 4 + 3] = alpha[i];
}

const out = await sharp(rgba, {
  raw: { width: meta.width, height: meta.height, channels: 4 },
})
  .webp({ quality: 88, effort: 5 })
  .toBuffer();

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, out);

const outMeta = await sharp(out).metadata();
const sizeKb = Math.round(out.length / 1024);
console.log(
  `ok ${src} -> ${dest} sigma=${sigma} ${outMeta.width}x${outMeta.height} ch=${outMeta.channels} ${sizeKb} KB`,
);