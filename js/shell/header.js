// Site header: brand, desktop section menu with drop-down panel, tools (search, language, theme)
// and the mobile menu dialog. One implementation for every page.
import { $, $$, html, lines, mount, on, raw } from '../core/dom.js'
import { icon } from '../core/icons.js'
import { t, href, getLocale, locales, localeIds, localized, setLocale } from '../core/i18n.js'
import { getTheme, toggleTheme, onThemeChange } from '../core/theme.js'
import { NAV_GROUPS, PAGES, TOPICS, TOPIC_CATEGORIES, topicFile } from '../core/site.js'

let state = { page: 'home', group: null, cms: null, onSearch: () => {} }
let openGroup = null
let opener = null

const isExternal = (url) => /^https?:/.test(url)

// ---- menu model -------------------------------------------------------------------------

const pageLink = (id) => ({ label: t(PAGES[id].label), url: PAGES[id].file, icon: PAGES[id].icon })
const topicLink = (topic) => ({ label: t(`topic.${topic.id}`), url: topicFile(topic.id), icon: topic.icon })

/** Links a group shows: built-in pages, links added in /admin, and the latest news. */
function groupLinks(group) {
  const menu = state.cms?.menu || { links: [], latestNews: { show: false } }
  const own = menu.links.filter((link) => link.group === group.id).map((link) => ({ label: localized(link.label), url: link.url, icon: 'link', position: link.position }))
  const latest = menu.latestNews
  const news = latest.show && latest.group === group.id
    ? (state.cms?.news || []).slice(0, latest.count).map((item) => ({ label: localized(item.title), url: `#news-${item.slug}`, icon: 'news', meta: item.date }))
    : []
  return {
    start: own.filter((link) => link.position === 'start'),
    pages: group.pages.map(pageLink),
    topics: group.topics ? TOPIC_CATEGORIES.map((category) => ({ category, links: TOPICS.filter((topic) => topic.category === category).map(topicLink) })) : [],
    end: own.filter((link) => link.position !== 'start'),
    news,
  }
}

function linkCard(link) {
  const tel = link.url.startsWith('tel:')
  const meta = tel ? link.url.slice(4) : link.meta
  const target = isExternal(link.url) ? raw(' target="_blank" rel="noopener noreferrer"') : ''
  return html`<a href="${isExternal(link.url) || tel ? link.url : href(link.url)}"${target}${link.meta ? raw(' class="sections-news-link"') : ''}>
    <span class="sections-link-icon">${icon(link.icon)}</span>
    <span class="sections-link-label">${link.label}</span>
    ${meta
      ? html`<span class="sections-link-arrow" dir="ltr">${meta}</span>`
      : html`<span class="sections-link-arrow sections-chevron">${icon(isExternal(link.url) ? 'external' : 'chevron', isExternal(link.url) ? '' : 'icon-forward')}</span>`}
  </a>`
}

function groupBody(group) {
  const links = groupLinks(group)
  return [
    ...links.start.map(linkCard),
    ...links.pages.map(linkCard),
    ...links.topics.flatMap(({ category, links: items }) => [html`<h3 class="sections-category">${t(`category.${category}`)}</h3>`, ...items.map(linkCard)]),
    ...links.end.map(linkCard),
    ...(links.news.length ? [html`<h3 class="sections-category">${t('nav.latestNews')}</h3>`, ...links.news.map(linkCard)] : []),
  ]
}

// ---- templates --------------------------------------------------------------------------

const themeButton = () => {
  const label = t(getTheme() === 'dark' ? 'theme.toLight' : 'theme.toDark')
  return html`<button type="button" class="theme-toggle" data-theme-toggle aria-label="${label}" title="${label}" aria-pressed="${getTheme() === 'dark'}">${icon(getTheme() === 'dark' ? 'sun' : 'moon', 'theme-icon')}</button>`
}

