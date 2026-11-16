import { LOCALES } from './i18n.mjs';
export const DIMENSIONS = Object.freeze(['hazards', 'stages', 'audiences', 'places']);
const term = (id, ar, badini, sorani, en) => ({ id, labels: { ar, badini, sorani, en }, languageReview: 'pending-human-review' });
export const taxonomy = Object.freeze({
  version: 1,
  hazards: [
    term('home-fire', 'حرائق المنازل', 'ئاگرێ مالان', 'ئاگری ماڵەکان', 'Home fires'),
    term('wildfire', 'حرائق الغابات', 'ئاگرێ دارستانان', 'ئاگری دارستان', 'Wildfires'),
    term('facility-fire', 'حرائق المنشآت', 'ئاگرێ دامەزراوەیان', 'ئاگری دامەزراوەکان', 'Facility fires'),
    term('flood', 'الفيضانات', 'لاهێز', 'لافاو', 'Floods'),
    term('earthquake', 'الزلازل', 'بومەلەرزە', 'بوومەلەرزە', 'Earthquakes'),
    term('road-collision', 'حوادث المرور', 'ڕوودانێن هاتوچۆیێ', 'ڕووداوەکانی هاتوچۆ', 'Road collisions'),
    term('hazmat', 'المواد الخطرة', 'مادەیێن مەترسیدار', 'ماددە مەترسیدارەکان', 'Hazardous materials'),
    term('electricity', 'الكهرباء', 'کارەبا', 'کارەبا', 'Electricity'),
    term('gas', 'الغاز', 'گاز', 'گاز', 'Gas'),
    term('height', 'السقوط من ارتفاع', 'کەفتن ژ بلندیێ', 'کەوتن لە بەرزایی', 'Falls from height'),
    term('confined-space', 'الأماكن المحصورة', 'جهێن گرتی', 'شوێنە داخراوەکان', 'Confined spaces'),
    term('severe-weather', 'الطقس الشديد', 'کەشوهەوایێ توند', 'کەشوهەوای توند', 'Severe weather')
  ],
  stages: [term('prevention', 'الوقاية', 'پێشگیری', 'پێشگیری', 'Prevention'), term('preparedness', 'الاستعداد', 'ئامادەکاری', 'ئامادەکاری', 'Preparedness'), term('response', 'الاستجابة', 'بەرسڤدان', 'وەڵامدانەوە', 'Response'), term('recovery', 'التعافي', 'ڤەگەڕان', 'چاکبوونەوە', 'Recovery')],
  audiences: [term('public', 'الجمهور', 'هەمی کەس', 'گشتی', 'Public'), term('families', 'الأسر', 'خێزان', 'خێزان', 'Families'), term('responders', 'المستجيبون المختصون', 'تیمێن پسپۆڕ', 'تیمی پسپۆڕ', 'Qualified responders'), term('students', 'الطلبة', 'قوتابی', 'قوتابی', 'Students'), term('facility-managers', 'مسؤولو المنشآت', 'بەرپرسێن دامەزراوەیان', 'بەرپرسانی دامەزراوەکان', 'Facility managers')],
  places: [term('home', 'المنازل', 'مال', 'ماڵ', 'Homes'), term('school', 'المدارس', 'قوتابخانە', 'قوتابخانە', 'Schools'), term('workplace', 'أماكن العمل', 'جهێن کاری', 'شوێنی کار', 'Workplaces'), term('nature', 'الطبيعة', 'سروشت', 'سروشت', 'Natural areas'), term('road', 'الطرق', 'ڕێک', 'ڕێگا', 'Roads'), term('water', 'المسطحات المائية', 'جهێن ئاڤێ', 'شوێنە ئاوییەکان', 'Water environments')]
});

export function validateCatalog(catalog) {
  for (const dimension of DIMENSIONS) {
    if (!Array.isArray(catalog[dimension]) || !catalog[dimension].length) throw new TypeError(`Missing dimension: ${dimension}`);
    const seen = new Set();
    for (const entry of catalog[dimension]) {
      if (!/^[a-z][a-z0-9-]{0,63}$/.test(entry.id) || seen.has(entry.id) || LOCALES.some(l => typeof entry.labels?.[l] !== 'string' || !entry.labels[l].trim())) throw new TypeError(`Invalid taxonomy term: ${dimension}`);
      seen.add(entry.id);
    }
  }
  return catalog;
}

export function validateTags(tags, catalog = taxonomy, { complete = false } = {}) {
  if (!tags || typeof tags !== 'object' || Object.keys(tags).some(d => !DIMENSIONS.includes(d))) throw new TypeError('Unknown taxonomy dimension');
  for (const dimension of DIMENSIONS) {
    const values = tags[dimension] ?? [];
    if (!Array.isArray(values) || (complete && !values.length) || new Set(values).size !== values.length || values.some(id => !catalog[dimension].some(t => t.id === id))) throw new TypeError(`Invalid ${dimension}`);
  }
  return tags;
}
validateCatalog(taxonomy);
