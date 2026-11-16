// Service guide (portal.html). One page, six sections chosen by the #hash:
// services (default) · about · awareness · centers · faq · contact.
// Request drafts are kept in this browser only (see core/drafts.js); nothing is sent anywhere.
import { $, $$, html, lines, mount, on } from '../core/dom.js'
import { icon } from '../core/icons.js'
import { t, href, formatDate } from '../core/i18n.js'
import { PAGES, EMERGENCY_NUMBER, MINISTRY_URL, GOVERNMENT_NEWS_URL } from '../core/site.js'
import { DISTRICTS, readDrafts, saveDraft, deleteDraft, downloadDraft } from '../core/drafts.js'
import { startPage, setTitle } from '../shell/shell.js'
import { renderHeader } from '../shell/header.js'
import { pageHero, emergencyBar } from '../shell/layout.js'
import { openDialog, closeDialog, dialogTitle } from '../shell/dialog.js'
import { toast } from '../shell/toast.js'

// `tab` is the short label shown in the section tabs; the page title comes from PAGES[id].label.
const ROUTES = {
  services: { icon: 'document', group: 'services', tab: 'nav.services', related: ['status', 'equipment', 'training'] },
  about: { icon: 'shield-check', group: 'about', tab: 'nav.about', related: ['how', 'history', 'sources'] },
  awareness: { icon: 'book', group: 'safety', tab: 'portal.tab.awareness', related: ['safety', 'equipment', 'training'] },
  centers: { icon: 'pin', group: 'services', tab: 'portal.tab.centers', related: ['status', 'sources', 'how'] },
  faq: { icon: 'chat', group: 'contact', tab: 'portal.tab.faq', related: ['how', 'safety', 'status'] },
  contact: { icon: 'people', group: 'contact', tab: 'portal.tab.contact', related: ['privacy', 'sources', 'status'] },
}
const SERVICES = [
  { id: 'permit', group: 'business', icon: 'document' },
  { id: 'inspection', group: 'business', icon: 'building' },
  { id: 'training', group: 'citizen', icon: 'school' },
  { id: 'volunteer', group: 'citizen', icon: 'people' },
]
// Official publications summarised in the awareness section.
const ARTICLES = [
  { id: 'emergency', icon: 'phone', date: '2025-03', url: 'https://gov.krd/dmi-ar/activities/news-and-press-releases/2025/march/لتعزيز-إجراءات-السلامة-خلال-عيد-الفطر-مديرية-الدفاع-المدني-تصدر-تعليمات-لمواطني-الاقليم-والسياح/' },
  { id: 'guidelines', icon: 'book', date: '2026-08-18', url: GOVERNMENT_NEWS_URL },
  { id: 'ministry', icon: 'shield', date: '', url: MINISTRY_URL },
]
const SOURCES_CHECKED = '2026-10-14'

let filter = 'all'
// The open section. Only a hash that names a section changes it (an empty one means Services, as
// on first load): #main (skip link) and #news-… (news reader, which puts the old hash back when it
// closes) leave the visitor where they are.
const isRoute = (hash) => Object.hasOwn(ROUTES, hash)
let current = isRoute(location.hash.slice(1)) ? location.hash.slice(1) : 'services'
const route = () => current
const service = (id) => SERVICES.find((item) => item.id === id)

// ---- sections --------------------------------------------------------------------------

const heading = (kicker, title, description = '') => html`
  <header class="section-heading">
    <p class="eyebrow">${kicker}</p>
    <h2>${lines(title)}</h2>
    ${description ? html`<p>${description}</p>` : ''}
  </header>`

const serviceCards = () => SERVICES.filter((item) => filter === 'all' || item.group === filter).map((item) => html`
  <button type="button" class="service-card" data-service="${item.id}">
    <span class="card-icon">${icon(item.icon)}</span>
    <h3>${t(`service.${item.id}.title`)}</h3>
    <span class="chip chip--pending">${t('status.pending')}</span>
    <p>${t(`service.${item.id}.desc`)}</p>
    <span class="card-bottom"><span>${t(item.group === 'business' ? 'portal.businesses' : 'portal.citizens')}</span>${icon('arrow', 'icon-forward')}</span>
  </button>`)

