// Home page: hero with the three photographs, four quick links, four awareness cards,
// then — only when staff have published them in /admin — latest news and approved figures.
import { html, lines, mount } from '../core/dom.js'
import { icon } from '../core/icons.js'
import { t, href } from '../core/i18n.js'
import { EMERGENCY_NUMBER } from '../core/site.js'
import { startPage, setTitle } from '../shell/shell.js'
import { newsCard } from '../shell/news.js'

const GALLERY = [
  { className: 'gallery-community', icon: 'people', key: 'home.rescue', url: 'topic-road-rescue.html' },
  { className: 'gallery-training', icon: 'tree', key: 'home.nature', url: 'topic-wildfire.html' },
]
const QUICK_LINKS = [
  { icon: 'leaf', key: 'home.environment', url: 'topic-wildfire.html' },
  { icon: 'helmet', key: 'home.response', url: 'knowledge.html' },
  { icon: 'shield', key: 'home.prevention', url: 'safety-guide.html' },
  { icon: 'people', key: 'home.community', url: 'portal.html#contact' },
]
const FEATURES = [
  { icon: 'house', key: 'home.homeSafety', image: 'home', url: 'topic-home-fires.html' },
  { icon: 'extinguisher', key: 'home.extinguisher', image: 'extinguisher', url: 'equipment.html' },
  { icon: 'people', key: 'home.education', image: 'education', url: 'training.html' },
  { icon: 'rain', key: 'home.weather', image: 'flood', url: 'topic-floods.html' },
]
const NEWS_ON_HOME = 3

const template = () => html`
  <section class="hero">
    <div class="field-photo" role="img" aria-label="${t('home.photo')}"></div>
    <div class="hero-gallery">
      ${GALLERY.map((item) => html`
        <div class="gallery-photo ${item.className}">
          <a href="${href(item.url)}" class="gallery-link">${icon(item.icon)}<span class="gallery-caption"><strong>${t(item.key)}</strong><small>${t(`${item.key}Desc`)}</small></span></a>
        </div>`)}
    </div>
    <div class="hero-copy">
      <div class="kicker">${t('home.kicker')}</div>
      <h1><span>${t('home.title')} <em>${t('home.titleAccent')}</em></span><span>${t('home.titleEnd')}</span></h1>
      <h2>${lines(t('home.intro'))}</h2>
      <a class="hero-emergency" href="tel:${EMERGENCY_NUMBER}">${icon('phone')}<b dir="ltr">${EMERGENCY_NUMBER}</b><i aria-hidden="true"></i><span>${t('action.emergencyCall')}</span></a>
    </div>
  </section>
  <section class="service-strip" aria-label="${t('nav.services')}">
    ${QUICK_LINKS.map((item) => html`<a href="${href(item.url)}"><span class="quick-icon">${icon(item.icon)}</span><span><strong>${lines(t(item.key))}</strong><small>${t(`${item.key}Sub`)}</small></span></a>`)}
  </section>
  <section class="reference-features">
    <div class="community-section-head">
      <a href="${href('knowledge.html')}"><span aria-hidden="true">←</span><span>${t('home.allTopics')}</span></a>
      <h2>${t('home.heading')}</h2>
    </div>
    <div class="community-feature-grid">
      ${FEATURES.map((item) => html`
        <a class="feature-card" href="${href(item.url)}" style="background-image:url('assets/photos/${item.image}.webp')">
          <div class="feature-copy"><h2>${lines(t(item.key))}</h2><p>${lines(t(`${item.key}Desc`))}</p></div>
          <span class="feature-badge">${icon(item.icon)}</span>
        </a>`)}
    </div>
  </section>
  <section class="home-news" id="news" aria-labelledby="home-news-title" hidden></section>
  <section class="home-stats" aria-labelledby="home-stats-title" hidden></section>`

function drawNews(main, news) {
  const section = main.querySelector('.home-news')
  section.hidden = !news.length
  if (!news.length) return
  mount(section, html`
    <div class="community-section-head">
      <a href="${href('updates.html#news')}"><span aria-hidden="true">←</span><span>${t('home.allNews')}</span></a>
      <h2 id="home-news-title">${t('nav.latestNews')}</h2>
    </div>
    <div class="news-grid">${news.slice(0, NEWS_ON_HOME).map(newsCard)}</div>`)
}

function drawStats(main, stats) {
  const section = main.querySelector('.home-stats')
  section.hidden = !stats.length
  if (!stats.length) return
  mount(section, html`
    <h2 id="home-stats-title" class="sr-only">${t('home.statsTitle')}</h2>
    <dl class="stats-row">${stats.map((stat) => html`<div class="stat"><dt>${t(`stat.${stat.key}`)}</dt><dd><b dir="ltr">${stat.value}</b>${stat.period ? html`<small dir="ltr">${stat.period}</small>` : ''}</dd></div>`)}</dl>`)
}

startPage({
  id: 'home',
  invitation: true,
  render({ main }) {
    setTitle('')
    mount(main, template())
  },
  onCms({ main, cms }) {
    drawNews(main, cms.news)
    drawStats(main, cms.stats)
  },
})
