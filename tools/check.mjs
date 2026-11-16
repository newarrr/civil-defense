// Site health check. Runs on GitHub after every change (see .github/workflows/check.yml)
// and locally with:   node tools/check.mjs
//
// It fails (exit 1) with a readable list in Arabic + English when something would break the site
// or let it rot:
//   1. content edited in /admin is malformed
//   2. a language file is missing a key, has an extra one, or a text nobody uses
//   3. the code asks for a text that does not exist
//   4. a file is referenced but missing — or exists but nothing uses it (dead file),
//      a stray file sits in the site root, or a stylesheet styles something no code writes
//   5. a script has a syntax error
//   6. a page loads a font, script or stylesheet from another website
import { existsSync as existsOnDisk, readFileSync, readdirSync, statSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, join, posix, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { embedVideo } from '../js/core/video.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
process.chdir(ROOT)
const LANGS = ['ar', 'badini', 'sorani', 'en']

const errors = []
const warnings = []
const err = (ar, en) => errors.push(`✗ ${ar}\n  ${en}`)
const warn = (ar, en) => warnings.push(`! ${ar}\n  ${en}`)

/** Like fs.existsSync, but exact about upper and lower case: GitHub Pages is case-sensitive,
    Windows is not, so a file that opens here can still be a 404 on the live site. */
const listings = new Map()
function existsSync(path) {
  if (/^([a-zA-Z]:|\/)/.test(String(path))) return false // only paths inside the site are meaningful here
  let dir = '.'
  for (const part of posix.normalize(String(path)).split('/')) {
    if (part === '' || part === '.') continue
    if (part === '..') { dir = posix.join(dir, '..'); continue }
    if (!listings.has(dir)) listings.set(dir, existsOnDisk(dir) && statSync(dir).isDirectory() ? new Set(readdirSync(dir)) : new Set())
    if (!listings.get(dir).has(part)) return false
    dir = posix.join(dir, part)
  }
  return true
}

const walk = (dir) => (existsSync(dir) ? readdirSync(dir).flatMap((name) => {
  const path = posix.join(dir, name)
  return statSync(path).isDirectory() ? walk(path) : [path]
}) : [])
const read = (file) => readFileSync(file, 'utf8')
const readJson = (file) => {
  try {
    return JSON.parse(read(file))
  } catch (e) {
    err(`الملف ${file} تالف ولا يمكن قراءته`, `${file} is not valid JSON: ${e.message}`)
    return null
  }
}

// ───────────────────────────────────────────── 1. content from /admin
{
  // Same rules as js/core/cms.js (safeImage, safeHttps, safeLink): what fails here is not shown on the site.
  const HTTPS = /^https:\/\/[^\s\x00-\x1f"<>\\`]+$/
  // Only raster images uploaded through /admin (with or without a leading "/").
  const checkImage = (where, p) => {
    if (!p) return
    const local = /^\/?(assets\/uploads\/[^\x00-\x1f"<>\\]+)$/.exec(String(p))?.[1]
    if (local && !/\.(webp|png|jpe?g|gif|avif)$/i.test(local)) err(`${where}: نوع الصورة لا يُعرض «${p}» (المسموح: webp أو png أو jpg أو gif أو avif)`, `${where}: image type is not shown "${p}" (allowed: webp, png, jpg, gif, avif)`)
    else if (/^https?:\/\//.test(p)) err(`${where}: صورة من موقع خارجي لا تظهر «${p}» — ارفعها من جهازك في لوحة الإدارة`, `${where}: external image "${p}" is not shown — upload the file in /admin instead`)
    else if (!local) err(`${where}: مسار الصورة غير صالح «${p}»`, `${where}: invalid image path "${p}"`)
    else if (!existsSync(local)) err(`${where}: الصورة غير موجودة «${p}»`, `${where}: image file missing "${p}"`)
  }
  const isDate = (d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d) && !Number.isNaN(Date.parse(d))

  const news = readJson('content/news.json')
  if (news && !Array.isArray(news.items)) err('ملف الأخبار يجب أن يحتوي قائمة items', 'content/news.json must contain an "items" list')
  const slugs = new Set()
  for (const [i, n] of (news?.items || []).entries()) {
    const where = `الخبر ${i + 1} / news #${i + 1}`
    if (!n || typeof n !== 'object') { err(`${where}: بيانات فارغة`, `${where}: empty entry`); continue }
    if (!/^[a-z0-9-]+$/.test(n.slug || '')) err(`${where}: معرّف الرابط يجب أن يكون حروفًا إنجليزية صغيرة وأرقامًا وشرطات`, `${where}: slug must be lowercase a-z, 0-9 and dashes`)
    else if (slugs.has(n.slug)) err(`${where}: معرّف الرابط «${n.slug}» مكرر`, `${where}: duplicate slug "${n.slug}"`)
    slugs.add(n.slug)
    if (!n.ar?.title) err(`${where}: العنوان العربي مطلوب`, `${where}: Arabic title is required`)
    if (!isDate(n.date)) err(`${where}: التاريخ غير صالح`, `${where}: invalid date`)
    checkImage(where, n.image)
    for (const g of n.gallery || []) checkImage(where, g)
    // same parser as the site (js/core/video.js): a link it cannot play is not shown
    if (n.video && !embedVideo(n.video)) err(`${where}: رابط الفيديو لا يعمل ولن يظهر «${n.video}» (المطلوب رابط فيديو واحد من YouTube أو Vimeo يبدأ بـ https://)`, `${where}: video link cannot play and will not show "${n.video}" (use one YouTube or Vimeo video link starting with https://)`)
    for (const l of ['badini', 'sorani', 'en']) if (n.published !== false && !n[l]?.title) warn(`${where}: لا توجد ترجمة (${l})؛ سيظهر النص العربي`, `${where}: no ${l} translation; Arabic will be shown`)
  }

  const alerts = readJson('content/alerts.json')
  for (const [i, a] of (alerts?.items || []).entries()) {
    const where = `التنبيه ${i + 1} / alert #${i + 1}`
    if (!a?.ar?.title || !a?.ar?.message) err(`${where}: العنوان والرسالة بالعربية مطلوبان`, `${where}: Arabic title and message are required`)
    if (!['advisory', 'watch', 'warning'].includes(a?.level)) err(`${where}: المستوى غير صالح`, `${where}: invalid level`)
    if (a?.expires && Number.isNaN(Date.parse(a.expires))) err(`${where}: وقت الانتهاء غير صالح`, `${where}: invalid expiry time`)
    if (a?.active !== false && a?.expires && Date.parse(a.expires) < Date.now()) warn(`${where}: انتهى وقته ولم يعد يظهر؛ يمكن حذفه`, `${where}: expired and hidden; can be deleted`)
  }

  const menu = readJson('content/menu.json')
  for (const [i, l] of (menu?.links || []).entries()) {
    const where = `رابط القائمة ${i + 1} / menu link #${i + 1}`
    if (!['about', 'services', 'safety', 'sources', 'contact'].includes(l?.group)) err(`${where}: القائمة غير صالحة`, `${where}: invalid group`)
    if (!l?.ar) err(`${where}: العنوان العربي مطلوب`, `${where}: Arabic label is required`)
    // Same rule as safeLink() in js/core/cms.js: a link that fails here is not shown on the site.
    const url = String(l?.url || '')
    const page = /^([a-z0-9-]+\.html)(?:[?#][^\s\x00-\x1f"'<>\\`]*)?$/.exec(url)?.[1]
    if (page && !existsSync(page)) err(`${where}: الصفحة «${page}» غير موجودة`, `${where}: page "${page}" does not exist`)
    if (!page && !/^tel:\+?[0-9]{2,15}$/.test(url) && !HTTPS.test(url)) err(`${where}: الرابط غير صالح ولن يظهر «${url}» (المسموح: صفحة من الموقع، أو https://، أو tel:115)`, `${where}: invalid link, it will not be shown "${url}" (allowed: a site page, https://…, tel:…)`)
  }

  const stats = readJson('content/stats.json')
  for (const k of ['responseRate', 'beneficiaries', 'centerCount', 'staff', 'rescueCount'])
    if (stats?.[k]?.approved && !stats[k].value) err(`الإحصائية ${k}: مفعّلة كمعتمدة بدون رقم`, `stat ${k}: approved but has no value`)

  const centers = readJson('content/centers.json')
  for (const [i, c] of (centers?.items || []).entries()) {
    const where = `المركز ${i + 1} / center #${i + 1}`
    if (!c?.ar?.name || !c?.ar?.district) err(`${where}: الاسم والقضاء بالعربية مطلوبان`, `${where}: Arabic name and district are required`)
    if (c?.phone && !/^[+0-9 ]{3,20}$/.test(c.phone)) err(`${where}: رقم الهاتف غير صالح`, `${where}: invalid phone`)
    if (c?.map && !HTTPS.test(c.map)) err(`${where}: رابط الخريطة غير صالح ولن يظهر «${c.map}» (يجب أن يبدأ بـ https:// وبلا مسافات)`, `${where}: map link is invalid and will not show "${c.map}" (must start with https://, no spaces)`)
  }
  // Uploads the site never shows (and that could be a document such as SVG or HTML).
  for (const file of walk('assets/uploads')) if (!/\.(webp|png|jpe?g|gif|avif)$/i.test(file) && !file.endsWith('.gitkeep')) warn(`ملف مرفوع لا يعرضه الموقع «${file}» — الصور فقط (webp/png/jpg/gif/avif)`, `uploaded file "${file}" is never shown — only raster images are`)
  readJson('manifest.webmanifest')
  readJson('site.config.json')
}

// ───────────────────────────────────────────── 5. syntax (first: later checks import these files)
const scripts = [...walk('js'), ...walk('locales'), ...walk('data'), ...walk('tools'), 'sw.js'].filter((f) => /\.m?js$/.test(f))
for (const file of scripts) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' })
  } catch (e) {
    err(`خطأ برمجي في ${file}`, `syntax error in ${file}: ${String(e.stderr).split('\n').slice(0, 3).join(' ')}`)
  }
}

// Every static import must be relative (the site lives under /civil-defense/, so "/js/…" would 404)
// and name an existing file, exactly as spelled (browsers do not guess).
for (const file of scripts.filter((f) => f.startsWith('js/') || f.startsWith('data/'))) {
  // import … from '…' / export … from '…' / import '…' — one statement per line, as in this code base
  for (const match of read(file).matchAll(/^(?:import|export)\s[^'"\n;]*?\bfrom\s*['"]([^'"\n]+)['"]|^import\s*['"]([^'"\n]+)['"]/gm)) {
    match[1] ??= match[2]
    if (!/^\.{1,2}\//.test(match[1])) {
      err(`${file} يستورد «${match[1]}» بمسار غير نسبي — استعمل ./ أو ../`, `${file} imports "${match[1]}" with a non-relative path — use ./ or ../ (the site is served under a sub-path)`)
      continue
    }
    const target = posix.normalize(posix.join(posix.dirname(file), match[1]))
    if (!existsSync(target)) err(`${file} يستورد ملفًا غير موجود «${match[1]}»`, `${file} imports a file that does not exist (check upper/lower case): "${match[1]}"`)
  }
}

// ───────────────────────────────────────────── 2. language files
const load = async (file) => (await import(`../${file}`)).default
const shape = (value, path = '') => {
  if (Array.isArray(value)) return value.flatMap((item, i) => shape(item, `${path}[${i}]`))
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([key, item]) => shape(item, path ? `${path}.${key}` : key))
  return [path]
}
const placeholders = (text) => (String(text).match(/\{\w+\}/g) || []).sort().join(',')

/** Same keys, same placeholders, nothing empty — across the four language files of one folder. */
async function compare(folder, allowEmpty = () => false) {
  const bundles = {}
  for (const id of LANGS) {
    try { bundles[id] = await load(`${folder}/${id}.js`) } catch (e) { err(`تعذر تحميل ${folder}/${id}.js`, `cannot load ${folder}/${id}.js: ${e.message}`) }
  }
  if (Object.keys(bundles).length !== LANGS.length) return null
  const reference = shape(bundles.ar)
  const get = (object, path) => path.split(/\.(?![^[]*\])|(?=\[)/).reduce((o, part) => (o == null ? o : o[part.replace(/^\[(\d+)\]$/, '$1')]), object)
  for (const id of LANGS) {
    const own = new Set(shape(bundles[id]))
    for (const key of reference) if (!own.has(key)) err(`${folder}/${id}.js ينقصه «${key}»`, `${folder}/${id}.js is missing "${key}"`)
    for (const key of own) if (!reference.includes(key)) err(`${folder}/${id}.js فيه مفتاح زائد «${key}»`, `${folder}/${id}.js has an extra key "${key}"`)
    for (const key of own) {
      const value = folder === 'locales' ? bundles[id][key] : get(bundles[id], key)
      if (typeof value !== 'string' || (!value.trim() && !allowEmpty(id, key))) err(`${folder}/${id}.js: «${key}» فارغ`, `${folder}/${id}.js: "${key}" is empty`)
      else if (reference.includes(key) && placeholders(value) !== placeholders(folder === 'locales' ? bundles.ar[key] : get(bundles.ar, key))) err(`${folder}/${id}.js: «${key}» متغيراته {…} لا تطابق العربية`, `${folder}/${id}.js: "${key}" placeholders differ from Arabic`)
    }
  }
  return bundles
}

const locales = await compare('locales', (id, key) => key === 'site.brandKurdish')
const knowledge = await compare('data/knowledge')
const history = await compare('data/history')

// Badini spelling rules that a machine can hold (the full guide is docs/BADINI.md).
{
  const RULES = [
    [/[ڕۆ]/u, 'يُكتب «ر» و«و» لا «ڕ» و«ۆ»', 'write ر and و, not ڕ or ۆ'],
    [/ڵ/u, '«ڵ» تُكتب في «هاوڵاتی» فقط', 'ڵ is written only in هاوڵاتی', (word) => word.includes('هاوڵاتی')],
    [/ه$/u, 'الهاء الساكنة في آخر الكلمة تُكتب «هـ»', 'a bare final consonant h is written هـ'],
    [/[٠-٩۰-۹]/u, 'الأرقام لاتينية (115)', 'digits are Latin (115)'],
  ]
  const strings = (value) => (typeof value === 'string' ? [value] : Object.values(value ?? {}).flatMap(strings))
  for (const folder of ['locales', 'data/knowledge', 'data/history']) {
    let bundle
    try { bundle = await load(`${folder}/badini.js`) } catch { continue }
    const found = new Set()
    for (const text of strings(bundle)) {
      for (const word of text.split(/[^؀-ۿـ]+/u)) {
        if (!word || /[ء-غف-ي]/u.test(word) && /[ةكيى]/u.test(word)) continue // an Arabic name quoted as is
        for (const [pattern, ar, en, allowed] of RULES) if (pattern.test(word) && !allowed?.(word)) found.add(`«${word}» — ${ar} / ${en}`)
      }
      if (/ب سەلامەت(?!ی)/u.test(text)) found.add('«ب سەلامەت» — «سەلامەت» صفة لا تسبقها «ب» / سەلامەت is an adjective: no ب before it')
    }
    for (const item of found) err(`${folder}/badini.js: ${item}`, `${folder}/badini.js breaks a Badini spelling rule (docs/BADINI.md)`)
  }
}

// Language bundles must describe exactly the topics / references / milestones the code knows about.
{
  const site = await import('../js/core/site.js')
  const k = await import('../data/knowledge/index.js')
  const h = await import('../data/history/index.js')
  const same = (what, a, b) => {
    const A = [...a].sort().join(','), B = [...b].sort().join(',')
    if (A !== B) err(`${what}: القائمتان لا تتطابقان`, `${what}: lists differ → [${A}] vs [${B}]`)
  }
  if (knowledge) {
    same('data/knowledge topics ↔ js/core/site.js TOPICS', Object.keys(knowledge.ar.topics), site.TOPICS.map((t) => t.id))
    same('data/knowledge sources ↔ data/knowledge/index.js SOURCES', Object.keys(knowledge.ar.sources), k.SOURCES.map((s) => s.id))
    same('TOPIC_REFS ↔ TOPICS', Object.keys(k.TOPIC_REFS), site.TOPICS.map((t) => t.id))
    for (const [topic, refs] of Object.entries(k.TOPIC_REFS)) for (const ref of refs) if (!k.SOURCES.some((s) => s.id === ref)) err(`الموضوع ${topic} يستشهد بمرجع غير موجود «${ref}»`, `topic ${topic} cites unknown reference "${ref}"`)
  }
  if (history) {
    same('data/history events ↔ EVENTS', Object.keys(history.ar.events), h.EVENTS.map((e) => e.id))
    same('data/history refs ↔ REFS', Object.keys(history.ar.refs), Object.keys(h.REFS))
    for (const event of h.EVENTS) if (!h.REFS[event.ref]) err(`الحدث ${event.id} يستشهد بمرجع غير موجود`, `event ${event.id} cites unknown reference "${event.ref}"`)
  }
  if (locales) for (const topic of site.TOPICS) if (!locales.ar[`topic.${topic.id}`]) err(`لا يوجد عنوان للموضوع ${topic.id}`, `no title for topic ${topic.id} (locales: topic.${topic.id})`)
  for (const [id, page] of Object.entries(site.PAGES)) {
    const file = page.file.split('#')[0]
    if (!file.startsWith('tel:') && !existsSync(file)) err(`الصفحة «${file}» في خريطة الموقع غير موجودة`, `site map page "${file}" (${id}) does not exist`)
  }
}

// ───────────────────────────────────────────── 3. every text the code asks for exists; none is unused
if (locales) {
  const keys = Object.keys(locales.ar)
  const sources = [...walk('js'), 'tools/build.mjs'].map((file) => [file, read(file)])
  const used = new Set()
  const patterns = []
  const namespaces = new Set(keys.map((key) => key.split('.')[0]))
  for (const [file, source] of sources) {
    // quoted literals that are catalogue keys: t('nav.home'), label: 'page.how', key: 'home.rescue', ar['meta.description']
    for (const match of source.matchAll(/['"]([a-zA-Z][\w-]*(?:\.[\w-]+)+)['"]/g)) {
      if (locales.ar[match[1]] !== undefined) used.add(match[1])
      // a dotted name in a known text namespace that the catalogue lacks: a forgotten translation
      else if (namespaces.has(match[1].split('.')[0]) && !/\.(m?js|css|json|html|webp|png|svg|woff2|xml)$/.test(match[1])) err(`${file} يذكر نصًا غير موجود «${match[1]}»`, `${file} refers to a missing text "${match[1]}"`)
    }
    // literal keys passed to t() that do NOT exist
    for (const match of source.matchAll(/\bt\(\s*'([^']+)'/g)) if (locales.ar[match[1]] === undefined) err(`${file} يطلب نصًا غير موجود «${match[1]}»`, `${file} asks for missing text "${match[1]}"`)
    // template keys: t(`topic.${id}`), catalogue[id][`error.${kind}.title`]
    for (const match of source.matchAll(/`([\w.-]*\$\{[^`]*)`/g)) {
      const template = match[1]
      const fixed = template.replace(/\$\{[^}]*\}/g, '')
      // a template made only of interpolations would match every key and hide unused ones
      if (!/^[\w.${}\s?:'"()[\]=!&|-]+$/.test(template) || /[<\s]/.test(fixed) || !/[A-Za-z]{2}/.test(fixed)) continue
      const pattern = new RegExp('^' + template.replace(/[.*+?^()|[\]\\]/g, '\\$&').replace(/\\?\$\{[^}]*\}/g, '[\\w-]+(?:\\.[\\w-]+)*') + '$')
      if (keys.some((key) => pattern.test(key))) patterns.push(pattern)
    }
  }
  for (const key of keys) if (!used.has(key) && !patterns.some((pattern) => pattern.test(key))) err(`النص «${key}» موجود في ملفات اللغات ولا يستعمله أي كود`, `text "${key}" exists in /locales but no code uses it`)
}

// ───────────────────────────────────────────── 4. missing files and dead files
{
  const TEXT = /\.(html|css|m?js|json|webmanifest|yml|xml)$/
  const owned = [...walk('css'), ...walk('js'), ...walk('locales'), ...walk('data'), ...walk('fonts'), ...walk('assets')].filter((f) => !f.startsWith('assets/uploads/'))
  const roots = [...readdirSync('.').filter((f) => /\.(html|webmanifest)$/.test(f) || f === 'sw.js'), 'admin/index.html', 'admin/config.yml', 'tools/build.mjs']
  const texts = [...new Set([...roots, ...owned.filter((f) => TEXT.test(f))])]
  const referenced = new Set()
  const pathLike = /[\w@./${}-]+\.(?:css|json|m?js|webp|png|jpe?g|gif|avif|ico|svg|woff2?|pdf|html|webmanifest|xml)\b/g
  for (const file of texts) {
    const source = read(file)
    const html = file.endsWith('.html')
    for (const token of source.match(pathLike) || []) {
      // runtime URLs resolve against the page (site root); imports and CSS url() against the file itself
      const candidates = [posix.normalize(token), posix.normalize(posix.join(posix.dirname(file), token))].map((p) => p.replace(/^\.\//, ''))
      for (const candidate of candidates) {
        if (candidate.includes('${') && file === 'tools/build.mjs') continue // the pages it writes name the real files
        if (candidate.includes('${')) {
          const pattern = new RegExp('^' + candidate.replace(/[.*+?^()|[\]\\]/g, '\\$&').replace(/\\?\$\{[^}]*\}/g, '[^/]+') + '$')
          for (const f of owned) if (pattern.test(f)) referenced.add(f)
        } else if (existsSync(candidate) && statSync(candidate).isFile()) referenced.add(candidate)
      }
      // a site file named anywhere (template, stylesheet, worker) must exist, exactly as spelled
      const sitePath = posix.normalize(token).replace(/^(\.\.\/)+/, '')
      if (!token.includes('${') && /^(assets|fonts|css|js|data|locales|content)\//.test(sitePath) && !candidates.some(existsSync)) {
        err(`${file} يذكر ملفًا غير موجود «${token}» (تحقق من حالة الأحرف)`, `${file} names a file that does not exist (check upper/lower case): "${token}"`)
      }
      // a root-absolute site path works on a domain root but 404s under /civil-defense/
      if (/^\/(assets|fonts|css|js|data|locales|content)\//.test(token) && !file.endsWith('.html') && new RegExp(`['"\`(]${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(source)) {
        err(`${file} يذكر «${token}» بمسار يبدأ بـ / — استعمل مسارًا نسبيًا`, `${file} names "${token}" with a root-absolute path — use a relative path (the site is served under a sub-path)`)
      }
      // a local file named in a page must exist
      if (html && !/^(https?:)?\/\//.test(token) && !token.includes('${')) {
        const local = /(?:href|src)="([^"#?]+)/.exec(source.slice(Math.max(0, source.indexOf(token) - 6), source.indexOf(token) + token.length + 1))?.[1]
        if (local && !/^(https?:|tel:|mailto:|data:|\/)/.test(local) && !existsSync(posix.join(posix.dirname(file), local))) err(`الصفحة ${file} تشير إلى ملف غير موجود «${local}»`, `${file} links to missing file "${local}"`)
      }
    }
  }
  for (const file of owned) if (!referenced.has(file) && !/(^|\/)(LICENSE|OFL)[^/]*$|\.md$|\.txt$|\.gitkeep$/.test(file)) err(`ملف غير مستعمل «${file}» — احذفه أو استعمله`, `dead file "${file}" — nothing references it; delete it or use it`)

  // The site root holds pages and a few fixed files only; code lives in its folder.
  const ROOT_FILES = new Set(['sw.js', 'manifest.webmanifest', 'site.config.json', 'package.json', 'robots.txt', 'sitemap.xml', 'README.md', 'CNAME', '.gitignore', '.gitattributes', '.nojekyll'])
  const ROOT_FOLDERS = new Set(['admin', 'assets', 'content', 'css', 'data', 'docs', 'fonts', 'js', 'locales', 'tools', '.git', '.github'])
  for (const name of readdirSync('.')) {
    // Search-engine ownership files (Google, Bing) are allowed as they are.
    if (/^google[0-9a-f]{16}\.html$/.test(name) && /^google-site-verification: google[0-9a-f]{16}\.html\s*$/.test(read(name))) continue
    if (name === 'BingSiteAuth.xml') continue
    if (name.endsWith('.html') && !read(name).includes('<meta name="generator" content="tools/build.mjs">')) {
      err(`«${name}» صفحة في جذر الموقع لم يولّدها tools/build.mjs — احذفها أو أضفها إلى القالب`, `"${name}" is an HTML page in the site root that tools/build.mjs did not generate — delete it or add it to the template`)
      continue
    }
    if (statSync(name).isDirectory() ? ROOT_FOLDERS.has(name) : ROOT_FILES.has(name) || name.endsWith('.html')) continue
    err(`«${name}» في جذر الموقع وليس له مكان في الهيكل — انقله إلى مجلده أو احذفه`, `"${name}" sits in the site root but has no place in the structure — move it to its folder or delete it`)
  }

  // CSS: a class or id that no script or template writes is a dead rule
  const code = [...walk('js'), 'tools/build.mjs'].map(read).join('\n')
  const words = new Set(code.match(/[A-Za-z_][\w-]*/g))
  for (const file of walk('css')) {
    const dead = new Set()
    for (const rule of read(file).replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{};]+)\{/g)) {
      const selector = rule[1].trim()
      if (/^@|^(from|to|\d+%)/.test(selector)) continue
      for (const [, name] of selector.matchAll(/[.#](-?[A-Za-z_][\w-]*)/g)) {
        const modifier = name.lastIndexOf('--')
        if (!words.has(name) && !(modifier > 0 && code.includes(name.slice(0, modifier + 2) + '${'))) dead.add(name)
      }
    }
    if (dead.size) err(`${file} ينسّق عناصر لا يكتبها أي كود: ${[...dead].join('، ')}`, `${file} styles names that no code writes: ${[...dead].join(', ')}`)
  }

  // CSS: every url() target exists
  for (const file of walk('css')) for (const match of read(file).matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
    if (/^(data:|https?:|#)/.test(match[1])) continue
    const target = posix.normalize(posix.join(posix.dirname(file), match[1].split(/[?#]/)[0]))
    if (!existsSync(target)) err(`${file} يشير إلى ملف غير موجود «${match[1]}»`, `${file} points to missing file "${match[1]}"`)
  }
  // No request may leave the site at page load: fonts, scripts, styles, icons, modules.
  // (Links a visitor clicks are fine; /admin is not a public page.)
  const EXTERNAL = [
    /<(?:script|img|iframe|source|audio|video|embed|track|input)\b[^>]*\b(?:src|poster)=["']?(?:https?:)?\/\/[^"'\s>]+|<(?:img|source)\b[^>]*\bsrcset=["'][^"']*(?:https?:)?\/\/[^"'\s>]+/gi,
    /<link\b(?=[^>]*\brel=["']?(?:[\w-]+\s+)*(?:stylesheet|preload|modulepreload|icon|apple-touch-icon|manifest|prefetch|preconnect)\b)[^>]*\bhref=["']?(?:https?:)?\/\/[^"'\s>]+/gi,
    /@import\s+(?:url\()?\s*["']?(?:https?:)?\/\/[^"')\s;]+/gi,
    /(?:\bimport\s*\(|\bfrom)\s*["'`](?:https?:)?\/\/[^"'`\s]+/g,
    /\b(?:fetch|importScripts|sendBeacon|EventSource|WebSocket|Worker|SharedWorker)\s*\(\s*["'`](?:https?:|wss?:)?\/\/[^"'`\s]+|\.src\s*=\s*["'`](?:https?:)?\/\/[^"'`\s]+/g,
  ]
  // url(): any case in CSS; in scripts and pages only a real CSS url( (not new URL(…) or x.url(…))
  const CSS_URL = { css: /url\(\s*["']?(?:https?:)?\/\/[^"')\s]+/gi, other: /(?<![\w$.])url\(\s*["']?(?:https?:)?\/\/[^"')\s]+/g }
  for (const file of [...walk('css'), ...walk('js'), 'sw.js', ...readdirSync('.').filter((f) => f.endsWith('.html'))]) {
    const source = read(file)
    const external = [...EXTERNAL, file.endsWith('.css') ? CSS_URL.css : CSS_URL.other].flatMap((pattern) => source.match(pattern) || [])
    if (external.length) err(`${file} يحمّل ملفًا من موقع خارجي: ${external[0].slice(-70)}`, `${file} loads a resource from another site: ${external[0].slice(-70)}`)
  }
}

// ───────────────────────────────────────────── report
const pages = readdirSync('.').filter((f) => f.endsWith('.html')).length
if (warnings.length) console.log(`\nتنبيهات / Warnings (${warnings.length}):\n` + warnings.join('\n'))
if (errors.length) {
  console.error(`\nأخطاء / Errors (${errors.length}):\n` + errors.join('\n'))
  process.exit(1)
}
console.log(`\n✓ الموقع سليم — ${pages} صفحة، ${locales ? Object.keys(locales.ar).length : 0} نصًا بكل لغة، ${relative('.', ROOT) || '.'} / Site OK.`)
