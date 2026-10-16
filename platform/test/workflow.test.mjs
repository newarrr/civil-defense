import test from 'node:test';
import assert from 'node:assert/strict';
import { transition, editDraft, hasPermission, ROLES } from '../src/workflow.mjs';
import { content, source, actor, NOW } from './fixtures.mjs';
const context = { now: NOW, sources: [source()], locales: ['badini', 'sorani', 'ar', 'en'] };
const run = (item, action, person, extra = {}) => transition(item, { action, expectedVersion: item.version, ...extra }, person, context);
test('all nine roles are explicit and least privilege', () => {
  const expected = { super_admin: true, admin: true, editor: false, reviewer: false, publisher: true, translator: false, subject_expert: false, media_manager: false, auditor: false };
  assert.equal(ROLES.length, 9);
  for (const role of ROLES) assert.equal(hasPermission(actor(role), 'publish'), expected[role], role);
  assert.equal(hasPermission({ ...actor('admin'), active: false }, 'publish'), false);
  assert.equal(hasPermission(actor('owner'), 'publish'), false);
  assert.equal(hasPermission({ ...actor('admin'), roles: ['admin', 'forged'] }, 'publish'), false);
});
test('full workflow records immutable versioned evidence and distinct occurred/published timestamps', () => {
  let item = content({ occurredAt: '2026-10-10T09:00:00Z' });
  const commands = [['submit', 'editor'], ['start_review', 'reviewer'], ['approve', 'reviewer'], ['publish', 'publisher'], ['archive', 'publisher']];
  for (const [action, role] of commands) {
    const result = run(item, action, actor(role));
    assert.equal(result.item.version, item.version + 1); assert.equal(result.audit.from, item.status); assert.equal(item.version + 1, result.audit.version);
    item = result.item;
  }
  assert.equal(item.status, 'archived'); assert.equal(item.occurredAt, '2026-10-10T09:00:00Z'); assert.equal(item.publishedAt, new Date(NOW).toISOString());
});
test('author and contributors cannot review/approve even with admin roles', () => {
  for (const role of ['super_admin', 'admin', 'reviewer']) {
    const item = content({ status: 'in_review' });
    assert.throws(() => run(item, 'approve', actor(role, item.authorId)), { code: 'self-review' });
    item.contributorIds = ['test-contributor'];
    assert.throws(() => run(item, 'approve', actor(role, 'test-contributor')), { code: 'self-review' });
  }
});
test('invalid transitions, stale versions and client-crafted status changes cannot bypass review', () => {
  assert.throws(() => run(content(), 'publish', actor('publisher')), { code: 'invalid-transition' });
  assert.throws(() => run(content(), 'submit', actor('editor'), { expectedVersion: 0 }), { code: 'version-conflict' });
  assert.throws(() => run(content(), 'override', actor('super_admin')), { code: 'unknown-action' });
  assert.throws(() => run(content({ status: 'approved' }), 'publish', actor('publisher')), { code: 'approval-invalid' });
});
test('return for changes requires reason and invalidates approval; edit invalidates all reviews', () => {
  const item = content({ status: 'in_review', approvedBy: 'test-old-reviewer' });
  assert.throws(() => run(item, 'request_changes', actor('reviewer')), { code: 'reason-required' });
  const returned = run(item, 'request_changes', actor('reviewer'), { reason: 'Fix citation' });
  assert.equal(returned.item.status, 'draft'); assert.equal(returned.item.approvedBy, null);
  const edited = editDraft(returned.item, { translations: returned.item.translations }, actor('editor'), returned.item.version, NOW);
  assert.equal(edited.revision, 2); assert.equal(edited.scientificReview, null); assert.equal(edited.translations.en.review, null);
  assert.equal(returned.item.translations.en.review.status, 'approved');
  assert.throws(() => editDraft(edited, { authorId: 'forged' }, actor('editor'), edited.version, NOW), { code: 'invalid-edit' });
});
test('approval and publication recheck all locales, scientific sources and current time', () => {
  const item = content({ status: 'in_review' }); item.translations.sorani.review = null;
  assert.throws(() => run(item, 'approve', actor('reviewer')), e => e.code === 'publication-blocked' && e.details.includes('sorani:translation-review'));
  const approved = run(content({ status: 'in_review' }), 'approve', actor('reviewer')).item;
  const oldSource = source(); oldSource.expiresAt = '2026-10-15T12:00:00Z';
  assert.throws(() => transition(approved, { action: 'publish', expectedVersion: approved.version }, actor('publisher'), { ...context, sources: [oldSource] }), { code: 'publication-blocked' });
});
