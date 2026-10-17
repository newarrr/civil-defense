// Site health check — runs on GitHub after every change (see .github/workflows/check.yml)
// and locally with:  node tools/check.mjs
// Fails (exit 1) with a readable list in Arabic + English when something would break the site.
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const errors = []
const warnings = []
const err = (ar, en) => errors.push(`✗ ${ar}\n  ${en}`)
const warn = (ar, en) => warnings.push(`! ${ar}\n  ${en}`)

const readJson = (file) => {
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch (e) {
    err(`الملف ${file} تالف ولا يمكن قراءته`, `${file} is not valid JSON: ${e.message}`)
    return null
  }
}
const localAsset = (p) => typeof p === 'string' && /^assets\/uploads\//.test(p)
const checkImage = (where, p) => {
  if (!p) return
  if (!localAsset(p) && !/^https:\/\//.test(p)) err(`${where}: مسار الصورة غير صالح «${p}»`, `${where}: invalid image path "${p}"`)
  else if (localAsset(p) && !existsSync(p)) err(`${where}: الصورة غير موجودة «${p}»`, `${where}: image file missing "${p}"`)
}
const isDate = (d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d) && !Number.isNaN(Date.parse(d))

// ---------- news ----------
const news = readJson('content/news.json')
if (news) {
  if (!Array.isArray(news.items)) err('ملف الأخبار يجب أن يحتوي قائمة items', 'content/news.json must contain an "items" list')
  const seen = new Set()
  for (const [i, n] of (news.items || []).entries()) {
    const where = `الخبر ${i + 1} / news #${i + 1}`
    if (!n || typeof n !== 'object') { err(`${where}: بيانات فارغة`, `${where}: empty entry`); continue }
    if (!/^[a-z0-9-]+$/.test(n.slug || '')) err(`${where}: معرّف الرابط يجب أن يكون حروفًا إنجليزية صغيرة وأرقامًا وشرطات`, `${where}: slug must be lowercase a-z, 0-9 and dashes`)
    else if (seen.has(n.slug)) err(`${where}: معرّف الرابط «${n.slug}» مكرر`, `${where}: duplicate slug "${n.slug}"`)
    seen.add(n.slug)
    if (!n.ar?.title) err(`${where}: العنوان العربي مطلوب`, `${where}: Arabic title is required`)
    if (!isDate(n.date)) err(`${where}: التاريخ غير صالح`, `${where}: invalid date`)
    checkImage(where, n.image)
    for (const g of n.gallery || []) checkImage(where, g)
    if (n.video && !/^https:\/\/(www\.|m\.)?(youtube\.com|youtu\.be|vimeo\.com)\//.test(n.video)) warn(`${where}: رابط الفيديو ليس YouTube أو Vimeo ولن يظهر`, `${where}: video link is not YouTube/Vimeo and will not show`)
    for (const l of ['badini', 'sorani', 'en']) if (n.published !== false && !n[l]?.title) warn(`${where}: لا توجد ترجمة (${l})؛ سيظهر النص العربي`, `${where}: no ${l} translation; Arabic will be shown`)
  }
}

// ---------- alerts ----------
const alerts = readJson('content/alerts.json')
for (const [i, a] of (alerts?.items || []).entries()) {
  const where = `التنبيه ${i + 1} / alert #${i + 1}`
  if (!a?.ar?.title || !a?.ar?.message) err(`${where}: العنوان والرسالة بالعربية مطلوبان`, `${where}: Arabic title and message are required`)
  if (!['advisory', 'watch', 'warning'].includes(a?.level)) err(`${where}: المستوى غير صالح`, `${where}: invalid level`)
  if (a?.expires && Number.isNaN(Date.parse(a.expires))) err(`${where}: وقت الانتهاء غير صالح`, `${where}: invalid expiry time`)
  if (a?.active !== false && a?.expires && Date.parse(a.expires) < Date.now()) warn(`${where}: انتهى وقته ولم يعد يظهر؛ يمكن حذفه`, `${where}: expired and hidden; can be deleted`)
}

// ---------- menu ----------
const menu = readJson('content/menu.json')
const groups = ['about', 'services', 'safety', 'sources', 'contact']
for (const [i, l] of (menu?.links || []).entries()) {
  const where = `رابط القائمة ${i + 1} / menu link #${i + 1}`
  if (!groups.includes(l?.group)) err(`${where}: القائمة غير صالحة`, `${where}: invalid group`)
  if (!l?.ar) err(`${where}: العنوان العربي مطلوب`, `${where}: Arabic label is required`)
  const page = /^([a-z0-9-]+\.html)/.exec(l?.url || '')?.[1]
  if (page && !existsSync(page)) err(`${where}: الصفحة «${page}» غير موجودة`, `${where}: page "${page}" does not exist`)
  if (!page && !/^(https:\/\/|tel:[+0-9]+$)/.test(l?.url || '')) err(`${where}: الرابط غير صالح`, `${where}: invalid link`)
}

// ---------- stats ----------
const stats = readJson('content/stats.json')
for (const k of ['responseRate', 'beneficiaries', 'centerCount', 'staff', 'rescueCount'])
  if (stats?.[k]?.approved && !stats[k].value) err(`الإحصائية ${k}: مفعّلة كمعتمدة بدون رقم`, `stat ${k}: approved but has no value`)

// ---------- centers ----------
const centers = readJson('content/centers.json')
for (const [i, c] of (centers?.items || []).entries()) {
  const where = `المركز ${i + 1} / center #${i + 1}`
  if (!c?.ar?.name || !c?.ar?.district) err(`${where}: الاسم والقضاء بالعربية مطلوبان`, `${where}: Arabic name and district are required`)
  if (c?.phone && !/^[+0-9 ]{3,20}$/.test(c.phone)) err(`${where}: رقم الهاتف غير صالح`, `${where}: invalid phone`)
  if (c?.map && !/^https:\/\//.test(c.map)) err(`${where}: رابط الخريطة يجب أن يبدأ بـ https://`, `${where}: map link must start with https://`)
}

// ---------- pages, scripts, links ----------
const pages = readdirSync('.').filter((f) => f.endsWith('.html'))
for (const f of pages) {
  const html = readFileSync(f, 'utf8')
  for (const m of html.matchAll(/(?:href|src)="([^"#?:]+)(?:[?#][^"]*)?"/g)) {
    const p = m[1]
    if (/^(https?|tel|mailto|data)/.test(p) || p.startsWith('//')) continue
    if (f !== '404.html' && f !== 'offline.html' && !existsSync(p)) err(`الصفحة ${f} تشير إلى ملف غير موجود «${p}»`, `${f} links to missing file "${p}"`)
  }
  if (f !== '404.html' && f !== 'offline.html' && !html.includes('cms-content.js')) err(`الصفحة ${f} لا تحمّل cms-content.js`, `${f} does not load cms-content.js`)
}
for (const f of [...readdirSync('.').filter((x) => x.endsWith('.js')), 'tools/seo.mjs', 'tools/check.mjs']) {
  try {
    execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' })
  } catch (e) {
    err(`خطأ برمجي في ${f}`, `syntax error in ${f}: ${String(e.stderr).split('\n').slice(0, 3).join(' ')}`)
  }
}
for (const f of ['manifest.webmanifest']) readJson(f)

// ---------- report ----------
if (warnings.length) console.log(`\nتنبيهات / Warnings (${warnings.length}):\n` + warnings.join('\n'))
if (errors.length) {
  console.error(`\nأخطاء / Errors (${errors.length}):\n` + errors.join('\n'))
  process.exit(1)
}
console.log(`\n✓ الموقع سليم — ${pages.length} صفحة، ${(news?.items || []).length} خبر. / Site OK.`)
