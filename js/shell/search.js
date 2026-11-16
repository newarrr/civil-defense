// Site-wide search (header button or Ctrl/⌘+K): pages, safety topics, services, news and
// official sources. Topic full text is loaded the first time the search opens.
import { $, html, mount, normalizeText } from '../core/dom.js'
import { icon } from '../core/icons.js'
import { t, href, getLocale, localized } from '../core/i18n.js'
import { PAGES, TOPICS, GOVERNMENT_NEWS_URL, MINISTRY_URL, topicFile } from '../core/site.js'
import { openDialog, closeDialog, dialogTitle } from './dialog.js'

export const SERVICE_IDS = ['permit', 'inspection', 'training', 'volunteer']
const MAX_RESULTS = 12

let cms = null
const topicText = new Map() // locale → { topicId: 'searchable text' }

export const setSearchContent = (content) => { cms = content }

async function loadTopicText() {
  const locale = getLocale()
  if (topicText.has(locale)) return
  try {
    const { default: knowledge } = await import(`../../data/knowledge/${locale}.js`)
    topicText.set(locale, Object.fromEntries(Object.entries(knowledge.topics).map(([id, topic]) => [id, Object.values(topic).join(' ')])))
  } catch {
    topicText.set(locale, {})
  }
}

function entries() {
  const bodies = topicText.get(getLocale()) || {}
  return [
    ...Object.entries(PAGES).filter(([id]) => id !== 'call').map(([, page]) => ({ label: t(page.label), type: t('search.type.page'), url: href(page.file), icon: page.icon })),
    ...TOPICS.map((topic) => ({ label: t(`topic.${topic.id}`), type: t(`category.${topic.category}`), text: bodies[topic.id] || '', url: href(topicFile(topic.id)), icon: topic.icon })),
    ...SERVICE_IDS.map((id) => ({ label: t(`service.${id}.title`), description: t(`service.${id}.desc`), type: t('nav.services'), url: href(`portal.html?service=${id}#services`), icon: 'document' })),
    ...(cms?.news || []).map((item) => ({ label: localized(item.title), description: localized(item.excerpt), type: t('nav.latestNews'), url: `#news-${item.slug}`, icon: 'news' })),
    { label: t('source.ministry.title'), description: t('source.ministry.desc'), type: t('search.type.official'), url: MINISTRY_URL, icon: 'external', external: true },
    { label: t('source.guidelines.title'), description: t('source.guidelines.desc'), type: t('search.type.official'), url: GOVERNMENT_NEWS_URL, icon: 'external', external: true },
  ]
}

function results(query) {
  const needle = normalizeText(query)
  const all = entries()
  const found = needle ? all.filter((entry) => normalizeText(`${entry.label} ${entry.description || ''} ${entry.text || ''}`).includes(needle)) : all.filter((entry) => !entry.text && !entry.external)
  return { total: found.length, shown: found.slice(0, MAX_RESULTS), query: needle }
}

function draw(query) {
  const { total, shown, query: needle } = results(query)
  mount('#search-results', shown.length
    ? shown.map((entry) => html`<a href="${entry.url}"${entry.external ? html` target="_blank" rel="noopener noreferrer"` : ''}>
        <span class="search-result-icon">${icon(entry.icon)}</span>
        <span class="search-result-text"><strong>${entry.label}</strong><small>${entry.type}${entry.description ? ' · ' + entry.description : ''}</small></span>
      </a>`)
    : html`<p class="empty-search">${t('search.noResults')}</p>`)
  $('#search-count').textContent = needle ? t('search.count', { count: total }) : t('search.suggested')
}

export async function openSearch() {
  const content = openDialog(html`
    ${dialogTitle(t('action.search'))}
    <label class="search-label" for="site-search">${t('search.hint')}</label>
    <input id="site-search" class="search-field" type="search" maxlength="120" autocomplete="off" enterkeyhint="search" aria-controls="search-results" placeholder="${t('search.placeholder')}">
    <p id="search-count" class="search-count" role="status" aria-live="polite"></p>
    <div class="search-results" id="search-results"></div>`)
  const input = $('#site-search', content)
  input.addEventListener('input', () => draw(input.value))
  // A result on the page already open only moves within it: close the search so the visitor sees it.
  // (Closed on the next task: removing the link before its default action would cancel the navigation.
  // News results are handled by the news reader, external ones open in a new tab.)
  content.addEventListener('click', (event) => {
    const link = event.target instanceof Element ? event.target.closest('#search-results a') : null
    if (!link || link.target === '_blank' || link.getAttribute('href').startsWith('#news-')) return
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return // opened in another tab or window: this page stays
    setTimeout(closeDialog)
  })
  draw('')
  input.focus()
  await loadTopicText()
  if (input.isConnected) draw(input.value)
}

