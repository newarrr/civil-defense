import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSearch, translated, localeInfo, baghdadTime } from '../src/i18n.mjs';
import { taxonomy, validateTags, validateCatalog } from '../src/taxonomy.mjs';
import { sourceIssues, publicationIssues, publicSnapshot } from '../src/publication.mjs';
import { searchRecords, searchPublished } from '../src/search.mjs';
import { content, source, NOW } from './fixtures.mjs';

test('all four locales have explicit language and direction; no silent translation fallback', () => {
  assert.deepEqual(localeInfo('badini'), { locale: 'badini', lang: 'kmr-Arab', dir: 'rtl' });
  assert.equal(localeInfo('sorani').lang, 'ckb'); assert.equal(localeInfo('ar').dir, 'rtl'); assert.equal(localeInfo('en').dir, 'ltr');
  assert.throws(() => localeInfo('ku')); assert.equal(translated({ translations: { ar: {} } }, 'badini'), null);
  assert.equal(baghdadTime('2026-10-16T12:00:00Z'), '16 Oct 2026, 15:00');
  assert.throws(() => baghdadTime('2026-10-16T12:00:00'));
  assert.throws(() => baghdadTime('2026-02-30T12:00:00Z'));
});
test('search normalizes Arabic/Kurdish variants without modifying displayed words', () => {
  assert.equal(normalizeSearch(' حَريقــ كوردی ي '), 'حریق کوردی ی');
  const item = content(); const original = item.translations.badini.title;
  searchRecords([item], { locale: 'badini', query: 'ئاگر' });
  assert.equal(item.translations.badini.title, original);
});
test('catalog supports new terms without changing engine; validates duplicate and unknown IDs', () => {
  const catalog = structuredClone(taxonomy);
  catalog.places.push({ id: 'test-place', labels: { badini: 'test', sorani: 'test', ar: 'test', en: 'test' } });
  assert.equal(validateCatalog(catalog), catalog);
  assert.doesNotThrow(() => validateTags({ places: ['test-place'] }, catalog));
  catalog.places.push(catalog.places[0]); assert.throws(() => validateCatalog(catalog));
  assert.throws(() => validateTags({ stages: ['unknown'] })); assert.throws(() => validateTags({ typo: [] }));
  assert.throws(() => validateTags({ places: ['home', 'home'] }));
});

const records = [content(), content({ id: 'test-school-fire', tags: { hazards: ['home-fire'], stages: ['preparedness'], audiences: ['students'], places: ['school'] } }), content({ id: 'test-flood', tags: { hazards: ['flood'], stages: ['response'], audiences: ['responders'], places: ['water'] }, translations: { en: { title: 'Flood response' }, ar: { title: 'الفيضانات' } } })];
test('each of the four dimensions actually changes results; across dimensions uses intersection', () => {
  assert.equal(searchRecords(records).total, 3);
  assert.equal(searchRecords(records, { filters: { hazards: ['flood'] } }).items[0].id, 'test-flood');
  assert.equal(searchRecords(records, { filters: { stages: ['preparedness'] } }).items[0].id, 'test-school-fire');
  assert.equal(searchRecords(records, { filters: { audiences: ['families'] } }).items[0].id, 'test-home-fire');
  assert.equal(searchRecords(records, { filters: { places: ['water'] } }).items[0].id, 'test-flood');
  assert.equal(searchRecords(records, { filters: { hazards: ['home-fire'], places: ['water'] } }).total, 0);
  assert.equal(searchRecords(records, { filters: { places: ['home', 'school'] } }).total, 2);
  assert.equal(searchRecords(records, { filters: { stages: ['recovery'] } }).total, 0);
});
test('facets count the other active dimensions and search, not the whole catalog', () => {
  const result = searchRecords(records, { locale: 'en', query: 'fire', filters: { places: ['school'] } });
  assert.equal(result.total, 1);
  assert.equal(result.facets.hazards.find(f => f.id === 'home-fire').count, 1);
  assert.equal(result.facets.places.find(f => f.id === 'home').count, 1);
  assert.equal(result.facets.hazards.find(f => f.id === 'flood').count, 0);
});
test('bounded search, deterministic pagination, empty cases, dialect-specific synonyms', () => {
  assert.equal(searchRecords(records, { locale: 'en', query: 'firefighting', limit: 1 }).total, 2);
  assert.equal(searchRecords(records, { locale: 'en', query: 'firefighting', limit: 1, offset: 1 }).items[0].id, 'test-school-fire');
  assert.equal(searchRecords([], { query: 'anything' }).total, 0);
  assert.throws(() => searchRecords(records, { query: 'x'.repeat(201) }));
  assert.throws(() => searchRecords(records, { limit: 0 })); assert.throws(() => searchRecords(records, { offset: -1 }));
  assert.equal(searchRecords(records, { locale: 'badini', query: 'ئاگرێ' }).total, 2);
  assert.equal(searchRecords(records, { locale: 'en', query: '<script>' }).total, 0);
});