const SECTIONS = {
  services: () => html`
    ${heading(t('portal.servicesKicker'), t('portal.servicesTitle'))}
    <div class="section-tools">
      <div class="filter" role="group" aria-label="${t('nav.services')}">
        ${[['all', 'filter.all'], ['citizen', 'portal.citizens'], ['business', 'portal.businesses']].map(([id, key]) => html`<button type="button" data-filter="${id}" aria-pressed="${filter === id}">${t(key)}</button>`)}
      </div>
      <button type="button" class="button button--ghost" data-action="drafts">${icon('document')}${t('draft.mine')}</button>
    </div>
    <div class="service-grid" id="service-grid">${serviceCards()}</div>
    <p class="notice">${t('portal.serviceNote')}</p>`,

  about: () => html`
    <div class="about-grid">
      <div class="about-copy">
        ${heading(t('portal.aboutKicker'), t('portal.aboutTitle'))}
        <div class="values">
          ${[['shield-check', 1], ['people', 2], ['check', 3]].map(([name, n]) => html`<div class="value">${icon(name)}<strong>${t(`portal.value${n}`)}</strong><small>${t(`portal.value${n}Desc`)}</small></div>`)}
        </div>
        <a class="button" href="${href('history.html')}">${t('page.history')}${icon('arrow', 'icon-forward')}</a>
      </div>
      <figure class="about-visual">
        <img src="assets/photos/community.webp" alt="" width="640" height="480" loading="lazy">
        <figcaption>${t('portal.illustrative')}</figcaption>
      </figure>
    </div>`,

  awareness: () => html`
    ${heading(t('portal.awarenessKicker'), t('portal.awarenessTitle'))}
    <div class="article-grid">
      ${ARTICLES.map((item) => html`
        <button type="button" class="article-card" data-article="${item.id}">
          <span class="card-icon">${icon(item.icon)}</span>
          <span class="type">${t('source.official')}${item.date ? html` · <bdi dir="ltr">${item.date}</bdi>` : ''}</span>
          <h3>${t(`source.${item.id}.title`)}</h3>
          <p>${t(`source.${item.id}.desc`)}</p>
          <span class="read">${t('action.details')} ${icon('arrow', 'icon-forward')}</span>
        </button>`)}
    </div>
    <a class="text-link" href="${GOVERNMENT_NEWS_URL}" target="_blank" rel="noopener noreferrer">${t('portal.officialGuide')} ${icon('external')}</a>`,

  centers: () => html`
    ${heading(t('portal.centerKicker'), t('portal.centerTitle'))}
    <a class="button" href="${href(PAGES.centers.file)}">${t('page.centers')}${icon('arrow', 'icon-forward')}</a>`,

  faq: () => html`
    ${heading(t('portal.faqKicker'), t('portal.faqTitle'))}
    <div class="faq-list">${[1, 2, 3, 4].map((n) => html`<details><summary>${t(`faq.q${n}`)}</summary><p>${t(`faq.a${n}`)}</p></details>`)}</div>`,

  contact: () => html`
    <div class="contact-grid">
      <article class="contact-card contact-card--emergency">
        <h2>${t('contact.emergency')}</h2>
        <a class="phone-number" href="tel:${EMERGENCY_NUMBER}" dir="ltr">${EMERGENCY_NUMBER}</a>
        <p>${t('contact.emergencyDesc')}</p>
      </article>
      <article class="contact-card">
        <h2>${t('contact.officialSite')}</h2>
        <p>${t('contact.officialDesc')}</p>
        <a class="text-link" href="${MINISTRY_URL}" target="_blank" rel="noopener noreferrer">${t('portal.officialGuide')} ${icon('external')}</a>
      </article>
      <article class="contact-card">
        <h2>${t('contact.directorate')}</h2>
        <p>${t('contact.pending')}</p>
        <a class="text-link" href="#faq">${t('page.faq')} ${icon('arrow', 'icon-forward')}</a>
      </article>
    </div>`,
}

