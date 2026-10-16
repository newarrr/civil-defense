import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { checkFreeze, manifest } from './freeze.mjs';
import { serveLegacy } from './static-server.mjs';
const out = new URL('../test-results/homepage/', import.meta.url);
const widths = [320, 390, 768, 1024, 1440, 1920, 2560, 3840];
const selectors = ['.page', '.page>header', '.brand', '.brand img', '.hero', '.hero-copy', '.hero-copy h1', '.field-photo', '.service-strip', '.reference-features', '.site-footer'];
const report = { baselineCommit: manifest.commit, freeze: checkFreeze(), browser: null, cases: [], errors: [], requests: [], externalRequestsBlocked: true };
let base, candidate, browser;
try {
  await mkdir(out, { recursive: true });
  // Same origin and URL keep the image decoder/cache path identical. No HTTP caching:
  // every navigation fetches the selected Git or worktree bytes via the server.
  base = await serveLegacy({ base: true, compare: true }); candidate = { origin: base.origin };
  browser = await chromium.launch({ headless: true, args: ['--disable-gpu', '--force-color-profile=srgb'], ...(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {}) });
  report.browser = browser.version();
  for (const locale of ['badini', 'sorani', 'ar', 'en']) for (const theme of ['light', 'dark']) for (const width of widths) {
    const name = `${locale}-${theme}-${width}`;
    const shots = [], metrics = [];
    const context = await browser.newContext({ viewport: { width, height: 1000 }, deviceScaleFactor: 1, reducedMotion: 'reduce', locale: 'en-US', timezoneId: 'Asia/Baghdad', colorScheme: 'light' });
    await context.route('**/*', route => [base.origin, candidate.origin].some(origin => route.request().url().startsWith(origin + '/')) ? route.continue() : route.abort());
    const page = await context.newPage();
    let activeVersion;
    page.on('pageerror', error => report.errors.push({ name, version: activeVersion, error: error.message }));
    page.on('response', response => { if (response.status() >= 400) report.requests.push({ name, version: activeVersion, status: response.status(), url: response.url() }); });
    for (const [version, origin] of [['before', base.origin], ['after', candidate.origin]]) {
      activeVersion = version;
      base.select(version);
      const response = await page.goto(`${origin}/civil-defense/index.html?lang=${locale}&theme=${theme}`, { waitUntil: 'networkidle' });
      if (response.status() !== 200) throw new Error(`Cannot render ${name}`);
      await page.evaluate(() => document.fonts.ready);
      await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}' });
      await page.evaluate(async () => {
        await Promise.all([...document.images].map(image => image.decode()));
        const imageURLs = new Set([...document.images].map(image => image.currentSrc || image.src));
        const urls = new Set();
        for (const e of document.querySelectorAll('*')) for (const pseudo of [null, '::before', '::after']) {
          const background = getComputedStyle(e, pseudo).backgroundImage;
          for (const match of background.matchAll(/url\(["']?([^"')]+)["']?\)/g)) { const url = new URL(match[1], location.href).href; if (!imageURLs.has(url)) urls.add(url); }
        }
        // Retain decoded background images; a network-idle event alone does not finish raster decoding.
        window.__visualImages = await Promise.all([...urls].map(async url => { const image = new Image(); image.src = url; await image.decode(); return image; }));
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        window.scrollTo({ top: 0, behavior: 'instant' });
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      metrics.push(await page.evaluate(selectors => ({
        title: document.title, dir: document.documentElement.dir, locale: document.documentElement.dataset.locale,
        theme: document.documentElement.dataset.theme ?? document.body.dataset.theme,
        scrollWidth: document.documentElement.scrollWidth, innerWidth,
        logo: document.querySelector('.brand img').getAttribute('src'),
        fonts: [...document.fonts].map(f => ({ family: f.family, status: f.status })),
        boxes: Object.fromEntries(selectors.map(selector => { const e = document.querySelector(selector), r = e.getBoundingClientRect(), c = getComputedStyle(e); return [selector, { x: r.x, y: r.y, width: r.width, height: r.height, font: c.fontFamily, fontSize: c.fontSize, fontWeight: c.fontWeight, lineHeight: c.lineHeight }]; }))
      }), selectors));
      // Warm the full-page raster before measuring: large PNGs can first use a
      // temporary low-quality resample even after decode() has resolved.
      await page.screenshot({ fullPage: true, animations: 'disabled' });
      await page.waitForTimeout(700);
      let previous, stable;
      for (let attempt = 0; attempt < 8; attempt++) {
        const current = await page.screenshot({ fullPage: true, animations: 'disabled' });
        if (previous?.equals(current)) { stable = current; break; }
        previous = current;
        await page.waitForTimeout(150);
      }
      if (!stable) throw new Error(`Unstable rendering: ${name}-${version}`);
      await writeFile(new URL(`${name}-${version}.png`, out), stable);
      shots.push(stable);
    }
    await context.close();
    const a = await sharp(shots[0]).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const b = await sharp(shots[1]).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const sameDimensions = a.info.width === b.info.width && a.info.height === b.info.height;
    let changedPixels = 0;
    if (sameDimensions) {
      const diff = Buffer.alloc(a.data.length);
      for (let i = 0; i < a.data.length; i += 4) {
        const changed = a.data.subarray(i, i + 4).some((v, n) => v !== b.data[i + n]);
        if (changed) changedPixels++;
        diff[i] = changed ? 240 : 255; diff[i + 1] = changed ? 0 : 255; diff[i + 2] = changed ? 50 : 255; diff[i + 3] = 255;
      }
      if (changedPixels) await sharp(diff, { raw: { width: a.info.width, height: a.info.height, channels: 4 } }).png().toFile(fileURLToPath(new URL(`${name}-diff.png`, out)));
    }
    const sameMetrics = JSON.stringify(metrics[0]) === JSON.stringify(metrics[1]);
    const m = metrics[1];
    const correctState = m.locale === locale && m.dir === (locale === 'en' ? 'ltr' : 'rtl') && m.theme === theme && m.scrollWidth <= width && m.fonts.some(f => f.family.includes('Duhok') && f.status === 'loaded');
    report.cases.push({ name, width, locale, theme, sameDimensions, changedPixels: sameDimensions ? changedPixels : null, sameMetrics, correctState, passed: sameDimensions && changedPixels === 0 && sameMetrics && correctState, before: metrics[0], after: metrics[1] });
    console.log(`${name}: ${report.cases.at(-1).passed ? 'PASS' : 'FAIL'} (${changedPixels} changed pixels)`);
  }
  report.passed = report.cases.length === 64 && report.cases.every(c => c.passed) && !report.errors.length && !report.requests.length;
  if (!report.passed) process.exitCode = 1;
} catch (error) { report.passed = false; report.failure = error.message; process.exitCode = 1; }
finally {
  report.checkedAt = new Date().toISOString();
  await writeFile(new URL('report.json', out), JSON.stringify(report, null, 2));
  await browser?.close(); await base?.close();
  console.log(JSON.stringify({ cases: report.cases.length, passed: report.passed, errors: report.errors, failure: report.failure }));
}
