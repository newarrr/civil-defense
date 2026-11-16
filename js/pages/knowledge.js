// Knowledge centre: the catalogue, the guide pages and the sixteen topic pages share this module.
// <body data-page="…" data-topic="…"> selects what is drawn. Text comes from /data/knowledge/<lang>.js.
import { $, $$, html, mount, on } from '../core/dom.js'
import { icon } from '../core/icons.js'
import { t, href, locales, localized } from '../core/i18n.js'
import { PAGES, TOPICS, TOPIC_CATEGORIES, topicFile } from '../core/site.js'
import { startPage, setTitle } from '../shell/shell.js'
import { pageHero, emergencyBar, tableOfContents } from '../shell/layout.js'
import { newsCard } from '../shell/news.js'
import { REVIEW_DATE, SOURCES, TOPIC_REFS, GLOSSARY } from '../../data/knowledge/index.js'
import { diagram } from './knowledge-diagrams.js'

const pageId = document.body.dataset.page // catalog | how | safety | training | sources | equipment | glossary | status | privacy | updates | topic
const topic = TOPICS.find((item) => item.id === document.body.dataset.topic)
const siteKey = { catalog: 'knowledge', status: 'status' }[pageId] || pageId
let category = 'all'
let text // the language bundle
const ui = (key) => text.ui[key]

// ---- building blocks -------------------------------------------------------------------

const paragraph = (value) => html`<p>${value}</p>`
const notice = () => html`<p class="notice">${ui('scope')}</p>`
const source = (id) => SOURCES.find((item) => item.id === id)

const citations = (refs) => html`
  <p class="source-ref">${ui('references')}:
    ${refs.map((id) => html`<a href="${source(id).url}" target="_blank" rel="noopener noreferrer">${text.sources[id]} ${icon('external')}</a>`)}
  </p>`

const section = (id, title, body, refs = []) => html`
  <section class="section" id="${id}">
    <h2>${title}</h2>
    ${body}
    ${refs.length ? citations(refs) : ''}
  </section>`

const referenceCard = (item) => html`
  <article class="reference">
    <h3>${text.sources[item.id]}</h3>
    <bdi>${item.publisher}</bdi>
    <small>${ui('published')}: ${item.date ? html`<time datetime="${item.date}">${item.date}</time>` : ui('unknown')}</small>
    <small>${ui('checked')}: <time datetime="${item.checkedAt}">${item.checkedAt}</time> · ${ui('reviewHuman')}</small>
    <a href="${item.url}" target="_blank" rel="noopener noreferrer">${ui('references')} ${icon('external')}</a>
    <span class="source-url" dir="ltr">${item.url}</span>
  </article>`

const references = (refs) => section('references', ui('references'), html`<div class="reference-list">${refs.map((id) => referenceCard(source(id)))}</div>`)

const topicCards = (topics) => html`
  <div class="cards">
    ${topics.map((item) => html`
      <a class="card" href="${href(topicFile(item.id))}">
        <span class="card-icon">${icon(item.icon)}</span>
        <span class="type">${t(`category.${item.category}`)}</span>
        <h3>${t(`topic.${item.id}`)}</h3>
        <p>${text.topics[item.id].mission}</p>
        <span class="read">${t('action.read')} ${icon('arrow', 'icon-forward')}</span>
      </a>`)}
  </div>`

const visibleTopics = () => TOPICS.filter((item) => category === 'all' || item.category === category)

const topicCatalogue = () => section('topics', ui('topics'), html`
  <div class="filter" role="group" aria-label="${ui('topics')}">
    ${['all', ...TOPIC_CATEGORIES].map((id) => html`<button type="button" data-category="${id}" aria-pressed="${category === id}">${id === 'all' ? t('filter.all') : t(`category.${id}`)}</button>`)}
  </div>
  <p class="catalog-status" id="catalog-status" role="status" aria-live="polite">${t('knowledge.count', { count: visibleTopics().length })}</p>
  <div id="topic-cards">${topicCards(visibleTopics())}</div>`)

