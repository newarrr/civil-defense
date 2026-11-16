// Builds a side-by-side language review sheet (Arabic ↔ one other language) covering every text
// on the site: interface (/locales), knowledge centre and history (/data). Hand the file to a
// native-speaker reviewer; corrections are then typed into the matching /locales or /data file.
//
//     node tools/review.mjs badini            → review-badini.html in the system temp folder (path printed)
//     node tools/review.mjs sorani ../out.html   (keep it outside the repository: everything there is published)
import { writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'

const NAMES = { badini: 'بادینی', sorani: 'سۆرانی', en: 'English', ar: 'العربية' }
const lang = process.argv[2] || 'badini'
if (!NAMES[lang] || lang === 'ar') {
  console.error('Usage: node tools/review.mjs <badini|sorani|en> [output.html]')
  process.exit(1)
}
// Written outside the site by default: anything in the repository folder would be published.
const out = resolve(process.argv[3] || join(tmpdir(), `review-${lang}.html`))
const load = async (folder, id) => (await import(`../${folder}/${id}.js`)).default
const esc = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const flatten = (value, path = '') => {
  if (typeof value === 'string') return [[path, value]]
  if (Array.isArray(value)) return value.flatMap((item, i) => flatten(item, `${path}[${i}]`))
  return Object.entries(value).flatMap(([key, item]) => flatten(item, path ? `${path}.${key}` : key))
}

const SOURCES = [['locales', 'الواجهة / Interface'], ['data/knowledge', 'مركز المعرفة / Knowledge centre'], ['data/history', 'التاريخ / History']]
let total = 0
const sections = []
for (const [folder, title] of SOURCES) {
  const arabic = new Map(flatten(await load(folder, 'ar')))
  const rows = flatten(await load(folder, lang)).filter(([, text]) => text.trim())
  total += rows.length
  sections.push(`<h2>${esc(title)} <small>${folder}/${lang}.js · ${rows.length}</small></h2>
<table><thead><tr><th>#</th><th>العربية</th><th>${NAMES[lang]}</th><th class="note">ملاحظة المراجع</th></tr></thead><tbody>
${rows.map(([key, text], i) => `<tr><td class="n">${i + 1}<code>${esc(key)}</code></td><td lang="ar" dir="rtl">${esc(arabic.get(key) ?? '—').replaceAll('\n', '<br>')}</td><td lang="${lang === 'en' ? 'en' : 'ku-Arab'}" dir="${lang === 'en' ? 'ltr' : 'rtl'}">${esc(text).replaceAll('\n', '<br>')}</td><td class="note"></td></tr>`).join('\n')}
</tbody></table>`)
}

writeFileSync(out, `<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ورقة مراجعة لغوية — ${NAMES[lang]}</title>
<style>
body{font-family:"Segoe UI",Tahoma,sans-serif;margin:24px;color:#16191c;line-height:1.9}
h1{font-size:22px;margin:0 0 4px}h2{font-size:17px;margin:32px 0 8px;border-bottom:2px solid #c70026;padding-bottom:4px}h2 small{font-weight:400;color:#667;font-size:12px}
p{margin:0 0 6px;color:#445}
table{border-collapse:collapse;width:100%;table-layout:fixed}
th,td{border:1px solid #d5d9de;padding:6px 10px;vertical-align:top;text-align:start;font-size:15px;overflow-wrap:anywhere}
th{background:#f3f1ed;position:sticky;top:0}
.n{width:150px;color:#778;font-size:11px}.n code{display:block;direction:ltr;text-align:left;font-size:10px;color:#99a}
th:first-child{width:150px}.note{width:22%}
tr:nth-child(even) td{background:#fbfaf8}
@media print{body{margin:8mm}th{position:static}tr{break-inside:avoid}}
</style></head><body>
<h1>ورقة مراجعة لغوية — ${NAMES[lang]}</h1>
<p>${total} نصًا. العمود الأيمن هو الأصل العربي، والأوسط هو النص المعروض في الموقع. يكتب المراجع تصحيحه في عمود الملاحظة، والرمز الرمادي يدل على مكان النص في ملفات الموقع.</p>
${sections.join('\n')}
</body></html>
`)
console.log(`${total} texts → ${out}`)
