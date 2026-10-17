// Adds search / sharing metadata to every page and regenerates sitemap.xml + robots.txt.
// Run after changing the domain:   node tools/seo.mjs https://your-domain.example/
// Safe to re-run: the block between the <!--seo--> markers is replaced each time.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'

const SITE = (process.argv[2] || 'https://newarrr.github.io/civil-defense/').replace(/\/?$/, '/')
const NAME = 'مديرية الدفاع المدني — محافظة دهوك'
const LANGS = { ar: 'ar', badini: 'ku-Arab', sorani: 'ckb', en: 'en' }
const pages = readdirSync('.').filter((f) => f.endsWith('.html') && f !== '404.html')
const attr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

for (const file of pages) {
  let html = readFileSync(file, 'utf8').replace(/\n?<!--seo-->[\s\S]*?<!--\/seo-->/, '')
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1]?.replace(/\s*—\s*مسودة مراجعة\s*$/, '') || NAME
  const existing = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1]
  const desc = existing || `${title}. معلومات توعية وسلامة من ${NAME}، بالعربية والكوردية (البادينية والسورانية) والإنجليزية.`
  const path = file === 'index.html' ? '' : file
  const url = SITE + path
  const tags = [
    existing ? '' : `<meta name="description" content="${attr(desc)}">`,
    `<link rel="canonical" href="${url}">`,
    ...Object.entries(LANGS).map(([id, tag]) => `<link rel="alternate" hreflang="${tag}" href="${url}?lang=${id}">`),
    `<link rel="alternate" hreflang="x-default" href="${url}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${attr(NAME)}">`,
    `<meta property="og:title" content="${attr(title)}">`,
    `<meta property="og:description" content="${attr(desc)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${SITE}assets/civil-defense-logo.png">`,
    `<meta property="og:locale" content="ar_IQ">`,
    `<meta name="twitter:card" content="summary">`,
    `<meta name="theme-color" content="#c70026">`,
    `<link rel="manifest" href="manifest.webmanifest">`,
    `<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">`,
  ]
  if (file === 'index.html')
    tags.push(
      `<script type="application/ld+json">${JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'GovernmentOrganization',
        name: NAME,
        alternateName: ['Directorate of Civil Defense — Duhok', 'بەڕێوەبەرایەتیی بەرگریی شارستانی — دهۆک'],
        url: SITE,
        logo: SITE + 'assets/civil-defense-logo.png',
        areaServed: { '@type': 'AdministrativeArea', name: 'Duhok Governorate, Kurdistan Region, Iraq' },
        contactPoint: { '@type': 'ContactPoint', telephone: '115', contactType: 'emergency' },
      })}</script>`,
    )
  const block = `\n<!--seo-->${tags.filter(Boolean).join('')}<!--/seo-->`
  html = html.replace(/<\/title>/, '</title>' + block)
  writeFileSync(file, html)
}

const today = new Date().toISOString().slice(0, 10)
writeFileSync(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    pages
      .filter((f) => f !== 'account.html')
      .map((f) => {
        const url = SITE + (f === 'index.html' ? '' : f)
        const alts = Object.entries(LANGS).map(([id, tag]) => `<xhtml:link rel="alternate" hreflang="${tag}" href="${url}?lang=${id}"/>`).join('')
        return `<url><loc>${url}</loc><lastmod>${today}</lastmod>${alts}</url>`
      })
      .join('\n') +
    '\n</urlset>\n',
)
writeFileSync('robots.txt', `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /tools/\nSitemap: ${SITE}sitemap.xml\n`)
console.log(`SEO updated for ${pages.length} pages at ${SITE}`)
