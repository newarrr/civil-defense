// Page lifecycle shared by every page:
//   1. load the language catalogue (and the page's own data) → 2. draw header, page, footer
//   3. load /content (admin) → draw alerts, menu extras and whatever the page shows from it
//   4. on language change repeat 1–3 in place, without reloading.
import { $, on, prefersReducedMotion } from '../core/dom.js'
import { icon } from '../core/icons.js'
import { initI18n, onLocaleChange, setLocalePreparer, getLocale, localeIds, t } from '../core/i18n.js'
import { loadCms } from '../core/cms.js'
import { groupOf } from '../core/site.js'
import { initHeader, renderHeader } from './header.js'
import { initFooter, renderFooter } from './footer.js'
import { openSearch, setSearchContent } from './search.js'
import { renderAlerts, setNews, openNews } from './news.js'

/** Set the browser tab title: "<page> — <site>". */
export const setTitle = (pageTitle) => { document.title = pageTitle ? `${pageTitle} — ${t('site.name')}` : `${t('site.brand')} — ${t('site.governorate')}` }

function backToTop() {
  const button = document.createElement('button')
  button.type = 'button'
  button.id = 'back-to-top'
  button.hidden = true
  button.innerHTML = String(icon('up'))
  document.body.append(button)
  button.addEventListener('click', () => {
    scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'instant' : 'smooth' })
    $('.skip')?.focus({ preventScroll: true })
  })
  const sync = () => { button.hidden = scrollY < 400 }
  addEventListener('scroll', sync, { passive: true })
  sync()
  return button
}

const canUseWorker = () => 'serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')

/** Offline support (sw.js). Registered after the page has loaded, whenever that happens. */
function registerServiceWorker() {
  if (!canUseWorker()) return
  const go = () => navigator.serviceWorker.register('sw.js').catch(() => {})
  if (document.readyState === 'complete') go()
  else addEventListener('load', go, { once: true })
}

/**
 * Ask the worker to keep the files this page already loaded, plus every language's texts and page
 * data, so a page opened once also works offline in the other languages.
 * Sent again when a new worker takes over (after a site update its activation clears the old
 * cache, which may be the one that received the first message).
 */
async function rememberLoadedFiles() {
  if (!canUseWorker()) return
  const site = (path) => new URL(path, document.baseURI).href
  const send = (worker) => worker?.postMessage({
    type: 'cache-urls',
    urls: [
      location.href,
      ...performance.getEntriesByType('resource').map((entry) => entry.name),
      ...localeIds.flatMap((id) => [`locales/${id}.js`, `data/knowledge/${id}.js`, `data/history/${id}.js`].map(site)),
      site('data/knowledge/index.js'),
      site('data/history/index.js'),
    ],
  })
  navigator.serviceWorker.addEventListener('controllerchange', () => send(navigator.serviceWorker.controller))
  send((await navigator.serviceWorker.ready).active)
}

/**
 * Start a page.
 * @param {object}   page
 * @param {string}   page.id          key in core/site.js PAGES (or 'home', 'topic')
 * @param {string}  [page.group]      header group to highlight (defaults from the site map)
 * @param {boolean} [page.invitation] show the knowledge invitation above the footer
 * @param {(locale: string) => Promise<any>} [page.load]  page data for a language
 * @param {(ctx: {main: HTMLElement, data: any}) => void} page.render   draw the page
 * @param {(ctx: {main: HTMLElement, data: any, cms: object}) => void} [page.onCms]  draw CMS-driven parts
 */
export async function startPage(page) {
  const main = $('#main')
  let data
  let cms = null
  const loadData = () => (page.load ? page.load(getLocale()) : Promise.resolve(undefined))

  registerServiceWorker()
  ;[, data] = await Promise.all([initI18n(), loadData()])

  const top = backToTop()
  const drawChrome = () => {
    $('.skip').textContent = t('action.skip')
    top.setAttribute('aria-label', t('action.backToTop'))
  }
  const drawCms = () => {
    if (!cms) return
    renderAlerts(cms.alerts)
    page.onCms?.({ main, data, cms })
  }

  initHeader({ page: page.id, group: page.group ?? groupOf(page.id), onSearch: openSearch })
  initFooter({ invitation: Boolean(page.invitation) })
  drawChrome()
  page.render({ main, data })
  document.documentElement.dataset.ready = 'true'

  // News links work on every page: #news-<slug> opens the reader.
  on(document, 'click', 'a[href^="#news-"]', (event, link) => {
    // Ctrl/Cmd/Shift/Alt-click opens the link elsewhere; the new tab opens the reader itself.
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
    if (openNews(link.getAttribute('href').slice(6))) event.preventDefault()
  })
  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openSearch() }
  })

  // A language switch loads this page's data before anything changes (all or nothing).
  setLocalePreparer((locale) => (page.load ? page.load(locale) : Promise.resolve(undefined)))
  onLocaleChange((locale, next) => {
    data = next
    renderHeader()
    renderFooter()
    drawChrome()
    page.render({ main, data })
    drawCms()
  })

  cms = await loadCms()
  setNews(cms.news)
  setSearchContent(cms)
  renderHeader({ cms })
  drawCms()
  if (location.hash.startsWith('#news-')) openNews(location.hash.slice(6))

  rememberLoadedFiles().catch(() => {})
}
