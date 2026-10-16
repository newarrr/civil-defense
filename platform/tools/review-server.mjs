import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { legacyReviewData } from './legacy-review-data.mjs';
import { mime } from './static-server.mjs';
import { root } from './freeze.mjs';
export async function reviewServer({ port = 0 } = {}) {
  const data = Buffer.from(JSON.stringify(await legacyReviewData()));
  const routes = new Map([
    ['/', new URL('../review/index.html', import.meta.url)], ['/review.css', new URL('../review/review.css', import.meta.url)], ['/review.mjs', new URL('../review/review.mjs', import.meta.url)],
    ...['i18n', 'taxonomy', 'publication', 'search'].map(name => [`/src/${name}.mjs`, new URL(`../src/${name}.mjs`, import.meta.url)]),
    ['/logo.webp', path.join(root, 'assets/community-reference/logo.webp')], ['/font.woff2', path.join(root, 'typography/vazirmatn-arabic-variable.woff2')]
  ]);
  // Resolve font path from the known protected stylesheet instead of guessing a replacement.
  const fontCSS = await readFile(path.join(root, 'kurdish-font.css'), 'utf8');
  const font = fontCSS.match(/url\(['"]?([^)'"?]+\.woff2)/)?.[1];
  if (font) routes.set('/font.woff2', path.join(root, font));
  const server = http.createServer(async (req, res) => {
    try {
      if (!/^(?:127\.0\.0\.1|localhost):\d+$/.test(req.headers.host ?? '')) { res.writeHead(403).end(); return; }
      if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }).end(); return; }
      const route = new URL(req.url, 'http://localhost').pathname;
      const file = routes.get(route);
      if (!file && route !== '/data.json') { res.writeHead(404).end(); return; }
      const bytes = route === '/data.json' ? data : await readFile(file);
      res.writeHead(200, { 'Content-Type': route === '/data.json' ? mime['.json'] : mime[path.extname(route)] || mime['.html'], 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'" });
      res.end(req.method === 'HEAD' ? undefined : bytes);
    } catch { res.writeHead(500).end('Local review data unavailable'); }
  });
  await new Promise(resolve => server.listen(port, '127.0.0.1', resolve));
  return { origin: `http://127.0.0.1:${server.address().port}`, close: () => new Promise(resolve => server.close(resolve)) };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const preview = await reviewServer({ port: 4190 });
  console.log(`Local editorial review only: ${preview.origin}/?lang=ar`);
  process.on('SIGINT', async () => { await preview.close(); process.exit(); });
}
