import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { reviewServer } from '../tools/review-server.mjs';

test('isolated review explorer: four languages, mobile layouts, filters, empty state and accessibility', { timeout: 120000 }, async t => {
  const server = await reviewServer();
  const browser = await chromium.launch({ headless: true, ...(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {}) });
  t.after(async () => { await browser.close(); await server.close(); });
  const context = await browser.newContext(); const page = await context.newPage(); const errors = [], bad = [], results = [];
  page.on('pageerror', e => errors.push(e.message)); page.on('response', r => { if (r.status() >= 400) bad.push(r.url()); });
  const out = new URL('../test-results/review/', import.meta.url); await mkdir(out, { recursive: true });
  for (const lang of ['badini', 'sorani', 'ar', 'en']) for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 }); await page.goto(server.origin + '/?lang=' + lang); await page.locator('article').first().waitFor(); await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('article').count(), 16);
    assert.equal(await page.getAttribute('html', 'dir'), lang === 'en' ? 'ltr' : 'rtl');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    results.push({ lang, width, violations: axe.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) })) });
    assert.deepEqual(axe.violations.map(v => v.id), [], `${lang}/${width}: axe violations`);
    console.log(`Review ${lang}/${width}: layout + automated AA pass`);
    if (width === 390 || width === 1440) await page.screenshot({ path: fileURLToPath(new URL(`${lang}-${width}.png`, out)), fullPage: true });
  }
  await page.goto(server.origin + '/?lang=en'); await page.locator('article').first().waitFor();
  await page.selectOption('#hazards', 'flood'); assert.equal(await page.locator('article').count(), 3);
  await page.selectOption('#places', 'water'); assert.equal(await page.locator('article').count(), 2);
  await page.selectOption('#audiences', 'families'); assert.equal(await page.locator('article').count(), 0); assert.equal(await page.locator('#empty').isVisible(), true);
  await page.getByRole('button', { name: 'Clear filters' }).click(); assert.equal(await page.locator('article').count(), 16);
  await page.selectOption('#stages', 'recovery'); assert.equal(await page.locator('article').count(), 0);
  await page.getByRole('button', { name: 'Clear filters' }).click(); await page.fill('#query', 'Road collision rescue'); assert.equal(await page.locator('article').count(), 1);
  await page.selectOption('#locale', 'badini'); assert.equal(await page.getAttribute('html', 'lang'), 'kmr-Arab');
  await page.fill('#query', ''); assert.equal(await page.locator('article').count(), 16);
  await page.locator('summary').first().focus(); await page.keyboard.press('Enter'); assert.equal(await page.locator('details').first().getAttribute('open'), '');
  assert.deepEqual(errors, []); assert.deepEqual(bad, []);
  await writeFile(new URL('report.json', out), JSON.stringify({ checkedAt: new Date().toISOString(), browser: browser.version(), cases: results, errors, bad, interactiveChecks: 'pass', disclaimer: 'Automated checks only; not a WCAG certification or human language review' }, null, 2));
});

test('local review server exposes no staff data, arbitrary files, writes or cross-origin permissions', async t => {
  const server = await reviewServer(); t.after(() => server.close());
  for (const route of ['/.git/config', '/src/editorial-service.mjs', '/db/001-foundation.sql', '/test/fixtures.mjs', '/admin', '/api/publish', '/..%2F..%2F.env']) assert.equal((await fetch(server.origin + route)).status, 404);
  assert.equal((await fetch(server.origin + '/data.json', { method: 'POST', body: '{}' })).status, 405);
  const data = await fetch(server.origin + '/data.json'); assert.equal(data.headers.get('access-control-allow-origin'), null);
  assert.ok(data.headers.get('content-security-policy').includes("frame-ancestors 'none'"));
  const body = await data.json(); assert.equal(body.mode, 'local-editorial-review-only'); assert.equal(body.publishedCount, 0); assert.equal(body.items.length, 16);
});
