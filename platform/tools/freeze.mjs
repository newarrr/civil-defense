import { readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
export const root = fileURLToPath(new URL('../../', import.meta.url));
export const manifest = JSON.parse(readFileSync(new URL('../evidence/legacy-files.json', import.meta.url)));
const gitManifest = JSON.parse(readFileSync(new URL('../evidence/legacy-git-files.json', import.meta.url)));
export function checkFreeze() {
  const differences = [];
  for (const file of manifest.files) {
    const location = path.join(root, file.path);
    try {
      const bytes = readFileSync(location);
      const hash = createHash('sha256').update(bytes).digest('hex');
      const canonical = gitManifest.files.find(entry => entry.path === file.path);
      if (!canonical || !((hash === file.sha256 && statSync(location).size === file.bytes) || (hash === canonical.sha256 && statSync(location).size === canonical.bytes))) differences.push(file.path);
    } catch { differences.push(file.path); }
  }
  if (differences.length) throw new Error(`Protected legacy files changed: ${differences.join(', ')}`);
  return { files: manifest.files.length, differences: 0, baselineCommit: manifest.commit };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify(checkFreeze()));