// ---- dialogs ---------------------------------------------------------------------------

function openService(id) {
  if (!service(id)) return
  openDialog(html`
    ${dialogTitle(t(`service.${id}.title`))}
    <p class="dialog-description">${t(`service.${id}.desc`)}</p>
    <p class="notice">${t('draft.requirementsNote')}</p>
    <div class="dialog-actions"><button type="button" class="button" data-prepare="${id}">${icon('document')}${t('draft.start')}</button></div>`)
}

function openDraftForm(serviceId, draft = null) {
  if (!service(serviceId)) return
  openDialog(html`
    ${dialogTitle(t('draft.start'))}
    <p class="dialog-description">${t(`service.${serviceId}.title`)}</p>
    <p class="notice">${t('draft.notice')}</p>
    <form id="draft-form" class="form-grid" data-service="${serviceId}" data-id="${draft?.id || ''}">
      <label class="field field--full">${t('draft.facility')}<input name="title" required pattern=".*\\S.*" maxlength="120" value="${draft?.title || ''}" autocomplete="organization"></label>
      <label class="field">${t('draft.requester')}<input name="name" maxlength="100" value="${draft?.name || ''}" autocomplete="name"></label>
      <label class="field">${t('draft.district')}
        <select name="district">${DISTRICTS.map((id) => html`<option value="${id}"${draft?.district === id ? html` selected` : ''}>${t(`district.${id}`)}</option>`)}</select>
      </label>
      <label class="field field--full">${t('draft.address')}<input name="address" maxlength="200" value="${draft?.address || ''}" autocomplete="off"></label>
      <label class="field field--full">${t('draft.notes')}<textarea name="notes" maxlength="2000" rows="3">${draft?.notes || ''}</textarea></label>
      <div class="form-footer field--full"><small>${t('draft.privacyHint')}</small><button class="button" type="submit">${icon('check')}${t('draft.save')}</button></div>
    </form>`)
}

function openDrafts() {
  const drafts = readDrafts()
  if (drafts === null) return toast(t('draft.storageError'))
  openDialog(html`
    ${dialogTitle(t('draft.mine'))}
    <p class="notice">${t('draft.notice')}</p>
    ${drafts.length
      ? drafts.map((draft) => html`
        <article class="draft-card">
          <h3>${draft.title}</h3>
          <p class="draft-meta"><span>${t(`service.${draft.service}.title`)}</span><span class="chip">${t('draft.label')}</span><time datetime="${draft.updatedAt}">${formatDate(draft.updatedAt)}</time></p>
          <div class="draft-actions">
            <button type="button" data-edit="${draft.id}">${t('draft.edit')}</button>
            <button type="button" data-download="${draft.id}">${t('draft.download')}</button>
            <button type="button" data-delete="${draft.id}">${t('draft.delete')}</button>
          </div>
        </article>`)
      : html`<p class="empty-state">${icon('document')}${t('draft.empty')}</p>`}
    <div class="dialog-actions"><button type="button" class="button" data-action="new-draft">${t('draft.new')}${icon('arrow', 'icon-forward')}</button></div>`)
}

function confirmDelete(id) {
  openDialog(html`
    ${dialogTitle(t('draft.deleteConfirm'))}
    <p class="dialog-description">${t('draft.notice')}</p>
    <div class="dialog-actions">
      <button type="button" class="button button--ghost" data-action="drafts">${t('action.cancel')}</button>
      <button type="button" class="button" data-confirm-delete="${id}">${t('draft.delete')}</button>
    </div>`)
}

function openArticle(id) {
  const item = ARTICLES.find((article) => article.id === id)
  if (!item) return
  openDialog(html`
    ${dialogTitle(t(`source.${id}.title`))}
    <p class="source-meta">${t('source.checked')} <time datetime="${SOURCES_CHECKED}">${SOURCES_CHECKED}</time></p>
    <p>${t(`source.${id}.body`)}</p>
    <a class="text-link" href="${item.url}" target="_blank" rel="noopener noreferrer">${t('portal.officialGuide')} ${icon('external')}</a>`)
}