function headerTemplate() {
  const locale = getLocale()
  return html`
    <a class="brand" href="${href('index.html')}">
      <img src="assets/brand/logo.webp" alt="" width="84" height="102">
      <div><strong>${t('site.brand')}</strong><strong>${t('site.governorate')}</strong>${t('site.brandKurdish') ? html`<small lang="ku-Arab" dir="rtl">${lines(t('site.brandKurdish'))}</small>` : ''}</div>
    </a>
    <div class="nav-shell">
      <nav class="sections-primary" aria-label="${t('nav.title')}">
        <a href="${href('index.html')}"${state.page === 'home' ? raw(' class="active" aria-current="page"') : ''}><span class="sections-link-label">${t('nav.home')}</span></a>
        ${NAV_GROUPS.map((group) => html`<button type="button" class="sections-trigger${state.group === group.id ? ' is-current' : ''}" data-section="${group.id}" aria-expanded="false" aria-controls="sections-panel">${t(`nav.${group.id}`)}</button>`)}
      </nav>
      <div class="tools">
        <button type="button" id="search-open" aria-label="${t('action.search')}" aria-haspopup="dialog" aria-keyshortcuts="Control+k Meta+k">${icon('search')}</button>
        <button type="button" id="language-open" aria-label="${t('action.language')}" aria-expanded="false" aria-controls="languages">
          <span aria-hidden="true">${icon('globe', 'sections-language-icon')}</span><span id="language-label">${locales[locale].short}</span><span aria-hidden="true">⌄</span>
        </button>
        <button type="button" id="menu-open" aria-label="${t('nav.menu')}" aria-haspopup="dialog" aria-controls="sections-dialog" aria-expanded="false">${icon('menu')}</button>
        ${themeButton()}
      </div>
      <section id="sections-panel" class="sections-panel" aria-labelledby="sections-panel-title" hidden></section>
    </div>
    <div class="language-menu" id="languages" hidden>
      ${localeIds.map((id) => html`<button type="button" data-lang="${id}" lang="${locales[id].tag}" dir="${locales[id].dir}" aria-pressed="${id === locale}">${locales[id].name}</button>`)}
    </div>`
}

const panelTemplate = (group) => html`
  <div class="sections-panel-head">
    <h2 id="sections-panel-title">${t(`nav.${group.id}`)}</h2>
    <button type="button" class="sections-close" aria-label="${t('nav.close')}">×</button>
  </div>
  <p class="sections-note">${icon('building')}${t('nav.note')}</p>
  <nav class="sections-grid" aria-label="${t(`nav.${group.id}`)}">${groupBody(group)}</nav>`

const mobileTemplate = () => html`
  <div class="sections-panel-head">
    <h2 id="sections-dialog-title">${t('nav.title')}</h2>
    <button type="button" class="sections-close" aria-label="${t('nav.close')}">×</button>
  </div>
  <p class="sections-note">${t('nav.note')}</p>
  <nav aria-label="${t('nav.title')}">
    ${linkCard(pageLink('home'))}
    ${NAV_GROUPS.map((group) => html`<details${state.group === group.id ? raw(' open') : ''}><summary>${t(`nav.${group.id}`)}</summary><div class="sections-mobile-links">${groupBody(group)}</div></details>`)}
  </nav>`

// ---- behaviour --------------------------------------------------------------------------

const header = () => $('#site-header')
const panel = () => $('#sections-panel')
const mobile = () => $('#sections-dialog')

function closeLanguages() {
  const menu = $('#languages')
  if (menu) menu.hidden = true
  $('#language-open')?.setAttribute('aria-expanded', 'false')
  flushLater()
}

function closePanel(restoreFocus = false) {
  const el = panel()
  if (!el || el.hidden) return
  el.hidden = true
  $$('.sections-trigger').forEach((button) => button.setAttribute('aria-expanded', 'false'))
  if (restoreFocus && opener) opener.focus()
  openGroup = null
  opener = null
  flushLater()
}

/** Keep the drop-down under its button and inside the viewport. */
function placePanel() {
  const el = panel()
  if (!opener || !el || el.hidden) return
  const anchor = opener.getBoundingClientRect()
  const frame = header().getBoundingClientRect()
  const width = Math.min(640, innerWidth - 32)
  const top = anchor.bottom + 10
  const start = document.documentElement.dir === 'rtl' ? anchor.right - width : anchor.left
  const left = Math.max(16, Math.min(start, innerWidth - width - 16))
  Object.assign(el.style, { width: `${width}px`, left: `${left - frame.left}px`, right: 'auto', top: `${top - frame.top}px`, maxHeight: `${Math.max(120, innerHeight - top - 20)}px` })
}

function openPanel(groupId, button) {
  if (openGroup === groupId) return closePanel()
  closePanel()
  closeLanguages()
  const group = NAV_GROUPS.find((item) => item.id === groupId)
  opener = button
  openGroup = groupId
  button.setAttribute('aria-expanded', 'true')
  mount(panel(), panelTemplate(group))
  builtIn = getLocale()
  panel().hidden = false
  placePanel()
}

function openMobile() {
  closePanel()
  closeLanguages()
  mount(mobile(), mobileTemplate())
  builtIn = getLocale()
  mobile().showModal()
  $('#menu-open').setAttribute('aria-expanded', 'true')
  $('.sections-close', mobile()).focus()
}

// While a menu is open it is not redrawn (the CMS data may arrive while the visitor is using it):
// the update waits until every menu is closed.
// The site dialog (search, news, drafts) counts too: closing it returns focus to a header control.
let deferred = false
let builtIn = null // language of the open panel or phone menu
const menuOpen = () => Boolean(mobile()?.open || $('#site-dialog')?.open || (panel() && !panel().hidden) || ($('#languages') && !$('#languages').hidden))
const flushLater = () => setTimeout(() => { if (deferred && !menuOpen()) renderHeader() })

