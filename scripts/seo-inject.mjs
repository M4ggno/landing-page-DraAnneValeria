// Pós-build: escreve as tags de SEO/compartilhamento (de src/app/core/seo.ts) no index.html final.
// Crawlers de prévia (WhatsApp, Instagram, Facebook, LinkedIn, X) não executam JavaScript,
// então as tags precisam estar no HTML estático, com URLs absolutas.
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const seoSource = join(root, 'src/app/core/seo.ts');
const indexPath = join(root, 'dist/drAnnaValeria/browser/index.html');

// Transpila seo.ts on-the-fly (funciona em qualquer versão de Node, sem depender de type-stripping)
const { outputText } = ts.transpileModule(await readFile(seoSource, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const tmp = await mkdtemp(join(tmpdir(), 'seo-'));
const tmpFile = join(tmp, 'seo.mjs');
await writeFile(tmpFile, outputText);
const { SEO, normalizeSiteUrl, renderSeoHead } = await import(pathToFileURL(tmpFile).href);
await rm(tmp, { recursive: true, force: true });

const siteUrl = normalizeSiteUrl(
  process.env.SITE_URL ||
    SEO.siteUrl ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL,
);
if (!siteUrl) {
  console.warn('[seo] Nenhuma URL definida (SITE_URL / VERCEL_PROJECT_PRODUCTION_URL): usando caminhos relativos.');
}

const html = await readFile(indexPath, 'utf8');
const pattern = /[ \t]*<!-- SEO:START[\s\S]*?<!-- SEO:END -->/;
if (!pattern.test(html)) {
  throw new Error('[seo] Marcadores <!-- SEO:START --> / <!-- SEO:END --> não encontrados em index.html');
}
await writeFile(indexPath, html.replace(pattern, renderSeoHead(siteUrl)));
console.log(`[seo] Tags injetadas em index.html (${siteUrl || 'sem domínio'})`);