const checklist = () => section('checklist', ui('checklist'), html`
  ${paragraph(ui('checklistNote'))}
  ${text.checklist.map((item, i) => html`<label class="check-item"><input type="checkbox" id="check-${i}"><span>${item}</span></label>`)}`, ['escape', 'alarms'])

const faq = () => section('faq', ui('faq'), html`
  <details><summary>${ui('faqQ')}</summary><div>${paragraph(ui('faqA'))}</div></details>
  <details><summary>${ui('faqCall')}</summary><div>${paragraph(ui('callInfo'))}</div></details>`, ['krg115', 'call'])

const figure = (kind, caption, label = caption) => html`<figure class="diagram">${diagram(kind, label)}<figcaption>${caption}</figcaption></figure>`

const table = (head, rows) => html`
  <div class="responsive-table"><table>
    <thead><tr>${head}</tr></thead>
    <tbody>${rows}</tbody>
  </table></div>`

// ---- pages -----------------------------------------------------------------------------

const BUILDERS = {
  catalog: () => [section('scope', ui('general'), notice()), topicCatalogue(), faq()],

  topic: () => {
    const body = text.topics[topic.id]
    const refs = TOPIC_REFS[topic.id]
    return [
      section('mission', ui('mission'), html`${paragraph(body.mission)}${notice()}`, refs),
      section('dangers', ui('dangers'), html`<p class="danger">${body.danger}</p>`),
      section('professionals', ui('professionals'), html`
        ${paragraph(ui('roleText'))}
        ${figure('zones', ui('diagram'), ui('publicZone'))}
        <ol><li>${ui('hazardZone')}</li><li>${ui('publicZone')}</li><li>${ui('responderZone')}</li></ol>`),
      section('tools', ui('tools'), html`${paragraph(body.tools)}<a class="text-link" href="${href('equipment.html')}">${t('page.equipment')} ${icon('arrow', 'icon-forward')}</a>`),
      section('before', ui('before'), paragraph(body.before)),
      section('during', ui('during'), html`<p class="danger">${body.during}</p>`),
      section('after', ui('after'), paragraph(ui('afterText'))),
      section('mistakes', ui('mistakes'), paragraph(ui('mistakesText'))),
      faq(),
      references(refs),
    ]
  },

  how: () => [
    section('scope', ui('general'), html`${notice()}${paragraph(ui('cycleNote'))}`),
    section('cycle', ui('cycle'), html`<ol class="steps">${text.process.map((step, i) => html`<li><h3><bdi>${i + 1}</bdi> ${step.title}</h3>${paragraph(step.body)}</li>`)}</ol>`, ['call', 'ifrc']),
    section('call', ui('faqCall'), paragraph(ui('callInfo')), ['call', 'krg115']),
    section('history', t('page.history'), html`${paragraph(t('history.teaser'))}<a class="button" href="${href('history.html')}">${t('page.history')} ${icon('arrow', 'icon-forward')}</a>`),
    topicCatalogue(),
    faq(),
    references(['call', 'ifrc', 'krg115']),
  ],

  safety: () => guide(topicCatalogue()),
  training: () => guide(section('training', t('page.training'), html`
    ${paragraph(text.topics['training-support'].during)}
    <a class="button" href="${href(topicFile('training-support'))}">${t('topic.training-support')} ${icon('arrow', 'icon-forward')}</a>`)),

  sources: () => [
    section('method', ui('sourceMethod'), html`<ol>${text.method.map((item) => html`<li>${item}</li>`)}</ol>`),
    section('limits', ui('limits'), html`${notice()}${paragraph(t('emergency.note'))}${paragraph(ui('newsNote'))}`),
    section('sources', ui('references'), html`<div class="reference-list">${SOURCES.map(referenceCard)}</div>`),
    section('review', ui('support'), paragraph(ui('supportText'))),
    faq(),
  ],

  equipment: () => [
    section('tools', t('page.equipment'), html`
      ${paragraph(ui('equipmentNote'))}
      ${figure('extinguisher', ui('diagram'), ui('equipmentNote'))}
      <ol class="parts">${text.parts.map((part, i) => html`<li><b>${i + 1}</b>${part}</li>`)}</ol>`, ['extinguisher']),
    section('classification', ui('classification'), paragraph(ui('classificationNote')), ['extinguisher', 'classificationuk']),
    section('alarms', ui('checklist'), html`${figure('alarm', ui('alarmDiagram'))}${paragraph(text.checklist[2])}${paragraph(ui('evacuationNote'))}`, ['alarms', 'escape']),
    faq(),
    references(['extinguisher', 'alarms']),
  ],

  glossary: () => [
    section('glossary', t('page.glossary'), html`
      <p class="notice">${ui('review')}</p>
      ${table(
        Object.entries(locales).map(([, locale]) => html`<th lang="${locale.tag}" dir="${locale.dir}">${locale.name}</th>`),
        GLOSSARY.map((row) => html`<tr>${Object.entries(locales).map(([id, locale]) => html`<td lang="${locale.tag}" dir="${locale.dir}">${row[id]}</td>`)}</tr>`),
      )}`),
    section('review', ui('support'), paragraph(ui('supportText'))),
    faq(),
  ],

  status: () => [
    section('status', ui('serviceState'), html`
      ${table(
        html`<th>${ui('feature')}</th><th>${ui('serviceState')}</th>`,
        [['draft', 'localDraft'], ['account', 'notActive'], ['submit', 'notActive'], ['centers', 'pending'], ['statsRow', 'pending'], ['newsRow', 'pending']].map(([a, b]) => html`<tr><td>${ui(a)}</td><td data-state="${a}">${ui(b)}</td></tr>`),
      )}
      <p class="notice">${ui('privacyText')}</p>
      <a class="button" href="${href('portal.html?portal=drafts#services')}">${ui('draft')}</a>`),
    section('centers', t('page.centers'), html`<div id="centers-list">${paragraph(ui('pending'))}</div>${paragraph(t('emergency.note'))}`),
    section('news', ui('references'), html`${paragraph(ui('newsNote'))}${referenceCard(source('krgArchive'))}`),
    faq(),
  ],

  privacy: () => [
    section('privacy', t('page.privacy'), html`${paragraph(ui('privacyText'))}${paragraph(ui('fontPrivacy'))}${paragraph(ui('scope'))}`),
    section('access', ui('accessTitle'), paragraph(ui('accessText'))),
    section('sources', t('page.sources'), html`${paragraph(ui('newsNote'))}<a class="text-link" href="${href('sources.html')}">${t('page.sources')} ${icon('arrow', 'icon-forward')}</a>`),
    faq(),
  ],

  updates: () => [
    section('news', t('nav.latestNews'), html`<div id="news-list">${paragraph(ui('newsNote'))}</div>`),
    section('updates', ui('updatesTitle'), paragraph(ui('updateText'))),
    section('sitemap', ui('sitemap'), html`
      <ul class="sitemap">
        ${Object.entries(PAGES).filter(([id]) => id !== 'call').map(([, page]) => html`<li><a href="${href(page.file)}">${t(page.label)}</a></li>`)}
        ${TOPICS.map((item) => html`<li><a href="${href(topicFile(item.id))}">${t(`topic.${item.id}`)}</a></li>`)}
      </ul>`),
    section('review', ui('support'), paragraph(ui('supportText'))),
    faq(),
  ],
}