// ---- render ----------------------------------------------------------------------------

function render({ main }) {
  const id = route()
  const title = t(PAGES[id].label)
  setTitle(title)
  mount(main, html`
    ${pageHero({ title, lead: t(`portal.${id}Lead`), icon: ROUTES[id].icon })}
    <div class="wrap">
      <nav class="tabs no-print" aria-label="${t('page.services')}">
        ${Object.keys(ROUTES).map((key) => html`<a href="#${key}"${key === id ? html` aria-current="page"` : ''}>${t(ROUTES[key].tab)}</a>`)}
      </nav>
      ${emergencyBar()}
      <section class="portal-section" id="${id}" data-route="${id}">${SECTIONS[id]()}</section>
      <section class="related" aria-labelledby="related-title">
        <h2 id="related-title">${t('portal.related')}</h2>
        <div class="link-grid">
          ${ROUTES[id].related.map((key) => html`<a class="link-card" href="${href(PAGES[key].file)}"><span class="card-icon">${icon(PAGES[key].icon)}</span><span>${t(PAGES[key].label)}</span>${icon('chevron', 'icon-forward')}</a>`)}
        </div>
      </section>
    </div>`)
}

on(document, 'click', '[data-filter]', (event, button) => {
  filter = button.dataset.filter
  $$('[data-filter]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)))
  mount('#service-grid', serviceCards())
})
on(document, 'click', '.service-card', (event, button) => openService(button.dataset.service))
on(document, 'click', '[data-prepare]', (event, button) => openDraftForm(button.dataset.prepare))
on(document, 'click', '[data-article]', (event, button) => openArticle(button.dataset.article))
on(document, 'click', '[data-action="drafts"]', openDrafts)
on(document, 'click', '[data-action="new-draft"]', () => {
  closeDialog()
  if (current !== 'services') { location.hash = 'services'; return } // hashchange redraws and focuses the title
  // Already on Services (the hash does not change, so nothing redraws): take the visitor to the services.
  $('#services')?.scrollIntoView()
  $('#services .service-card')?.focus({ preventScroll: true })
})
on(document, 'click', '[data-edit]', (event, button) => {
  const draft = readDrafts()?.find((item) => item.id === button.dataset.edit)
  if (draft) openDraftForm(draft.service, draft)
})
on(document, 'click', '[data-download]', (event, button) => downloadDraft(button.dataset.download))
on(document, 'click', '[data-delete]', (event, button) => confirmDelete(button.dataset.delete))
on(document, 'click', '[data-confirm-delete]', (event, button) => {
  if (deleteDraft(button.dataset.confirmDelete)) { openDrafts(); toast(t('draft.deleted')) } else toast(t('draft.storageError'))
})
on(document, 'submit', '#draft-form', (event, form) => {
  event.preventDefault()
  const values = Object.fromEntries(new FormData(form))
  const saved = saveDraft({ id: form.dataset.id, service: form.dataset.service, ...values })
  if (saved) { openDrafts(); toast(t('draft.saved')) } else toast(t('draft.storageError'))
})

addEventListener('hashchange', () => {
  // Back to the bare address shows Services, as on first load. (Closing the news reader clears the
  // hash with replaceState, which fires no hashchange, so the open section stays.)
  const next = location.hash.slice(1) || 'services'
  if (!isRoute(next) || next === current) return
  current = next
  renderHeader({ group: ROUTES[current].group })
  render({ main: $('#main') })
  scrollTo({ top: 0, behavior: 'instant' })
  // The tab that was pressed was redrawn: move keyboard focus to the new section's title.
  const title = $('#main h1')
  title?.setAttribute('tabindex', '-1')
  title?.focus({ preventScroll: true })
})

startPage({ id: 'services', group: ROUTES[route()].group, render }).then(() => {
  const params = new URLSearchParams(location.search)
  if (params.get('portal') === 'drafts') openDrafts()
  else if (service(params.get('service'))) openService(params.get('service'))
})
