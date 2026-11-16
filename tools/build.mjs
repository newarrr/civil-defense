// Generates every HTML page, sitemap.xml and robots.txt from one template, and writes the offline
// cache fingerprint (VERSION) into sw.js.
//
//     node tools/build.mjs
//
// Run it after ANY change to css/, js/, locales/, data/, fonts/, assets/brand or assets/photos
// (they feed the fingerprint), to a page title, to the site address (site.config.json) or to the
// template below, and commit what it changes in the same push: GitHub fails the check otherwise.
// Staff edits through /admin (content/, assets/uploads/) never need it.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { dirname, join, posix } from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { TOPICS, topicFile } from '../js/core/site.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const config = JSON.parse(readFileSync(join(ROOT, 'site.config.json'), 'utf8'))
const SITE = config.url.replace(/\/?$/, '/')
const LANGS = { badini: 'ku-Arab', sorani: 'ckb', ar: 'ar', en: 'en' }
const DEFAULT = 'ar'
const catalogue = Object.fromEntries(await Promise.all(Object.keys(LANGS).map(async (id) => [id, (await import(`../locales/${id}.js`)).default])))
const ar = catalogue[DEFAULT]
const esc = (value) => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// ---- page list ---------------------------------------------------------------------------
// module: file in /js/pages · css: extra stylesheets after the shared ones · draft: not indexed yet
const knowledge = (file, page, title) => ({ file, module: 'knowledge', css: ['content'], attrs: { page }, title, draft: true })
const PAGES = [
  { file: 'index.html', module: 'home', css: ['home'], attrs: { page: 'home' }, title: '', home: true },
  { file: 'portal.html', module: 'portal', css: ['content', 'portal'], attrs: { page: 'portal' }, title: ar['page.services'] },
  { file: 'account.html', module: 'account', css: ['content', 'account'], attrs: { page: 'account' }, title: ar['page.account'], private: true },
  { file: 'history.html', module: 'history', css: ['content', 'history'], attrs: { page: 'history' }, title: ar['page.history'], draft: true },
  knowledge('knowledge.html', 'catalog', ar['page.knowledge']),
  knowledge('how-it-works.html', 'how', ar['page.how']),
  knowledge('safety-guide.html', 'safety', ar['page.safety']),
  knowledge('equipment.html', 'equipment', ar['page.equipment']),
  knowledge('training.html', 'training', ar['page.training']),
  knowledge('glossary.html', 'glossary', ar['page.glossary']),
  knowledge('sources.html', 'sources', ar['page.sources']),
  knowledge('updates.html', 'updates', ar['page.updates']),
  knowledge('service-status.html', 'status', ar['page.status']),
  knowledge('privacy-accessibility.html', 'privacy', ar['page.privacy']),
  ...TOPICS.map((topic) => ({ ...knowledge(topicFile(topic.id), 'topic', ar[`topic.${topic.id}`]), attrs: { page: 'topic', topic: topic.id } })),
]

// ---- helpers -----------------------------------------------------------------------------

