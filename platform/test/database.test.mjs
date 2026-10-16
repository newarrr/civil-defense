import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { editorialService } from '../src/editorial-service.mjs';
import { content, source, NOW } from './fixtures.mjs';
import { taxonomy } from '../src/taxonomy.mjs';
async function setup(t, item = content()) {
  const db = new PGlite(); t.after(() => db.close());
  await db.exec(await readFile(new URL('../db/001-foundation.sql', import.meta.url), 'utf8'));
  for (const [id, role] of [['test-author', 'editor'], ['test-reviewer', 'reviewer'], ['test-publisher', 'publisher'], ['test-auditor', 'auditor'], ['test-translator', 'translator']]) {
    await db.query('INSERT INTO cd.staff VALUES ($1,$2,true)', [id, `subject:${id}`]);
    await db.query('INSERT INTO cd.staff_role VALUES ($1,$2)', [id, role]);
  }
  await db.query('INSERT INTO cd.source(id,metadata) VALUES($1,$2)', [source().id, JSON.stringify(source())]);
  await db.query('INSERT INTO cd.content VALUES($1,$2,$3,$4,$5)', [item.id, item.authorId, item.version, item.status, JSON.stringify(item)]);
  await db.query('INSERT INTO cd.content_revision(content_id,version,document) VALUES($1,$2,$3)', [item.id, item.version, JSON.stringify(item)]);
  const service = editorialService({ db, clock: () => NOW, authenticate: async token => token?.startsWith('signed-test:') ? { subject: 'subject:' + token.slice(12), roles: ['super_admin'] } : null });
  return { db, service, execute: (id, action, version = 1, extra = {}) => service.execute('signed-test:' + id, item.id, { action, expectedVersion: version, ...extra }) };
}
test('actual PostgreSQL migration and committed workflow save revision + translations + audit atomically', async t => {
  const { db, execute } = await setup(t);
  await execute('test-author', 'submit'); await execute('test-reviewer', 'start_review', 2); await execute('test-reviewer', 'approve', 3); await execute('test-publisher', 'publish', 4);
  assert.deepEqual((await db.query('SELECT version,status FROM cd.content')).rows, [{ version: 5, status: 'published' }]);
  assert.equal((await db.query('SELECT * FROM cd.audit_event')).rows.length, 4);
  assert.equal((await db.query('SELECT * FROM cd.translation')).rows.length, 16);
  assert.equal((await db.query('SELECT * FROM cd.content_revision')).rows.length, 5);
});
test('server ignores client role claims, denies missing identity and inactive staff, rejects raw extra fields', async t => {
  const { db, service, execute } = await setup(t);
  await assert.rejects(() => service.execute('invalid', 'test-home-fire', { action: 'submit', expectedVersion: 1 }), { code: 'unauthenticated' });
  await assert.rejects(() => execute('test-auditor', 'submit'), { code: 'forbidden' });
  await assert.rejects(() => execute('test-translator', 'submit'), { code: 'forbidden' });
  await assert.rejects(() => execute('test-author', 'submit', 1, { roles: ['admin'] }), { code: 'invalid-command' });
  await db.query('UPDATE cd.staff SET active=false WHERE id=$1', ['test-author']);
  await assert.rejects(() => execute('test-author', 'submit'), { code: 'forbidden' });
  assert.equal((await db.query('SELECT * FROM cd.audit_event')).rows.length, 0);
});
test('concurrent stale commands commit once, with no lost update or extra audit', async t => {
  const { db, execute } = await setup(t);
  const results = await Promise.allSettled([execute('test-author', 'submit'), execute('test-author', 'submit')]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(results.find(r => r.status === 'rejected').reason.code, 'version-conflict');
  assert.equal((await db.query('SELECT * FROM cd.audit_event')).rows.length, 1);
});
test('audit insert failure rolls back content, revision and translations', async t => {
  const { db, execute } = await setup(t);
  await db.exec("ALTER TABLE cd.audit_event ADD CONSTRAINT test_failure CHECK (action <> 'submit')");
  await assert.rejects(() => execute('test-author', 'submit'));
  assert.equal((await db.query('SELECT version FROM cd.content')).rows[0].version, 1);
  assert.equal((await db.query('SELECT * FROM cd.content_revision')).rows.length, 1);
  assert.equal((await db.query('SELECT * FROM cd.translation')).rows.length, 0);
});
test('append-only snapshots, source foreign keys and taxonomy integrity are enforced by database', async t => {
  const { db, execute } = await setup(t);
  await execute('test-author', 'submit');
  await assert.rejects(() => db.exec('DELETE FROM cd.audit_event'), /Append-only/);
  await assert.rejects(() => db.exec("UPDATE cd.content_revision SET document='{}'"), /Append-only/);
  await assert.rejects(() => db.exec('DELETE FROM cd.translation'), /Append-only/);
  await assert.rejects(() => db.query('INSERT INTO cd.content_source VALUES($1,$2)', ['test-home-fire', 'not-a-source']), /foreign key/);
  await assert.rejects(() => db.query('INSERT INTO cd.content_term VALUES($1,$2,$3)', ['test-home-fire', 'hazards', 'unknown']), /foreign key/);
  await assert.rejects(() => db.query('UPDATE cd.content SET document = $1', [JSON.stringify({ id: null, authorId: null, version: null, status: null, revision: null })]), /check constraint/);
  await db.query('INSERT INTO cd.taxonomy_term(dimension,id,labels) VALUES($1,$2,$3)', ['hazards', 'home-fire', JSON.stringify(taxonomy.hazards[0].labels)]);
  await db.query('INSERT INTO cd.content_term VALUES($1,$2,$3)', ['test-home-fire', 'hazards', 'home-fire']);
  assert.equal((await db.query('SELECT * FROM cd.content_term')).rows.length, 1);
  await db.exec('CREATE ROLE test_untrusted; SET ROLE test_untrusted');
  await assert.rejects(() => db.exec('SELECT * FROM cd.content'), /permission denied/);
  await assert.rejects(() => db.exec('SELECT * FROM cd.audit_event'), /permission denied/);
  await db.exec('RESET ROLE');
});
