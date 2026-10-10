import type { Meta, MetaDefinition, Title } from '@angular/platform-browser';

/**
 * Fonte única de SEO / prévia de compartilhamento do site.
 *
 * - Em build, `scripts/seo-inject.mjs` usa `renderSeoHead()` para escrever as tags estáticas no
 *   `index.html` final — é isso que WhatsApp, Instagram, Facebook, LinkedIn e X leem (eles não executam JS).
 * - Em runtime, `applySeo()` reaplica as mesmas tags com a origem real (útil para o Google e previews).
 *
 * URL do site: definida no build por `SITE_URL` ou, na Vercel, automaticamente por
 * `VERCEL_PROJECT_PRODUCTION_URL` (domínio próprio quando configurado, senão o *.vercel.app).
 */
export const SEO = {
  /** Usado só se nenhuma variável de ambiente definir a URL. Ex.: 'https://draannevaleria.com.br' */
  siteUrl: '',
  lang: 'pt-BR',
  locale: 'pt_BR',
  siteName: 'Dra. Anne Valéria',
  title: 'Dra. Anne Valéria — Pneumologista, Alergologista e Imunologista | Patos PB',
  shareTitle: 'Dra. Anne Valéria — Pneumologista, Alergologista e Imunologista',
  description:
    'Pneumologista, Alergologista e Imunologista com 37 anos de experiência. Atende em Patos, Sousa, Pombal (PB), Caicó (RN) e Afogados da Ingazeira (PE). Agende pelo WhatsApp.',
  shareDescription:
    '37 anos de experiência em Pneumologia, Alergia e Imunologia. Atendimento humanizado e individualizado. Agende pelo WhatsApp.',
  keywords:
    'pneumologista patos pb, alergologista patos pb, imunologista, dra anne valeria, consulta pneumologia, espirometria, polissonografia, asma, bronquite, rinite, alergia, clinap, instituto yso',
  author: 'Dra. Anne Valéria Macedo Faustino',
  themeColor: '#1a1410',
  image: {
    path: '/og-image.jpg',
    width: 1200,
    height: 630,
    type: 'image/jpeg',
    alt: 'Dra. Anne Valéria — Pneumologista, Alergologista e Imunologista, 37 anos de experiência',
  },
  physician: {
    name: 'Dra. Anne Valéria Macedo Faustino',
    telephone: '+5583982349308',
    instagram: 'https://www.instagram.com/draannevaleria_/',
    locality: 'Patos',
    region: 'PB',
    specialties: ['Pulmonary Medicine', 'Allergy', 'Immunology'],
    areaServed: ['Patos, PB', 'Sousa, PB', 'Pombal, PB', 'Caicó, RN', 'Afogados da Ingazeira, PE', 'Bahia'],
    services: [
      { type: 'MedicalProcedure', name: 'Consulta em Pneumologia' },
      { type: 'MedicalProcedure', name: 'Avaliação de Alergias e Alterações da Imunidade' },
      { type: 'MedicalTest', name: 'Espirometria' },
      { type: 'MedicalTherapy', name: 'Imunoterapia' },
      { type: 'MedicalProcedure', name: 'Acompanhamento de Doenças Respiratórias Crônicas' },
      { type: 'MedicalProcedure', name: 'Avaliação de Risco Cirúrgico' },
      { type: 'MedicalTest', name: 'Polissonografia' },
    ],
  },
} as const;

/** Perguntas frequentes — fonte única para a seção FAQ e para o Schema.org (FAQPage). */
export interface FaqEntry {
  question: string;
  answer: string;
}

export const FAQS: FaqEntry[] = [
  {
    question: 'Preciso de encaminhamento médico?',
    answer:
      'Não. A consulta pode ser agendada diretamente pelo WhatsApp, sem necessidade de encaminhamento. A equipe confirma as informações e o melhor horário disponível.',
  },
  {
    question: 'O atendimento é por convênio ou particular?',
    answer:
      'O atendimento é particular, com retorno incluído e acompanhamento continuado. A equipe informa as formas de pagamento no momento do agendamento.',
  },
  {
    question: 'A médica atende on-line (teleatendimento)?',
    answer:
      'Sim. As consultas de Pneumologia e a avaliação de alergias e imunidade estão disponíveis na modalidade on-line. Exames como espirometria e polissonografia são presenciais.',
  },
  {
    question: 'Quais exames e procedimentos são realizados?',
    answer:
      'Entre os principais estão a espirometria (avaliação da função pulmonar), a polissonografia (distúrbios do sono), a avaliação de risco cirúrgico e o acompanhamento de doenças respiratórias crônicas.',
  },
  {
    question: 'Como funciona o retorno?',
    answer:
      'O retorno é incluído após a consulta inicial, para revisão de exames e ajuste do tratamento, garantindo acompanhamento próximo durante toda a conduta.',
  },
  {
    question: 'Em quais cidades há atendimento presencial?',
    answer:
      'Patos (PB — CLINAP), Sousa (PB — Instituto YSO), Pombal (PB — Núcleo Vida), Caicó (RN — Clinical Center), Afogados da Ingazeira (PE) e unidades na Bahia.',
  },
  {
    question: 'Qual o horário de atendimento da equipe?',
    answer:
      'A equipe responde pelo WhatsApp de segunda a sábado, das 8h às 17h. O retorno é feito o quanto antes, na ordem das mensagens.',
  },
];

