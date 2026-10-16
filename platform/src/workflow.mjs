import { publicationIssues } from './publication.mjs';
export const ROLES = Object.freeze(['super_admin', 'admin', 'editor', 'reviewer', 'publisher', 'translator', 'subject_expert', 'media_manager', 'auditor']);
export const PERMISSIONS = Object.freeze({
  super_admin: ['read', 'edit', 'submit', 'review', 'approve', 'publish', 'archive', 'manage_staff', 'manage_system'],
  admin: ['read', 'edit', 'submit', 'review', 'approve', 'publish', 'archive', 'manage_staff'],
  editor: ['read', 'edit', 'submit'], reviewer: ['read', 'review', 'approve'], publisher: ['read', 'publish', 'archive'],
  translator: ['read', 'translate'], subject_expert: ['read', 'scientific_review'], media_manager: ['read', 'manage_media'], auditor: ['read', 'read_audit']
});
export class WorkflowError extends Error {
  constructor(code, status, details = []) { super(code); this.code = code; this.status = status; this.details = details; }
}
export function hasPermission(actor, permission) {
  return actor?.active === true && typeof actor.id === 'string' && actor.id.length > 0 && Array.isArray(actor.roles) && actor.roles.length > 0 && actor.roles.every(role => ROLES.includes(role)) && actor.roles.some(role => PERMISSIONS[role].includes(permission));
}

// Domain kernel only. Actor comes from trusted server auth, never a client-supplied role.
// Persistence must lock the row, check version, store result and append audit atomically.
export function transition(item, command, actor, { sources = [], now, locales = [] } = {}) {
  if (!Number.isFinite(now) || !locales.length || locales.some(l => !['badini', 'sorani', 'ar', 'en'].includes(l))) throw new WorkflowError('invalid-context', 400);
  const rules = { submit: ['submit', ['draft'], 'submitted'], start_review: ['review', ['submitted'], 'in_review'], request_changes: ['review', ['submitted', 'in_review'], 'draft'], approve: ['approve', ['in_review'], 'approved'], publish: ['publish', ['approved'], 'published'], archive: ['archive', ['published'], 'archived'] };
  const rule = rules[command?.action];
  if (!rule) throw new WorkflowError('unknown-action', 400);
  if (!hasPermission(actor, rule[0])) throw new WorkflowError('forbidden', 403);
  if (command.expectedVersion !== item.version) throw new WorkflowError('version-conflict', 409);
  if (!rule[1].includes(item.status)) throw new WorkflowError('invalid-transition', 409);
  if (['start_review', 'request_changes', 'approve'].includes(command.action) && [item.authorId, ...(item.contributorIds ?? [])].includes(actor.id)) throw new WorkflowError('self-review', 403);
  if (command.action === 'request_changes' && (typeof command.reason !== 'string' || !command.reason.trim() || command.reason.length > 2000)) throw new WorkflowError('reason-required', 422);
  if (['approve', 'publish'].includes(command.action)) {
    const issues = locales.flatMap(locale => publicationIssues(item, sources, locale, { now }).map(code => `${locale}:${code}`));
    if (issues.length) throw new WorkflowError('publication-blocked', 422, issues);
  }
  if (command.action === 'publish' && (!item.approvedBy || item.approvedRevision !== item.revision || [item.authorId, ...(item.contributorIds ?? [])].includes(item.approvedBy))) throw new WorkflowError('approval-invalid', 422);
  const timestamp = new Date(now).toISOString();
  const next = { ...structuredClone(item), status: rule[2], version: item.version + 1, updatedAt: timestamp };
  if (command.action === 'approve') Object.assign(next, { approvedBy: actor.id, approvedRevision: item.revision, approvedAt: timestamp });
  if (command.action === 'publish') next.publishedAt = timestamp;
  if (command.action === 'request_changes') Object.assign(next, { approvedBy: null, approvedRevision: null, approvedAt: null });
  return { item: next, audit: { actorId: actor.id, action: command.action, contentId: item.id, from: item.status, to: next.status, version: next.version, occurredAt: timestamp, reason: command.action === 'request_changes' ? command.reason.trim() : null } };
}

export function editDraft(item, changes, actor, expectedVersion, now) {
  if (!hasPermission(actor, 'edit')) throw new WorkflowError('forbidden', 403);
  if (item.version !== expectedVersion) throw new WorkflowError('version-conflict', 409);
  if (item.status !== 'draft') throw new WorkflowError('draft-required', 409);
  const allowed = ['translations', 'tags', 'sourceIds', 'relatedIds', 'missingFields', 'occurredAt'];
  if (!changes || Object.keys(changes).some(key => !allowed.includes(key)) || !Number.isFinite(now)) throw new WorkflowError('invalid-edit', 400);
  const next = { ...structuredClone(item), ...structuredClone(changes), revision: item.revision + 1, version: item.version + 1, contributorIds: [...new Set([...(item.contributorIds ?? []), actor.id])], approvedBy: null, approvedRevision: null, approvedAt: null, scientificReview: null, localVerification: null, updatedAt: new Date(now).toISOString() };
  for (const text of Object.values(next.translations ?? {})) text.review = null;
  return next;
}
