// History of civil defence: sourced milestones on an interactive timeline (world / Iraq / local).
import { $, $$, html, mount, on } from '../core/dom.js'
import { icon } from '../core/icons.js'
import { t, href } from '../core/i18n.js'
import { startPage, setTitle } from '../shell/shell.js'
import { CHECKED_DATE, EVENTS, REFS } from '../../data/history/index.js'

const TRACKS = ['world', 'iraq', 'local']
const requested = new URLSearchParams(location.search).get('track')
let track = TRACKS.includes(requested) ? requested : 'all'
const opened = new Set(EVENTS.map((event) => event.id))
let text
const ui = (key) => text.ui[key]

const visible = () => EVENTS.filter((event) => track === 'all' || event.track === track)
const allOpen = () => visible().every((event) => opened.has(event.id))

const sourceLink = (id) => html`
  <a class="h-source" href="${REFS[id].url}" target="_blank" rel="noopener noreferrer">${ui('source')} · <bdi>${REFS[id].publisher}</bdi>${icon('external')}</a>`

const milestone = (event) => html`
  <li class="h-milestone" data-track="${event.track}" id="milestone-${event.id}">
    <div class="h-event-top"><time class="h-year" datetime="${event.date}">${event.year}</time><span class="h-track">${ui(event.track)}</span></div>
    <h3>${text.events[event.id].title}</h3>
    <details data-history-event="${event.id}"${opened.has(event.id) ? html` open` : ''}>
      <summary>${ui('explanation')}</summary>
      <p>${text.events[event.id].body}</p>
      ${sourceLink(event.ref)}
    </details>
  </li>`