/** Remove barra final e garante protocolo. Retorna '' se não houver URL. */
export function normalizeSiteUrl(url: string | undefined | null): string {
  if (!url) return '';
  const withProtocol = /^https?:\/\//.test(url) ? url : `https://${url}`;
  return withProtocol.replace(/\/+$/, '');
}

function absolute(siteUrl: string, path: string): string {
  return siteUrl ? `${siteUrl}${path}` : path;
}

/** Tags <meta> (exceto charset/viewport/title), na mesma forma para build e runtime. */
export function seoMetaTags(siteUrl: string): MetaDefinition[] {
  const url = siteUrl ? `${siteUrl}/` : '';
  const image = absolute(siteUrl, SEO.image.path);
  const tags: MetaDefinition[] = [
    { name: 'description', content: SEO.description },
    { name: 'keywords', content: SEO.keywords },
    { name: 'author', content: SEO.author },
    { name: 'robots', content: 'index, follow, max-image-preview:large' },
    { name: 'theme-color', content: SEO.themeColor },

    { property: 'og:type', content: 'website' },
    { property: 'og:locale', content: SEO.locale },
    { property: 'og:site_name', content: SEO.siteName },
    { property: 'og:title', content: SEO.shareTitle },
    { property: 'og:description', content: SEO.shareDescription },
    { property: 'og:image', content: image },
    { property: 'og:image:secure_url', content: image },
    { property: 'og:image:type', content: SEO.image.type },
    { property: 'og:image:width', content: String(SEO.image.width) },
    { property: 'og:image:height', content: String(SEO.image.height) },
    { property: 'og:image:alt', content: SEO.image.alt },

    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: SEO.shareTitle },
    { name: 'twitter:description', content: SEO.shareDescription },
    { name: 'twitter:image', content: image },
    { name: 'twitter:image:alt', content: SEO.image.alt },
  ];
  if (url) tags.push({ property: 'og:url', content: url });
  return tags;
}

/** Dados estruturados Schema.org (Physician). */
export function seoJsonLd(siteUrl: string): Record<string, unknown> {
  const p = SEO.physician;
  return {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: p.name,
    description: SEO.description,
    ...(siteUrl ? { url: `${siteUrl}/`, '@id': `${siteUrl}/#physician` } : {}),
    image: absolute(siteUrl, SEO.image.path),
    telephone: p.telephone,
    medicalSpecialty: p.specialties,
    sameAs: [p.instagram],
    address: {
      '@type': 'PostalAddress',
      addressLocality: p.locality,
      addressRegion: p.region,
      addressCountry: 'BR',
    },
    areaServed: p.areaServed,
    availableService: p.services.map((s) => ({ '@type': s.type, name: s.name })),
  };
}

/** Dados estruturados Schema.org (FAQPage) a partir das perguntas frequentes. */
export function seoFaqJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** HTML estático do bloco de SEO, inserido no index.html no build. */
export function renderSeoHead(siteUrl: string): string {
  const lines: string[] = [];
  lines.push(`<title>${escapeAttr(SEO.title)}</title>`);
  for (const tag of seoMetaTags(siteUrl)) {
    const key = tag.property ? `property="${tag.property}"` : `name="${tag.name}"`;
    lines.push(`<meta ${key} content="${escapeAttr(tag.content ?? '')}">`);
  }
  if (siteUrl) lines.push(`<link rel="canonical" href="${siteUrl}/">`);
  const json = JSON.stringify(seoJsonLd(siteUrl), null, 2).replace(/</g, '\\u003c');
  lines.push(`<script type="application/ld+json">\n${json}\n</script>`);
  const faqJson = JSON.stringify(seoFaqJsonLd(), null, 2).replace(/</g, '\\u003c');
  lines.push(`<script type="application/ld+json">\n${faqJson}\n</script>`);
  return lines.map((l) => `  ${l}`).join('\n');
}

/**
 * Reaplica as tags em runtime (title, metas, canonical).
 * Prioridade da URL: `SEO.siteUrl` → canonical gerado no build → origem atual (dev/local).
 */
export function applySeo(meta: Meta, title: Title, doc: Document): void {
  let canonical = doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  const origin =
    normalizeSiteUrl(SEO.siteUrl) ||
    normalizeSiteUrl(canonical ? new URL(canonical.href).origin : null) ||
    normalizeSiteUrl(doc.location?.origin);
  title.setTitle(SEO.title);
  for (const tag of seoMetaTags(origin)) {
    meta.updateTag(tag, tag.property ? `property="${tag.property}"` : `name="${tag.name}"`);
  }
  if (!origin) return;
  if (!canonical) {
    canonical = doc.createElement('link');
    canonical.rel = 'canonical';
    doc.head.appendChild(canonical);
  }
  canonical.href = `${origin}/`;
}
