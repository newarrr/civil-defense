import { normalizeSearch, LOCALES } from './i18n.mjs';
import { DIMENSIONS, taxonomy, validateTags } from './taxonomy.mjs';
import { publicSnapshot } from './publication.mjs';

// Configurable synonym groups, isolated by dialect. Expansion does not translate content.
export const synonyms = Object.freeze({
  ar: [['حريق', 'حريق منزلي', 'حرائق', 'نار'], ['فيضان', 'فيضانات', 'سيول']],
  badini: [['ئاگر', 'ئاگری', 'ئاگرێ'], ['ئاڤ', 'ئاو']],
  sorani: [['ئاگر', 'ئاگری'], ['لافاو', 'سیلاب']],
  en: [['fire', 'fires', 'firefighting'], ['flood', 'floods', 'flooding']]
});

export function searchRecords(records, { locale = 'ar', query = '', filters = {}, limit = 20, offset = 0, catalog = taxonomy, synonymCatalog = synonyms } = {}) {
  if (!LOCALES.includes(locale) || typeof query !== 'string' || query.length > 200 || !Number.isSafeInteger(limit) || limit < 1 || limit > 100 || !Number.isSafeInteger(offset) || offset < 0) throw new TypeError('Invalid search request');
  validateTags(filters, catalog);
  const tokens = normalizeSearch(query).split(' ').filter(Boolean);
  const groups = (synonymCatalog[locale] ?? []).map(group => group.map(normalizeSearch));
  const alternatives = tokens.map(token => [...new Set([token, ...groups.filter(group => group.includes(token)).flat()])]);
  const matches = records.map(record => {
    const text = record.translations?.[locale];
    if (!text) return null;
    const title = normalizeSearch(text.title ?? ''), haystack = normalizeSearch([text.title, text.summary, text.body].filter(Boolean).join(' '));
    if (alternatives.some(group => !group.some(word => haystack.includes(word)))) return null;
    const score = tokens.reduce((sum, token) => sum + (title === token ? 5 : title.includes(token) ? 3 : haystack.includes(token) ? 1 : 0), 0);
    return { record, score };
  }).filter(Boolean);
  // OR within an axis, AND across axes; unknown values fail instead of widening results.
  const selected = (record, except) => DIMENSIONS.every(d => d === except || !(filters[d]?.length) || filters[d].some(id => record.tags?.[d]?.includes(id)));
  const facets = Object.fromEntries(DIMENSIONS.map(d => [d, catalog[d].map(term => ({ id: term.id, count: matches.filter(({ record }) => selected(record, d) && record.tags?.[d]?.includes(term.id)).length }))]));
  const ordered = matches.filter(({ record }) => selected(record)).sort((a, b) => b.score - a.score || a.record.id.localeCompare(b.record.id, 'en'));
  return { total: ordered.length, offset, limit, facets, items: ordered.slice(offset, offset + limit).map(({ record, score }) => ({ ...record, score })) };
}

// The public caller cannot opt into draft visibility; review tooling imports searchRecords explicitly.
export function searchPublished(items, sources, options) {
  const locale = options?.locale ?? 'ar';
  const snapshot = publicSnapshot(items, sources, locale, options);
  return searchRecords(snapshot.map(item => ({ ...item, translations: { [locale]: { title: item.title, summary: item.summary, body: item.body } } })), { ...options, locale });
}