/** A selector that finds the same control again after the header is redrawn. */
function focusKey() {
  const el = document.activeElement
  if (!el || !header()?.contains(el)) return null
  if (el.id) return `#${el.id}`
  if (el.dataset.section) return `.sections-trigger[data-section="${el.dataset.section}"]`
  if (el.matches('[data-theme-toggle]')) return '[data-theme-toggle]'
  if (el.matches('.brand')) return '.brand'
  if (el.matches('.sections-primary > a')) return '.sections-primary > a'
  return null
}

/** Draw the header. Safe to call again after a language change or when CMS data arrives. */
export function renderHeader(next = {}) {
  state = { ...state, ...next }
  // A menu built in another language holds links to that language (?lang=…): never keep it open
  // across a language switch. The panel is closed (focus back on its button); the phone menu is
  // redrawn in place with the same groups expanded.
  if (builtIn && builtIn !== getLocale()) {
    if (openGroup) closePanel(true)
    if (mobile()?.open) {
      const expanded = $$('details', mobile()).map((item) => item.open)
      mount(mobile(), mobileTemplate())
      $$('details', mobile()).forEach((item, i) => { item.open = expanded[i] ?? item.open })
      $('.sections-close', mobile())?.focus()
    }
    builtIn = getLocale()
  }
  if (menuOpen()) { deferred = true; return }
  deferred = false
  const focused = focusKey()
  mount(header(), headerTemplate())
  if (focused) $(focused, header())?.focus({ preventScroll: true })
}

/** Wire the header once. Rendering afterwards never adds listeners again. */
export function initHeader(options) {
  state = { ...state, ...options }
  const root = header()
  if (!$('#sections-dialog')) {
    const dialog = document.createElement('dialog')
    dialog.id = 'sections-dialog'
    dialog.className = 'sections-dialog'
    dialog.setAttribute('aria-labelledby', 'sections-dialog-title')
    document.body.append(dialog)
    dialog.addEventListener('close', () => {
      const button = $('#menu-open')
      button?.setAttribute('aria-expanded', 'false')
      button?.focus()
      flushLater()
    })
    on(dialog, 'click', '.sections-close', () => dialog.close())
    on(dialog, 'click', 'a', () => dialog.close())
  }
  // 'close' does not bubble and the site dialog is created later: listen in the capture phase.
  document.addEventListener('close', (event) => { if (event.target.id === 'site-dialog') flushLater() }, true)

  on(root, 'click', '.sections-trigger', (event, button) => openPanel(button.dataset.section, button))
  on(root, 'keydown', '.sections-trigger', (event, button) => {
    if (event.key !== 'ArrowDown') return
    event.preventDefault()
    if (openGroup !== button.dataset.section) openPanel(button.dataset.section, button)
    $('a', panel())?.focus()
  })
  on(root, 'click', '#sections-panel .sections-close', () => closePanel(true))
  on(root, 'click', '#sections-panel a', () => closePanel())
  on(root, 'click', '#menu-open', openMobile)
  on(root, 'click', '#search-open', () => { closePanel(); closeLanguages(); state.onSearch() })
  on(root, 'click', '#language-open', (event, button) => {
    closePanel()
    const menu = $('#languages')
    if (!menu.hidden) return closeLanguages()
    menu.hidden = false
    button.setAttribute('aria-expanded', 'true')
    $('[aria-pressed="true"]', menu)?.focus()
  })
  on(root, 'click', '[data-lang]', async (event, button) => {
    closeLanguages()
    $('#language-open')?.focus({ preventScroll: true }) // the menu that had focus is now hidden
    await setLocale(button.dataset.lang)
  })
  on(document, 'click', '[data-theme-toggle]', toggleTheme)

  document.addEventListener('click', (event) => {
    if (!event.target.closest('#language-open, #languages')) closeLanguages()
    if (!event.target.closest('#sections-panel, .sections-trigger')) closePanel()
  })
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    if (!$('#languages')?.hidden) { closeLanguages(); $('#language-open')?.focus() }
    if (openGroup) { event.preventDefault(); closePanel(true) }
  })
  document.addEventListener('focusin', (event) => { if (openGroup && !event.target.closest('.nav-shell')) closePanel() })
  addEventListener('resize', () => (matchMedia('(max-width: 1100px)').matches ? closePanel() : placePanel()))
  // The panel scrolls with the header. Close it on scroll only when the keyboard is not inside it
  // (arrow keys, Space and focus() inside the panel scroll the page too).
  addEventListener('scroll', () => { if (!panel()?.contains(document.activeElement)) closePanel() }, { passive: true })
  onThemeChange(() => {
    const button = $('.theme-toggle', root)
    if (!button) return
    const hadFocus = document.activeElement === button
    button.outerHTML = String(themeButton())
    if (hadFocus) $('.theme-toggle', root)?.focus({ preventScroll: true })
  })

  renderHeader()
}