test('publication requires independent current human scientific and translation reviews', () => {
  assert.deepEqual(publicationIssues(content(), [source()], 'badini', { now: NOW }), []);
  for (const [field, code] of [['scientificReview', 'scientific-review'], ['localVerification', 'local-verification']]) {
    const item = content({ scope: field === 'localVerification' ? 'duhok' : 'international' });
    item[field] = { ...item.scientificReview, reviewerId: item.authorId };
    assert.ok(publicationIssues(item, [source()], 'en', { now: NOW }).includes(code));
  }
  const stale = content({ revision: 2 });
  assert.ok(publicationIssues(stale, [source()], 'en', { now: NOW }).includes('translation-review'));
  const item = content(); item.translations.badini.review.status = 'pending-human-review';
  assert.ok(publicationIssues(item, [source()], 'badini', { now: NOW }).includes('translation-review'));
  assert.deepEqual(publicationIssues(item, [source()], 'en', { now: NOW }), []);
  assert.throws(() => publicationIssues(content(), [source()], 'en'));
});
test('sources need provenance, verification, expiry and safe URLs; local scope needs local approval', () => {
  for (const patch of [{ url: 'javascript:alert(1)' }, { url: 'https://user:secret@example.org' }, { locator: '' }, { status: 'unverified' }, { expiresAt: '2026-01-01T00:00:00Z' }, { verifiedAt: '2030-01-01T00:00:00Z' }]) assert.ok(sourceIssues({ ...source(), ...patch }, NOW).length);
  const item = content({ scope: 'duhok', localVerification: content().scientificReview });
  assert.ok(publicationIssues(item, [source()], 'ar', { now: NOW }).includes('local-source-missing'));
  assert.deepEqual(publicationIssues(item, [{ ...source(), scope: 'duhok' }], 'ar', { now: NOW }), []);
  assert.ok(publicationIssues(content({ missingFields: ['official-founding-date'] }), [source()], 'ar', { now: NOW }).includes('missing-fields'));
});
test('public export omits drafts, private data, stale reviews, missing languages and hidden relations', () => {
  const item = content({ status: 'published', publishedAt: '2026-10-15T12:00:00Z', approvedBy: 'test-reviewer', approvedAt: '2026-10-15T11:00:00Z', approvedRevision: 1, relatedIds: ['test-secret'] });
  const secret = content({ id: 'test-secret', sensitivity: 'restricted', status: 'published', publishedAt: item.publishedAt });
  const snapshot = publicSnapshot([item, secret, content()], [source()], 'en', { now: NOW });
  assert.equal(snapshot.length, 1); assert.deepEqual(snapshot[0].relatedIds, []);
  assert.equal(snapshot[0].authorId, undefined); assert.equal(snapshot[0].scientificReview, undefined);
  assert.equal(publicSnapshot([item], [source()], 'en', { now: Date.parse('2028-01-01T00:00:00Z') }).length, 0);
  assert.equal(searchPublished([item, secret], [source()], { locale: 'en', query: 'fire', now: NOW }).total, 1);
  assert.equal(publicSnapshot([{ ...item, approvedBy: item.authorId }], [source()], 'en', { now: NOW }).length, 0);
  assert.equal(publicSnapshot([{ ...item, approvedRevision: 0 }], [source()], 'en', { now: NOW }).length, 0);
  delete item.translations.badini; assert.equal(publicSnapshot([item], [source()], 'badini', { now: NOW }).length, 0);
});
