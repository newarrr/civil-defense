// Knowledge centre — everything that is the same in every language:
// the reference list, which references each topic cites, and the four-language glossary table.
// Text lives in ./<lang>.js; topic ids, categories and icons live in /js/core/site.js.

/** Date the references were last checked and the text last reviewed. */
export const REVIEW_DATE = '2026-10-15'

/** Published references. Titles are translated in ./<lang>.js under `sources`. */
export const SOURCES = [
  { id: 'krg115', publisher: 'Kurdistan Regional Government — DMI', url: 'https://gov.krd/dmi-ar/activities/news-and-press-releases/2025/march/لتعزيز-إجراءات-السلامة-خلال-عيد-الفطر-مديرية-الدفاع-المدني-تصدر-تعليمات-لمواطني-الاقليم-والسياح/', date: '2025-03-29', scope: 'regional-publication', checkedAt: '2026-10-15' },
  { id: 'krgArchive', publisher: 'Kurdistan Regional Government — DMI', url: 'https://gov.krd/dmi-en/publications/news-service/', date: null, scope: 'regional-publication', checkedAt: '2026-10-15' },
  { id: 'call', publisher: 'London Fire Brigade', url: 'https://www.london-fire.gov.uk/safety/calling-999/', date: null, scope: 'international-education', checkedAt: '2026-10-15' },
  { id: 'escape', publisher: 'U.S. Fire Administration', url: 'https://www.usfa.fema.gov/prevention/home-fires/prepare-for-fire/home-fire-escape-plans/index.html', date: null, scope: 'international-education', checkedAt: '2026-10-15' },
  { id: 'alarms', publisher: 'U.S. Fire Administration', url: 'https://www.usfa.fema.gov/prevention/home-fires/prepare-for-fire/smoke-alarms/index.html', date: '2023-05-09', scope: 'international-education', checkedAt: '2026-10-15' },
  { id: 'extinguisher', publisher: 'U.S. Fire Administration', url: 'https://www.usfa.fema.gov/prevention/home-fires/prepare-for-fire/fire-extinguishers/', date: null, scope: 'international-education', checkedAt: '2026-10-15' },
  { id: 'highrise', publisher: 'U.S. Fire Administration', url: 'https://www.usfa.fema.gov/downloads/pdf/publications/high-rise-fire-safety-infographic.pdf', date: null, scope: 'international-education', checkedAt: '2026-10-15' },
  { id: 'forest', publisher: 'U.S. Fire Administration', url: 'https://www.usfa.fema.gov/wui/outreach/wildfire-evacuation.html', date: null, scope: 'international-education', checkedAt: '2026-10-15' },
  { id: 'vehicle', publisher: 'U.S. Fire Administration', url: 'https://www.usfa.fema.gov/prevention/vehicle-fires/', date: null, scope: 'international-education', checkedAt: '2026-10-15' },
  { id: 'confined', publisher: 'Health and Safety Executive (UK)', url: 'https://www.hse.gov.uk/confinedspace/introduction.htm', date: null, scope: 'international-education', checkedAt: '2026-10-15' },
  { id: 'height', publisher: 'Health and Safety Executive (UK)', url: 'https://www.hse.gov.uk/work-at-height/index.htm', date: null, scope: 'international-education', checkedAt: '2026-10-15' },
  { id: 'water', publisher: 'Royal Life Saving Society UK', url: 'https://www.rlss.org.uk/staying-safe-in-on-and-around-the-water', date: '2026-06-17', scope: 'international-education', checkedAt: '2026-10-15' },
  { id: 'flood', publisher: 'UK Government', url: 'https://www.gov.uk/help-during-flood', date: null, scope: 'international-education', checkedAt: '2026-10-15' },
  { id: 'quake', publisher: 'U.S. Geological Survey', url: 'https://www.usgs.gov/faqs/what-do-i-do-after-earthquake', date: null, scope: 'international-education', checkedAt: '2026-10-15' },
  { id: 'gas', publisher: 'National Gas (UK)', url: 'https://www.nationalgas.com/en/node/256', date: null, scope: 'international-education', checkedAt: '2026-10-15' },
  { id: 'chemical', publisher: 'Centers for Disease Control and Prevention', url: 'https://www.cdc.gov/chemical-emergencies/response/', date: null, scope: 'international-education', checkedAt: '2026-10-15' },
  { id: 'weather', publisher: 'U.S. National Weather Service', url: 'https://www.weather.gov/safety', date: null, scope: 'international-education', checkedAt: '2026-10-15' },
  { id: 'ifrc', publisher: 'International Federation of Red Cross and Red Crescent Societies', url: 'https://www.ifrc.org/document/public-awareness-and-public-education-disaster-risk-reduction-key-messages-2nd-edition', date: null, scope: 'international-education', checkedAt: '2026-10-15' },
  { id: 'battery', publisher: 'U.S. Fire Administration', url: 'https://www.usfa.fema.gov/a-z/lithium-ion-batteries/', date: null, scope: 'international-education', checkedAt: '2026-10-15' },
  { id: 'classificationuk', publisher: 'London Fire Brigade', url: 'https://www.london-fire.gov.uk/media/cnyexexn/hand-held-portable-firefighting-equipment-gn08.pdf', date: null, scope: 'international-education', checkedAt: '2026-10-15' },
  { id: 'cooking', publisher: 'U.S. Fire Administration', url: 'https://www.usfa.fema.gov/prevention/home-fires/prevent-fires/cooking/', date: '2026-09-28', scope: 'international-education', checkedAt: '2026-10-15' },
]