/** Every module a page needs, found by following static imports — used for <link rel="modulepreload">. */
function moduleGraph(entry) {
  const seen = new Set()
  const visit = (file) => {
    if (seen.has(file)) return
    seen.add(file)
    const source = readFileSync(join(ROOT, file), 'utf8')
    for (const match of source.matchAll(/^import\s[^'"]*['"](\.{1,2}\/[^'"]+)['"]/gm)) visit(posix.normalize(posix.join(posix.dirname(file), match[1])))
  }
  visit(entry)
  seen.delete(entry)
  return [...seen].sort()
}

/** The default language lives at the bare address (the canonical one); the others add ?lang=. */
const langUrl = (url, id) => (id === DEFAULT ? url : `${url}?lang=${id}`)

const SHARED_CSS = ['tokens', 'base', 'shell']

function seo(page, title, description) {
  const url = SITE + (page.home ? '' : page.file)
  const robots = page.private || (page.draft && config.draftContent) ? '<meta name="robots" content="noindex,nofollow">' : ''
  const organisation = page.home
    ? `<script type="application/ld+json">${JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'GovernmentOrganization',
        name: `${ar['site.brand']} — ${ar['site.governorate']}`,
        alternateName: [`${catalogue.en['site.brand']} — ${catalogue.en['site.governorate']}`, `${catalogue.badini['site.brand']} — ${catalogue.badini['site.governorate']}`],
        url: SITE,
        logo: SITE + 'assets/brand/logo.png',
        areaServed: { '@type': 'AdministrativeArea', name: 'Duhok Governorate, Kurdistan Region, Iraq' },
        contactPoint: { '@type': 'ContactPoint', telephone: '115', contactType: 'emergency' },
      })}</script>`
    : ''
  return [
    `<meta name="description" content="${esc(description)}">`,
    robots,
    // the canonical link is added by js/boot.js, per language (see there)
    ...Object.entries(LANGS).map(([id, tag]) => `<link rel="alternate" hreflang="${tag}" href="${langUrl(url, id)}">`),
    `<link rel="alternate" hreflang="x-default" href="${url}">`,
    '<meta property="og:type" content="website">',
    `<meta property="og:site_name" content="${esc(ar['site.name'])}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${SITE}assets/brand/logo.png">`,
    '<meta property="og:locale" content="ar_IQ">',
    '<meta name="twitter:card" content="summary">',
    organisation,
  ].filter(Boolean).join('\n')
}

const noscript = () => `<noscript><p class="noscript">${Object.keys(LANGS).map((id) => `<span lang="${LANGS[id]}" dir="${id === 'en' ? 'ltr' : 'rtl'}">${esc(catalogue[id]['error.noscript'])}</span>`).join(' ')} <a href="tel:115">115</a></p></noscript>`

function pageHtml(page) {
  if (!page.home && !page.title) throw new Error(`${page.file}: no title (is the page.* key missing from locales/ar.js?)`)
  const title = page.title ? `${page.title} — ${ar['site.name']}` : `${ar['site.brand']} — ${ar['site.governorate']}`
  const entry = `js/pages/${page.module}.js`
  const attrs = Object.entries(page.attrs).map(([key, value]) => ` data-${key}="${value}"`).join('')
  return `<!doctype html>
<html lang="${LANGS[DEFAULT]}" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="generator" content="tools/build.mjs">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
${seo(page, title, ar['meta.description'])}
<meta name="theme-color" content="#faf8f4">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="assets/brand/icon-192.png" type="image/png">
<link rel="apple-touch-icon" href="assets/brand/apple-touch-icon.png">
<script src="js/boot.js"></script>
${[...SHARED_CSS, ...page.css].map((name) => `<link rel="stylesheet" href="css/${name}.css">`).join('\n')}
${moduleGraph(entry).map((file) => `<link rel="modulepreload" href="${file}">`).join('\n')}
<script type="module" src="${entry}"></script>
</head>
<body${attrs}>
<a class="skip" href="#main"></a>
<div class="page">
<header class="site-header" id="site-header"></header>
<main id="main"></main>
<footer class="site-footer" id="site-footer"></footer>
</div>
${noscript()}
</body>
</html>
`
}

/** 404.html and offline.html: no scripts to load, all four languages on one page, absolute asset paths. */
function errorHtml(kind) {
  const base = new URL(SITE).pathname
  const section = (id) => `<section lang="${LANGS[id]}" dir="${id === 'en' ? 'ltr' : 'rtl'}" data-lang="${id}">
<h1>${esc(catalogue[id][`error.${kind}.title`])}</h1>
<p>${esc(catalogue[id][`error.${kind}.text`])}</p>
<div class="actions"><a class="call" href="tel:115"><b dir="ltr">115</b> ${esc(catalogue[id]['error.call'])}</a><a class="home" href="${base}index.html?lang=${id}">${esc(catalogue[id]['error.home'])}</a></div>
</section>`
  return `<!doctype html>
<html lang="${LANGS[DEFAULT]}" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="generator" content="tools/build.mjs">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${esc(ar[`error.${kind}.title`])} — ${esc(ar['site.name'])}</title>
<meta name="theme-color" content="#c70026">
<link rel="icon" href="${base}assets/brand/icon-192.png" type="image/png">
<style>
:root{--red:#c70026;--ink:#16191c;--muted:#56616b;--bg:#faf8f4;--card:#fff;--line:#ebe6e0}
@media (prefers-color-scheme:dark){:root{--ink:#e8eef4;--muted:#b7c7d2;--bg:#0f1b22;--card:#1a2d38;--line:#354a56}}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;background:var(--bg);color:var(--ink);font-family:system-ui,"Segoe UI",Tahoma,sans-serif;padding:24px 16px}
main{width:min(720px,100%);background:var(--card);border:1px solid var(--line);border-top:4px solid var(--red);border-radius:18px;padding:28px clamp(18px,4vw,36px)}
.logo{display:block;width:84px;height:84px;margin:0 auto 8px}
section{padding:16px 0;border-top:1px solid var(--line)}
section:first-of-type{border-top:0}
h1{font-size:20px;margin:0 0 6px}
p{margin:0 0 12px;color:var(--muted);line-height:1.9}
.actions{display:flex;flex-wrap:wrap;gap:10px}
a{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:8px 18px;border-radius:12px;font-weight:700;text-decoration:none}
.call{background:var(--red);color:#fff}
.call b{font-size:20px}
.home{border:1px solid var(--line);color:var(--ink)}
a:focus-visible{outline:3px solid #ffcc75;outline-offset:2px}
</style>
</head>
<body>
<main>
<img class="logo" src="${base}assets/brand/icon-192.png" alt="" width="84" height="84">
${Object.keys(LANGS).map(section).join('\n')}
</main>
<script>
// Show the visitor's language first.
(function () {
  var wanted = new URLSearchParams(location.search).get('lang');
  try { wanted = wanted || localStorage.getItem('cd-language'); } catch (e) {}
  var section = document.querySelector('section[data-lang="' + wanted + '"]');
  if (!section) return;
  section.parentNode.insertBefore(section, document.querySelector('section'));
  document.documentElement.lang = section.lang;
  document.documentElement.dir = section.dir;
  document.title = section.querySelector('h1').textContent;
})();
</script>
</body>
</html>
`
}

// ---- write -------------------------------------------------------------------------------

/** Writes a file only when its content changed, and retries when Windows briefly locks it
    (a preview server or a virus scanner reading the same file). */
let written = 0
function write(name, content) {
  const file = join(ROOT, name)
  if (existsSync(file) && readFileSync(file, 'utf8') === content) return
  for (let attempt = 1; ; attempt++) {
    try {
      writeFileSync(file, content)
      written++
      return
    } catch (error) {
      if (attempt === 6) throw error
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 150 * attempt)
    }
  }
}

for (const page of PAGES) write(page.file, pageHtml(page))
write('404.html', errorHtml('notFound'))
write('offline.html', errorHtml('offline'))

const indexable = PAGES.filter((page) => !page.private && !(page.draft && config.draftContent))
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${indexable.map((page) => {
  const url = SITE + (page.home ? '' : page.file)
  return `<url><loc>${url}</loc>${Object.entries(LANGS).map(([id, tag]) => `<xhtml:link rel="alternate" hreflang="${tag}" href="${langUrl(url, id)}"/>`).join('')}</url>`
}).join('\n')}
</urlset>
`)
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /tools/\nSitemap: ${SITE}sitemap.xml\n`)

