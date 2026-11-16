import { taxonomy, DIMENSIONS } from './src/taxonomy.mjs';
import { searchRecords } from './src/search.mjs';
import { localeInfo } from './src/i18n.mjs';
// Draft interface copy; Kurdish labels need an independent human review before release.
const l = (ar, badini, sorani, en) => ({ ar, badini, sorani, en });
const copy = {
  brand:l('الدفاع المدني — دهوك','بەرگرییا شارستانی — دهۆک','بەرگری شارستانی — دهۆک','Duhok Civil Defense'),
  skip:l('انتقل للنتائج','بچۆ ئەنجامان','بڕۆ بۆ ئەنجامەکان','Skip to results'),language:l('اللغة','زمان','زمان','Language'),
  eyebrow:l('أساس المنصة • مراجعة محلية','بنەمایێ پلاتفۆرمێ • پێداچوونا ناڤخۆیی','بنەمای پلاتفۆرم • پێداچوونەوەی ناوخۆیی','PLATFORM FOUNDATION · LOCAL REVIEW'),
  title:l('المعرفة مترابطة، والمصدر أولاً.','زانیاری پێکڤە گرێدایین، ژێدەر یەکەمە.','زانیارییەکان پێکەوە بەستراون، سەرچاوە یەکەمە.','Connected knowledge. Sources first.'),
  lead:l('استكشف الموضوعات الحالية عبر الخطر والمرحلة والجمهور والمكان.','بابەتێن نوکە ب مەترسی و قۆناغ و کەس و جهی بگەڕە.','بابەتەکان بە مەترسی و قۆناغ و کەس و شوێن بگەڕێ.','Explore the existing topics by hazard, stage, audience and place.'),
  noticeTitle:l('معاينة مراجعة فقط — لا محتوى معتمداً للنشر هنا','تەنێ پێداچوونە — ناڤەرۆک بۆ بەلاڤکرنێ نەهاتییە پەسەندکرن','تەنها پێداچوونەوە — ناوەڕۆک بۆ بڵاوکردنەوە پەسەند نەکراوە','REVIEW ONLY · No approved publication in this tool'),
  notice:l('الموضوعات من الموقع الحالي. التصنيف والترجمات والمصادر تنتظر المراجعة البشرية. لا حسابات أو بلاغات أو نشر من هذه الواجهة.','بابەت ژ ماڵپەرێ نوکە نە. پۆلکرن و وەرگێڕان و ژێدەر پێدڤی ب پێداچوونا مرۆڤی هەنە. ل ڤێرێ هەژمار و ڕاگەهاندن و بەلاڤکرن نینن.','بابەتەکان لە ماڵپەڕی ئێستان. پۆلکردن و وەرگێڕان و سەرچاوەکان چاوەڕێی پێداچوونەوەی مرۆڤین. لێرە هەژمار و ڕاپۆرت و بڵاوکردنەوە نییە.','Topics are imported from the current site. Classification, translations and sources await human review. This tool has no accounts, incident submission or publishing.'),
  search:l('البحث في الموضوعات','لێگەڕینا بابەتان','گەڕان لە بابەتەکان','Search topics'),hazards:l('الخطر','مەترسی','مەترسی','Hazard'),stages:l('المرحلة','قۆناغ','قۆناغ','Stage'),audiences:l('الجمهور','کەس','کەس','Audience'),places:l('المكان','جهـ','شوێن','Place'),
  reset:l('مسح المرشحات','پاککرنا پاڵاڤان','پاککردنەوەی پاڵاوتنەکان','Clear filters'),all:l('الكل','هەمی','هەموو','All'),results:l('الموضوعات','بابەت','بابەتەکان','Topics'),pending:l('بانتظار المراجعة البشرية','چاڤەڕێیا پێداچوونا مرۆڤی','چاوەڕێی پێداچوونەوەی مرۆڤی','Pending human review'),sources:l('المصادر المرتبطة','ژێدەرێن گرێدای','سەرچاوە بەستراوەکان','Linked sources'),empty:l('لا توجد نتائج تطابق هذه المرشحات. جرّب تغيير أحد الأبعاد.','ئەنجام نینن. پاڵاڤەکێ بگوهۆڕە.','ئەنجام نییە. یەکێک لە پاڵاوتنەکان بگۆڕە.','No matching topics. Try changing one dimension.'),
  footer:l('أداة مراجعة محلية • الرئيسية المنشورة محفوظة دون تغيير','ئامیرێ پێداچوونا ناڤخۆیی • ڕووپەلا سەرەکی نەهاتییە گوهۆڕین','ئامێری پێداچوونەوەی ناوخۆیی • پەڕەی سەرەکی نەگۆڕاوە','Local review tool · Published homepage preserved'),error:l('تعذر تحميل بيانات المراجعة. أعد تشغيل خادم المعاينة المحلي.','زانیاری نەهاتن بارکرن. سێرڤەرێ ناڤخۆیی دووبارە ڤەکە.','زانیارییەکان بار نەکران. سێرڤەری ناوخۆیی دووبارە بکەرەوە.','Review data unavailable. Restart the local preview server.')
};
const el = id => document.getElementById(id);
let data, locale = new URLSearchParams(location.search).get('lang') || 'ar';
try { localeInfo(locale); } catch { locale = 'ar'; }
const text = key => copy[key][locale];
function node(tag, value, className) { const e = document.createElement(tag); if (value !== undefined) e.textContent = value; if (className) e.className = className; return e; }
function labels() {
  const info = localeInfo(locale); document.documentElement.lang = info.lang; document.documentElement.dir = info.dir; document.title = text('brand') + ' · ' + text('eyebrow'); el('locale').value = locale;
  document.querySelectorAll('[data-label]').forEach(e => { e.textContent = text(e.dataset.label); });
  DIMENSIONS.forEach(d => {
    const selected = el(d).value; el(d).replaceChildren(new Option(text('all'), ''), ...taxonomy[d].map(t => new Option(t.labels[locale], t.id))); el(d).value = selected;
  });
}
function render() {
  const filters = Object.fromEntries(DIMENSIONS.map(d => [d, el(d).value ? [el(d).value] : []]));
  const result = searchRecords(data.items, { query: el('query').value, locale, filters, limit: 100 });
  el('count').textContent = `${new Intl.NumberFormat(locale === 'en' ? 'en' : 'ar').format(result.total)} / ${data.items.length}`;
  el('empty').hidden = result.total > 0;
  DIMENSIONS.forEach(d => [...el(d).options].forEach(option => { if (option.value) option.textContent = `${taxonomy[d].find(t => t.id === option.value).labels[locale]} (${result.facets[d].find(f => f.id === option.value).count})`; }));
  el('cards').replaceChildren(...result.items.map(item => {
    const article = node('article'); article.dataset.topic = item.id;
    article.append(node('span', text('pending'), 'badge'), node('h3', item.translations[locale].title), node('p', item.translations[locale].summary));
    const tags = node('ul', undefined, 'tags');
    for (const d of DIMENSIONS) for (const id of item.tags[d]) tags.append(node('li', taxonomy[d].find(t => t.id === id).labels[locale]));
    article.append(tags);
    const details = node('details'); details.append(node('summary', `${text('sources')} (${item.sourceIds.length})`)); const list = node('ul');
    for (const id of item.sourceIds) {
      const s = data.sources.find(source => source.id === id); if (!s) continue;
      const li = node('li'), a = node('a', s.translations[locale].title + ' · ' + s.publisher);
      try { const url = new URL(s.url); if (url.protocol !== 'https:') continue; a.href = url.href; } catch { continue; }
      a.target = '_blank'; a.rel = 'noopener noreferrer'; li.append(a); list.append(li);
    }
    details.append(list); article.append(details); return article;
  }));
  const params = new URLSearchParams({ lang: locale }); if (el('query').value) params.set('q', el('query').value);
  DIMENSIONS.forEach(d => { if (el(d).value) params.set(d, el(d).value); }); history.replaceState(null, '', '?' + params);
}
try {
  const response = await fetch('data.json'); if (!response.ok) throw new Error(); data = await response.json();
  if (data.mode !== 'local-editorial-review-only') throw new Error();
  labels(); const params = new URLSearchParams(location.search); el('query').value = (params.get('q') || '').slice(0, 200);
  DIMENSIONS.forEach(d => { const value = params.get(d); if (taxonomy[d].some(t => t.id === value)) el(d).value = value; });
  render(); el('locale').addEventListener('change', () => { locale = el('locale').value; labels(); render(); });
  el('filters').addEventListener('submit', e => e.preventDefault());
  el('filters').addEventListener('input', render); el('filters').addEventListener('reset', event => { event.preventDefault(); el('query').value = ''; DIMENSIONS.forEach(d => { el(d).value = ''; }); render(); });
} catch { el('error').textContent = text('error'); el('error').hidden = false; el('filters').hidden = true; }
