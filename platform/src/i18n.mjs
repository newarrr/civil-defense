export const LOCALES = Object.freeze(['badini', 'sorani', 'ar', 'en']);
export function localeInfo(locale) {
  if (!LOCALES.includes(locale)) throw new TypeError('Unsupported locale');
  return { locale, lang: { badini: 'kmr-Arab', sorani: 'ckb', ar: 'ar', en: 'en' }[locale], dir: locale === 'en' ? 'ltr' : 'rtl' };
}

// Search keys only. Never rewrite stored Badini/Sorani text or conflate dialects.
export function normalizeSearch(value) {
  if (typeof value !== 'string') throw new TypeError('Search text must be a string');
  return value.normalize('NFKC').toLocaleLowerCase('en')
    .replace(/[\u064B-\u065F\u0670\u0640]/gu, '')
    .replace(/[يى]/gu, 'ی').replace(/ك/gu, 'ک')
    .replace(/[أإآٱ]/gu, 'ا').replace(/[\u200c\u200d]/gu, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/gu, ' ');
}

export function translated(record, locale) {
  localeInfo(locale);
  // No silent Arabic/English fallback presented as Kurdish.
  const translation = record.translations?.[locale];
  return translation ? { ...translation, ...localeInfo(locale) } : null;
}

export function isTimestamp(value) {
  if (typeof value !== 'string') return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,6})?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match || !Number.isFinite(Date.parse(value))) return false;
  const [, year, month, day, hour, minute, second, zone] = match;
  const days = new Date(Date.UTC(Number(year), Number(month), 0)).getUTCDate();
  return Number(month) >= 1 && Number(month) <= 12 && Number(day) >= 1 && Number(day) <= days && Number(hour) < 24 && Number(minute) < 60 && Number(second) < 60 && (zone === 'Z' || (Number(zone.slice(1, 3)) < 24 && Number(zone.slice(4)) < 60));
}

export function baghdadTime(iso, locale = 'en') {
  localeInfo(locale);
  if (!isTimestamp(iso)) throw new TypeError('An ISO timestamp with timezone is required');
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'ar-IQ', { timeZone: 'Asia/Baghdad', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}