/** Safety guide and training page share everything except their last block. */
function guide(lastBlock) {
  return [
    section('scope', ui('general'), notice()),
    checklist(),
    section('evacuation', ui('escapeDiagram'), html`${figure('escape', ui('escapeDiagram'))}${paragraph(ui('evacuationNote'))}`, ['escape']),
    section('settings', ui('settings'), html`<div class="settings-grid">${text.settings.map((item) => html`<article class="setting"><h3>${item.title}</h3>${paragraph(item.body)}</article>`)}</div>`, ['ifrc', 'krg115', 'cooking']),
    lastBlock,
    faq(),
    references(['escape', 'alarms', 'ifrc']),
  ]
}

// ---- render ----------------------------------------------------------------------------

function render({ main, data }) {
  text = data
  const title = topic ? t(`topic.${topic.id}`) : pageId === 'catalog' ? ui('topics') : t(PAGES[siteKey].label)
  setTitle(title)
  mount(main, html`
    ${pageHero({
      title,
      lead: topic ? text.topics[topic.id].mission : ui('intro'),
      chip: ui('general'),
      icon: topic ? topic.icon : PAGES[siteKey].icon,
      crumbs: topic || pageId !== 'catalog' ? [{ label: ui('brand'), url: 'knowledge.html' }] : [],
      meta: html`${ui('review')} · <time datetime="${REVIEW_DATE}">${REVIEW_DATE}</time>`,
    })}
    <div class="wrap">
      ${emergencyBar()}
      <div class="page-layout">
        ${tableOfContents()}
        <article class="content" id="page-content">${BUILDERS[pageId]()}</article>
      </div>
      <p class="print-meta">${ui('checked')}: ${REVIEW_DATE} · ${ui('review')}</p>
    </div>`)
  mount('#page-toc', $$('#page-content > section').map((el) => html`<a href="#${el.id}">${$('h2', el).textContent}</a>`))
}