/** References cited by each topic page. */
export const TOPIC_REFS = {
  'home-fires': ['escape', 'alarms', 'cooking'],
  'high-rise': ['highrise', 'escape'],
  'facility-fires': ['ifrc', 'extinguisher'],
  'wildfire': ['forest', 'krg115'],
  'road-rescue': ['vehicle', 'ifrc'],
  'height-rescue': ['height', 'ifrc'],
  'confined-spaces': ['confined', 'height'],
  'water-rescue': ['water', 'krg115'],
  'floods': ['flood', 'krgArchive'],
  'earthquakes': ['quake', 'ifrc'],
  'gas': ['gas', 'chemical'],
  'electricity': ['battery', 'flood'],
  'hazardous-materials': ['chemical', 'confined'],
  'severe-weather': ['weather', 'krgArchive'],
  'inspection': ['ifrc', 'krgArchive'],
  'training-support': ['ifrc', 'escape'],
}

/** Glossary rows shown side by side in all four languages. */
export const GLOSSARY = [
  { ar: 'الإخلاء', badini: 'ڤالاکرن', sorani: 'چۆڵکردن', en: 'Evacuation' },
  { ar: 'نقطة التجمع', badini: 'جهێ کومبوونێ', sorani: 'شوێنی کۆبوونەوە', en: 'Assembly point' },
  { ar: 'إنذار الدخان', badini: 'ئاگەهدارکەرێ دووکێلێ', sorani: 'ئاگادارکەرەوەی دووکەڵ', en: 'Smoke alarm' },
  { ar: 'مطفأة حريق', badini: 'ئاگرکوژ', sorani: 'ئاگرکوژێنەر', en: 'Fire extinguisher' },
  { ar: 'تقييم المخاطر', badini: 'هەلسەنگاندنا مەترسیان', sorani: 'هەڵسەنگاندنی مەترسی', en: 'Risk assessment' },
  { ar: 'معدات الوقاية الشخصية', badini: 'ئامیرێن پاراستنا کەسی', sorani: 'ئامێرەکانی پاراستنی کەسی', en: 'Personal protective equipment' },
  { ar: 'حيز محصور', badini: 'جهێ گرتی', sorani: 'شوێنی داخراو', en: 'Confined space' },
  { ar: 'مسودة محلية', badini: 'ڕەشنووسا ناڤخۆیی', sorani: 'ڕەشنووسی ناوخۆیی', en: 'Local draft' },
]
