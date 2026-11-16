// The site map: every page, every safety topic and the header menu, defined once.
// Header, mobile menu, footer, search and the page builder all read from here.
// Labels are locale keys (see /locales); text never lives in this file.

export const EMERGENCY_NUMBER = '115'
export const MINISTRY_URL = 'https://gov.krd/moi-en/'
export const GOVERNMENT_NEWS_URL = 'https://gov.krd/dmi-en/publications/news-service/'

/** Pages reachable from menus. `file` may include a #section. */
export const PAGES = {
  home: { file: 'index.html', icon: 'building', label: 'nav.home' },
  history: { file: 'history.html', icon: 'history', label: 'page.history' },
  how: { file: 'how-it-works.html', icon: 'gear', label: 'page.how' },
  knowledge: { file: 'knowledge.html', icon: 'document', label: 'page.knowledge' },
  glossary: { file: 'glossary.html', icon: 'chat', label: 'page.glossary' },
  sources: { file: 'sources.html', icon: 'link', label: 'page.sources' },
  updates: { file: 'updates.html', icon: 'news', label: 'page.updates' },
  status: { file: 'service-status.html', icon: 'status', label: 'page.status' },
  centers: { file: 'service-status.html#centers', icon: 'pin', label: 'page.centers' },
  services: { file: 'portal.html#services', icon: 'document', label: 'page.services' },
  about: { file: 'portal.html#about', icon: 'shield-check', label: 'page.about' },
  awareness: { file: 'portal.html#awareness', icon: 'book', label: 'page.awareness' },
  faq: { file: 'portal.html#faq', icon: 'chat', label: 'page.faq' },
  contact: { file: 'portal.html#contact', icon: 'chat', label: 'page.contact' },
  account: { file: 'account.html', icon: 'user', label: 'page.account' },
  safety: { file: 'safety-guide.html', icon: 'shield-check', label: 'page.safety' },
  equipment: { file: 'equipment.html', icon: 'tool', label: 'page.equipment' },
  training: { file: 'training.html', icon: 'school', label: 'page.training' },
  privacy: { file: 'privacy-accessibility.html', icon: 'lock', label: 'page.privacy' },
  call: { file: `tel:${EMERGENCY_NUMBER}`, icon: 'phone', label: 'nav.call' },
}

export const TOPIC_CATEGORIES = ['fire', 'rescue', 'risk', 'prevention']

/** Safety topics. Each has a page topic-<id>.html; titles are locale keys topic.<id>. */
export const TOPICS = [
  { id: 'home-fires', category: 'fire', icon: 'house' },
  { id: 'high-rise', category: 'fire', icon: 'tower' },
  { id: 'facility-fires', category: 'fire', icon: 'fire' },
  { id: 'wildfire', category: 'fire', icon: 'tree' },
  { id: 'road-rescue', category: 'rescue', icon: 'car' },
  { id: 'height-rescue', category: 'rescue', icon: 'ladder' },
  { id: 'confined-spaces', category: 'rescue', icon: 'box' },
  { id: 'water-rescue', category: 'rescue', icon: 'water' },
  { id: 'floods', category: 'rescue', icon: 'rain' },
  { id: 'earthquakes', category: 'rescue', icon: 'quake' },
  { id: 'gas', category: 'risk', icon: 'gas' },
  { id: 'electricity', category: 'risk', icon: 'bolt' },
  { id: 'hazardous-materials', category: 'risk', icon: 'hazard' },
  { id: 'severe-weather', category: 'risk', icon: 'cloud' },
  { id: 'inspection', category: 'prevention', icon: 'shield-check' },
  { id: 'training-support', category: 'prevention', icon: 'school' },
]

export const topicFile = (id) => `topic-${id}.html`

/** Header menu groups. `topics: true` appends the safety topics grouped by category. */
export const NAV_GROUPS = [
  { id: 'about', pages: ['history', 'how', 'knowledge', 'glossary', 'sources'] },
  { id: 'services', pages: ['status', 'services', 'centers', 'account'] },
  { id: 'safety', pages: ['safety', 'equipment', 'training'], topics: true },
  { id: 'sources', pages: ['sources', 'updates', 'glossary'] },
  { id: 'contact', pages: ['contact', 'privacy', 'call'] },
]

/** Which menu group a page belongs to (highlights the header on interior pages). */
export const groupOf = (pageId) => NAV_GROUPS.find((group) => group.pages.includes(pageId))?.id || null
