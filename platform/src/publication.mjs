import { LOCALES, isTimestamp as validTime } from './i18n.mjs';
import { taxonomy, validateTags } from './taxonomy.mjs';
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const independent = (item, id) => typeof id === 'string' && id.length > 0 && ![item.authorId, ...(item.contributorIds ?? [])].includes(id);
const reviewed = (review, item, now) => review?.status === 'approved' && review.revision === item.revision && independent(item, review.reviewerId) && validTime(review.reviewedAt) && validTime(review.expiresAt) && Date.parse(review.reviewedAt) <= now && now < Date.parse(review.expiresAt) && Date.parse(review.reviewedAt) < Date.parse(review.expiresAt);

export function sourceIssues(source, now) {
  if (!Number.isFinite(now)) throw new TypeError('Explicit source review time required');
  const issues = [];
  let url; try { url = new URL(source?.url); } catch { /* rejected below */ }
  if (!url || url.protocol !== 'https:' || url.username || url.password) issues.push('source-url');
  if (![source?.publisher, source?.title, source?.locator].every(nonempty)) issues.push('source-provenance');
  if (source?.status !== 'verified' || !source.verifiedBy || !validTime(source.verifiedAt) || !validTime(source.expiresAt) || Date.parse(source.verifiedAt) > now || now >= Date.parse(source.expiresAt) || Date.parse(source.verifiedAt) >= Date.parse(source.expiresAt)) issues.push('source-review');
  if (!['international', 'iraq', 'duhok'].includes(source?.scope)) issues.push('source-scope');
  return issues;
}

// All reasons are machine-readable; the API must not discard this gate.
export function publicationIssues(item, sources, locale, { now, catalog = taxonomy } = {}) {
  if (!Number.isFinite(now)) throw new TypeError('Explicit review time required');
  const issues = [];
  if (!LOCALES.includes(locale)) return ['unsupported-locale'];
  if (!item || !Number.isSafeInteger(item.revision) || item.revision < 1 || !item.authorId) return ['invalid-content'];
  if (!['international', 'iraq', 'duhok'].includes(item.scope)) issues.push('content-scope');
  if (typeof item.id !== 'string' || !/^[a-z][a-z0-9-]{0,79}$/.test(item.id)) issues.push('content-id');
  try { validateTags(item.tags, catalog, { complete: true }); } catch { issues.push('taxonomy-incomplete'); }
  const text = item.translations?.[locale];
  if (![text?.title, text?.summary, text?.body].every(nonempty)) issues.push('translation-missing');
  if (!reviewed(text?.review, item, now)) issues.push('translation-review');
  if (!reviewed(item.scientificReview, item, now)) issues.push('scientific-review');
  if (['iraq', 'duhok'].includes(item.scope) && !reviewed(item.localVerification, item, now)) issues.push('local-verification');
  if (item.sensitivity !== 'public') issues.push('private-content');
  if (item.missingFields?.length) issues.push('missing-fields');
  if (!Array.isArray(item.sourceIds) || !item.sourceIds.length || new Set(item.sourceIds).size !== item.sourceIds.length) issues.push('sources-missing');
  const byId = new Map((Array.isArray(sources) ? sources : []).map(source => [source.id, source]));
  const sourceIds = Array.isArray(item.sourceIds) ? item.sourceIds : [];
  for (const id of sourceIds) {
    const source = byId.get(id);
    if (!source) issues.push(`source-missing:${id}`);
    else if (sourceIssues(source, now).length || !independent(item, source.verifiedBy)) issues.push(`source-unverified:${id}`);
  }
  if (['iraq', 'duhok'].includes(item.scope) && !sourceIds.some(id => byId.get(id)?.scope === item.scope && !sourceIssues(byId.get(id), now).length)) issues.push('local-source-missing');
  if (item.occurredAt !== null && item.occurredAt !== undefined && !validTime(item.occurredAt)) issues.push('occurred-at');
  return [...new Set(issues)];
}

export function publicSnapshot(items, sources, locale, { now, catalog = taxonomy } = {}) {
  if (!Number.isFinite(now)) throw new TypeError('Explicit publication time required');
  return items.filter(item => item.status === 'published' && item.approvedRevision === item.revision && independent(item, item.approvedBy) && validTime(item.approvedAt) && validTime(item.publishedAt) && Date.parse(item.approvedAt) <= Date.parse(item.publishedAt) && Date.parse(item.publishedAt) <= now && publicationIssues(item, sources, locale, { now, catalog }).length === 0)
    .map(item => ({ id: item.id, revision: item.revision, kind: item.kind, scope: item.scope, tags: structuredClone(item.tags), title: item.translations[locale].title, summary: item.translations[locale].summary, body: item.translations[locale].body, locale, sourceIds: [...item.sourceIds], relatedIds: [...(item.relatedIds ?? [])], occurredAt: item.occurredAt ?? null, publishedAt: item.publishedAt }))
    .map((item, _, all) => ({ ...item, relatedIds: item.relatedIds.filter(id => all.some(other => other.id === id)) }));
}
