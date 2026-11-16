import { transition, WorkflowError } from './workflow.mjs';

/** Host-independent service boundary, not an HTTP server or a production auth provider.
 * db.transaction must supply a single, isolated PostgreSQL connection per transaction.
 * authenticate MUST verify the identity token on the server (issuer/audience/expiry/MFA).
 * It returns only the stable subject; all roles are read from the private database.
 */
export function editorialService({ db, authenticate, clock = Date.now, locales = ['badini', 'sorani', 'ar', 'en'] }) {
  if (typeof db?.transaction !== 'function' || typeof authenticate !== 'function') throw new TypeError('Trusted database and identity adapters required');
  return Object.freeze({
    async execute(token, contentId, command) {
      const principal = await authenticate(token);
      if (!principal?.subject || typeof principal.subject !== 'string') throw new WorkflowError('unauthenticated', 401);
      if (!/^[a-z][a-z0-9-]{0,79}$/.test(contentId) || !command || Object.keys(command).some(key => !['action', 'expectedVersion', 'reason'].includes(key))) throw new WorkflowError('invalid-command', 400);
      return db.transaction(async tx => {
        const staff = await tx.query('SELECT id, active FROM cd.staff WHERE identity_subject = $1 FOR SHARE', [principal.subject]);
        if (!staff.rows[0]?.active) throw new WorkflowError('forbidden', 403);
        const assigned = await tx.query('SELECT role FROM cd.staff_role WHERE staff_id = $1 FOR SHARE', [staff.rows[0].id]);
        const actor = { ...staff.rows[0], roles: assigned.rows.map(row => row.role) };
        const result = await tx.query('SELECT document FROM cd.content WHERE id = $1 FOR UPDATE', [contentId]);
        if (!result.rows.length) throw new WorkflowError('not-found', 404);
        const item = result.rows[0].document;
        const sourceRows = await tx.query('SELECT id, metadata FROM cd.source WHERE id = ANY($1::text[]) FOR SHARE', [item.sourceIds ?? []]);
        const sources = sourceRows.rows.map(row => ({ ...row.metadata, id: row.id }));
        const { item: next, audit } = transition(item, command, actor, { sources, now: clock(), locales });
        const updated = await tx.query('UPDATE cd.content SET version = $2, status = $3, document = $4 WHERE id = $1 AND version = $5 RETURNING version', [contentId, next.version, next.status, JSON.stringify(next), command.expectedVersion]);
        if (updated.rows.length !== 1) throw new WorkflowError('version-conflict', 409);
        await tx.query('INSERT INTO cd.content_revision(content_id, version, document) VALUES ($1, $2, $3)', [contentId, next.version, JSON.stringify(next)]);
        for (const [locale, text] of Object.entries(next.translations ?? {})) {
          await tx.query('INSERT INTO cd.translation(content_id, version, locale, title, summary, body, review) VALUES ($1,$2,$3,$4,$5,$6,$7)', [contentId, next.version, locale, text.title, text.summary, text.body, JSON.stringify(text.review ?? null)]);
        }
        await tx.query('INSERT INTO cd.audit_event(content_id, actor_id, version, action, from_status, to_status, occurred_at, reason) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', [contentId, actor.id, next.version, audit.action, audit.from, audit.to, audit.occurredAt, audit.reason]);
        return { id: contentId, status: next.status, version: next.version };
      });
    }
  });
}