function syncControls() {
  $('#history-count').textContent = `${visible().length} / ${EVENTS.length} · ${ui('steps')}`
  $$('[data-history-track]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.historyTrack === track)))
  const expand = $('#history-expand')
  expand.textContent = ui(allOpen() ? 'collapse' : 'expand')
  expand.setAttribute('aria-expanded', String(allOpen()))
}

function drawTimeline() {
  mount('#history-timeline', visible().map(milestone))
  syncControls()
}

function saveTrack() {
  const url = new URL(location.href)
  if (track === 'all') url.searchParams.delete('track')
  else url.searchParams.set('track', track)
  history.replaceState(history.state, '', url)
}

function render({ main, data }) {
  text = data
  setTitle(ui('kicker'))
  const first = EVENTS[0].year
  const last = EVENTS[EVENTS.length - 1].year
  mount(main, html`
    <div class="wrap history">
      <nav class="breadcrumbs" aria-label="${t('nav.breadcrumbs')}"><a href="${href('index.html')}">${t('nav.home')}</a><span aria-hidden="true">/</span><span aria-current="page">${ui('kicker')}</span></nav>
      <section class="h-hero" aria-labelledby="history-title">
        <div>
          <p class="h-kicker">${ui('kicker')}</p>
          <h1 id="history-title">${ui('title')}</h1>
          <p class="h-intro">${ui('intro')}</p>
          <a class="h-primary" href="#history-story">${ui('start')}<span aria-hidden="true">↓</span></a>
        </div>
        <div class="h-years" aria-hidden="true"><strong>${first}</strong><span>↓</span><strong>${last}</strong><small>${ui('timeline')}</small></div>
      </section>
      <div class="h-stats">
        <div><b>${EVENTS.length}</b><span>${ui('steps')}</span></div>
        <div><b>${TRACKS.length}</b><span>${ui('tracks')}</span></div>
        <div><b>${Object.keys(REFS).length}</b><span>${ui('sources')}</span></div>
      </div>
      <section class="h-definition h-section" aria-labelledby="history-definition-title">
        <div class="h-surface"><h2 id="history-definition-title">${ui('definition')}</h2><p>${ui('definitionText')}</p>${sourceLink('mandate')}</div>
        <aside class="h-surface h-context"><h2>${ui('scope')}</h2><p>${ui('scopeText')}</p></aside>
      </section>
      <section class="h-section" aria-labelledby="history-diagram-title">
        <h2 id="history-diagram-title">${ui('diagram')}</h2>
        <ol class="h-flow">${text.diagram.map((step, i) => html`<li><b aria-hidden="true">${i + 1}</b><span>${step}</span></li>`)}</ol>
        <p class="h-caption">${ui('diagramNote')}</p>
      </section>
      <section class="h-section" id="history-story" aria-labelledby="history-story-title">
        <h2 id="history-story-title">${ui('timeline')}</h2>
        <p class="h-lead">${ui('timelineHint')}</p>
        <div class="h-tools no-print">
          <div class="h-filters" role="group" aria-label="${ui('tracks')}">
            ${['all', ...TRACKS].map((id) => html`<button type="button" data-history-track="${id}" aria-pressed="${track === id}">${ui(id)}</button>`)}
          </div>
          <button type="button" class="h-expand" id="history-expand" aria-controls="history-timeline"></button>
        </div>
        <p class="h-count" id="history-count" aria-live="polite" role="status"></p>
        <ol class="h-timeline" id="history-timeline"></ol>
      </section>
      <section class="h-section h-local-grid" aria-labelledby="history-local-title">
        <div class="h-surface h-local-note"><span class="h-local-badge">${ui('noFounding')}</span><h2 id="history-local-title">${ui('localTitle')}</h2><p>${ui('localText')}</p>${sourceLink('duhok')}</div>
        <div class="h-surface"><h2>${ui('archiveTitle')}</h2><p>${ui('archiveText')}</p></div>
      </section>
      <section class="h-section h-today" aria-labelledby="history-today-title">
        <h2 id="history-today-title">${ui('today')}</h2>
        <p>${ui('todayText')}</p>
        <a class="h-primary" href="${href('how-it-works.html')}">${ui('how')}${icon('arrow', 'icon-forward')}</a>
      </section>
      <section class="h-section h-faq" aria-labelledby="history-faq-title">
        <h2 id="history-faq-title">${ui('faqTitle')}</h2>
        ${[1, 2, 3].map((i) => html`<details><summary>${ui(`q${i}`)}</summary><p>${ui(`a${i}`)}</p></details>`)}
      </section>
      <section class="h-section" id="history-sources" aria-labelledby="history-sources-title">
        <h2 id="history-sources-title">${ui('sources')}</h2>
        <div class="h-source-grid">
          ${Object.entries(REFS).map(([id, ref]) => html`<article class="h-reference"><bdi>${ref.publisher}</bdi><h3>${text.refs[id]}</h3><a href="${ref.url}" target="_blank" rel="noopener noreferrer">${ui('source')} ${icon('external')}</a></article>`)}
        </div>
        <p class="h-review"><time datetime="${CHECKED_DATE}">${ui('sourceNote')}</time></p>
        <div class="h-bottom-actions no-print"><button type="button" class="button button--ghost" id="history-print">${icon('print')}${t('action.print')}</button></div>
      </section>
    </div>`)
  drawTimeline()
}

on(document, 'click', '[data-history-track]', (event, button) => { track = button.dataset.historyTrack; saveTrack(); drawTimeline() })
on(document, 'click', '#history-expand', () => {
  const open = allOpen()
  for (const event of visible()) open ? opened.delete(event.id) : opened.add(event.id)
  drawTimeline()
})
on(document, 'click', '#history-print', () => print())
// <details> toggle events do not bubble: listen in the capture phase.
document.addEventListener('toggle', (event) => {
  const id = event.target.dataset?.historyEvent
  if (!id) return
  event.target.open ? opened.add(id) : opened.delete(id)
  syncControls()
}, true)

// Print the full story regardless of the current filter, then restore the reader's view.
let beforePrint = null
addEventListener('beforeprint', () => {
  beforePrint = { track, opened: [...opened], faq: $$('.h-faq details').map((node) => node.open) }
  track = 'all'
  EVENTS.forEach((event) => opened.add(event.id))
  drawTimeline()
  $$('.h-faq details').forEach((node) => { node.open = true })
})
addEventListener('afterprint', () => {
  if (!beforePrint) return
  track = beforePrint.track
  opened.clear()
  beforePrint.opened.forEach((id) => opened.add(id))
  drawTimeline()
  $$('.h-faq details').forEach((node, i) => { node.open = beforePrint.faq[i] })
  beforePrint = null
})

startPage({
  id: 'history',
  load: (locale) => import(`../../data/history/${locale}.js`).then((module) => module.default),
  render,
})
