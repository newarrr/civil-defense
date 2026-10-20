import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import path from 'node:path';
import { root, checkFreeze } from './freeze.mjs';
const languages = ['ar', 'badini', 'sorani', 'en'];
const mapping = {
  'home-fires': [['home-fire'], ['home']], 'facility-fires': [['facility-fire'], ['workplace']], wildfire: [['wildfire'], ['nature']],
  'road-rescue': [['road-collision'], ['road']], 'height-rescue': [['height'], ['workplace']], 'confined-spaces': [['confined-space'], ['workplace']],
  floods: [['flood'], ['water', 'home']], 'water-rescue': [['flood'], ['water']], earthquakes: [['earthquake'], ['home', 'workplace']],
  'hazardous-materials': [['hazmat'], ['workplace']], electricity: [['electricity'], ['home', 'workplace']], gas: [['gas'], ['home']],
  'high-rise': [['facility-fire'], ['workplace']], 'severe-weather': [['severe-weather'], ['nature', 'home']],
  inspection: [['facility-fire'], ['workplace']], 'training-support': [['home-fire', 'flood'], ['school']]
};
export async function legacyReviewData() {
  checkFreeze();
  const context = { window: {} };
  for (const name of ['knowledge-data.js', 'knowledge-topics.js', 'knowledge-editorial.js']) runInNewContext(await readFile(path.join(root, name), 'utf8'), context, { timeout: 2000 });
  const k = context.window.Knowledge;
  return {
    mode: 'local-editorial-review-only', publishedCount: 0, classificationReview: 'pending-human-review',
    items: k.topics.map(t => {
      if (!mapping[t.id]) throw new Error(`Unmapped legacy topic ${t.id}`);
      return { id: t.id, status: 'draft', scope: 'international', review: t.review, tags: { hazards: mapping[t.id][0], stages: ['prevention', 'preparedness', 'response'], audiences: ['public', ...(t.id === 'home-fires' ? ['families'] : []), ...(['inspection', 'facility-fires'].includes(t.id) ? ['facility-managers'] : [])], places: mapping[t.id][1] }, translations: Object.fromEntries(languages.map((l, i) => [l, { title: t.title[i], summary: t.mission[i] }])), sourceIds: t.refs };
    }),
    sources: k.sources.map(s => ({ id: s.id, publisher: s.publisher, url: s.url, status: 'pending-human-review', translations: Object.fromEntries(languages.map((l, i) => [l, { title: s.title[i] }])) }))
  };
}