// The offline cache is named after a fingerprint of everything a visitor can load (pages, code,
// texts, styles, fonts, design images). Any change gives sw.js new bytes, the browser installs the
// new worker, and it drops the old cache: a visitor never mixes two versions of the site offline.
// Staff edits (content/, assets/uploads/) do not change it; they are always fetched fresh online.
{
  const files = []
  const walk = (dir) => readdirSync(join(ROOT, dir), { withFileTypes: true }).forEach((entry) => {
    const path = posix.join(dir, entry.name)
    if (entry.isDirectory()) walk(path)
    else files.push(path)
  })
  for (const dir of ['css', 'js', 'locales', 'data', 'fonts', 'assets/brand', 'assets/photos']) walk(dir)
  // only the pages this tool writes (a search-engine ownership file in the root must not change it)
  files.push(...PAGES.map((page) => page.file), '404.html', 'offline.html', 'manifest.webmanifest')
  const hash = createHash('sha256')
  for (const file of files.sort()) {
    const bytes = readFileSync(join(ROOT, file))
    // text files are hashed with LF line endings, so Windows and the Linux CI agree
    hash.update(file).update(/\.(woff2|webp|png|jpe?g)$/.test(file) ? bytes : bytes.toString('utf8').replace(/\r\n/g, '\n'))
  }
  const worker = readFileSync(join(ROOT, 'sw.js'), 'utf8')
  const line = /^const VERSION = '[^']*';$/m
  if (!line.test(worker)) throw new Error("sw.js: the line const VERSION = '…'; is missing")
  write('sw.js', worker.replace(line, `const VERSION = 'cd-${hash.digest('hex').slice(0, 12)}';`))
}

// Pages on disk that this tool does not know about would silently go stale.
const known = new Set([...PAGES.map((page) => page.file), '404.html', 'offline.html'])
const strays = readdirSync(ROOT).filter((file) => file.endsWith('.html') && !known.has(file) && !/^google[0-9a-f]{16}\.html$/.test(file))
if (strays.length) console.warn(`! HTML files not generated by this tool: ${strays.join(', ')}`)
for (const page of PAGES) for (const name of [...SHARED_CSS, ...page.css]) if (!existsSync(join(ROOT, 'css', `${name}.css`))) console.warn(`! ${page.file}: css/${name}.css does not exist`)

console.log(`Built ${PAGES.length} pages + 404.html, offline.html, sitemap.xml (${indexable.length} indexed), robots.txt for ${SITE} — ${written} file(s) changed`)
