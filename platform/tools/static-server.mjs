import http from 'node:http';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { root, manifest } from './freeze.mjs';
export const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };

// Loopback only. Exact allow-list prevents serving .git, credentials or arbitrary paths.
export async function serveLegacy({ base = false, compare = false } = {}) {
  let files = new Map();
  for (const entry of manifest.files) files.set('/civil-defense/' + entry.path,
    base ? execFileSync('git', ['show', `${manifest.commit}:${entry.path}`], { cwd: root, maxBuffer: 40 * 1024 * 1024 }) : await readFile(path.join(root, entry.path)));
  const baselineFiles = files;
  const candidateFiles = compare ? new Map(await Promise.all(manifest.files.map(async entry => ['/civil-defense/' + entry.path, await readFile(path.join(root, entry.path))]))) : files;
  const server = http.createServer((req, res) => {
    let key;
    try { key = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400).end(); return; }
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
    if (key === '/civil-defense/') key += 'index.html';
    const bytes = files.get(key);
    if (!bytes) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': mime[path.extname(key)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : bytes);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return { origin: `http://127.0.0.1:${server.address().port}`, select: version => { if (!compare) throw new Error('Not a comparison server'); files = version === 'before' ? baselineFiles : candidateFiles; }, close: () => new Promise(resolve => server.close(resolve)) };
}