function drawCatalogue() {
  const target = $('#topic-cards')
  if (!target) return
  mount(target, topicCards(visibleTopics()))
  $('#catalog-status').textContent = t('knowledge.count', { count: visibleTopics().length })
  $$('[data-category]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.category === category)))
}

function onCms({ cms }) {
  // The status table follows what staff have actually published in /admin.
  const state = (key, published) => { const cell = $(`[data-state="${key}"]`); if (cell && published) cell.textContent = ui('publishedNow') }
  state('centers', cms.centers.length)
  state('statsRow', cms.stats.length)
  state('newsRow', cms.news.length)
  const news = $('#news-list')
  if (news && cms.news.length) mount(news, html`<div class="news-grid">${cms.news.map(newsCard)}</div>`)
  const centers = $('#centers-list')
  if (centers && cms.centers.length) {
    mount(centers, table(
      ['name', 'district', 'phone', 'hours', 'map'].map((key) => html`<th>${t(`center.${key}`)}</th>`),
      cms.centers.map((center) => html`<tr>
        <td>${localized(center.name)}</td>
        <td>${localized(center.district)}</td>
        <td>${center.phone ? html`<a href="tel:${center.phone}" dir="ltr">${center.phone}</a>` : ''}</td>
        <td>${localized(center.hours)}</td>
        <td>${center.map ? html`<a href="${center.map}" target="_blank" rel="noopener noreferrer" aria-label="${t('center.map')}">${icon('external')}</a>` : ''}</td>
      </tr>`),
    ))
  }
}

// Printing shows every answer; restore the reader's open/closed state afterwards.
let printState = []
addEventListener('beforeprint', () => {
  printState = $$('details').map((node) => ({ node, open: node.open }))
  printState.forEach(({ node }) => { node.open = true })
})
addEventListener('afterprint', () => {
  printState.forEach(({ node, open }) => { node.open = open })
  printState = []
})

on(document, 'click', '[data-category]', (event, button) => { category = button.dataset.category; drawCatalogue() })
on(document, 'click', '#print-page', () => print())

startPage({
  id: topic ? 'topic' : siteKey,
  group: topic ? 'safety' : undefined,
  load: (locale) => import(`../../data/knowledge/${locale}.js`).then((module) => module.default),
  render,
  onCms,
})
