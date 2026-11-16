// News published from /admin: public alert bar, news cards and the news reader dialog.
import { $, html, mount } from '../core/dom.js'
import { icon } from '../core/icons.js'
import { t, localized, formatDate } from '../core/i18n.js'
import { textBlocks } from '../core/cms.js'
import { openDialog, dialogTitle } from './dialog.js'

let news = []

export const setNews = (items) => { news = items }
export const findNews = (slug) => news.find((item) => item.slug === slug)

/** Coloured bar above the header. Level "warning" is announced immediately by screen readers. */
export function renderAlerts(alerts) {
  let bar = $('#site-alerts')
  if (!alerts.length) return bar?.remove()
  if (!bar) {
    bar = document.createElement('div')
    bar.id = 'site-alerts'
    bar.className = 'site-alerts'
    bar.setAttribute('role', 'region')
    document.body.prepend(bar)
  }
  bar.setAttribute('aria-label', t('alerts.label'))
  mount(bar, alerts.map((alert) => html`<p class="site-alert site-alert--${alert.level}"${alert.level === 'warning' ? html` role="alert"` : ''}>${icon('hazard')}<span><strong>${localized(alert.title)}</strong> — ${localized(alert.message)}</span></p>`))
}

const dateTag = (iso) => html`<time datetime="${iso}">${formatDate(iso)}</time>`

/** Card used on the home page and in the updates list. */
export const newsCard = (item) => html`
  <a class="news-card" href="#news-${item.slug}">
    <span class="news-card-media"${item.image ? html` style="background-image:url('${item.image}')"` : ''}>${item.image ? '' : icon('news')}</span>
    <span class="news-card-body">
      <span class="news-card-meta">${t(`news.category.${item.category}`)} · ${dateTag(item.date)}</span>
      <strong>${localized(item.title)}</strong>
      ${localized(item.excerpt) ? html`<span class="news-card-excerpt">${localized(item.excerpt)}</span>` : ''}
    </span>
  </a>`

const block = (part) => part.type === 'list'
  ? html`<ul>${part.items.map((text) => html`<li>${text}</li>`)}</ul>`
  : html`<p>${part.lines.map((line, i) => (i ? html`<br>${line}` : line))}</p>`

// A news video is a YouTube or Vimeo player. Nothing is requested from that site until the visitor
// presses play (the privacy page says so); then the player replaces the button.
document.addEventListener('click', (event) => {
  const button = event.target instanceof Element ? event.target.closest('.news-video-play') : null
  if (!button) return
  const frame = document.createElement('iframe')
  const src = new URL(button.dataset.video) // always an embedVideo() address (js/core/video.js)
  src.searchParams.set('autoplay', '1') // the visitor already pressed play once
  frame.src = src.href
  frame.title = button.textContent.trim()
  frame.allow = 'autoplay; fullscreen; picture-in-picture'
  frame.allowFullscreen = true
  frame.referrerPolicy = 'strict-origin-when-cross-origin'
  button.replaceWith(frame)
  frame.focus()
})

/** Open one news item in the dialog and reflect it in the address bar so it can be shared. */
export function openNews(slug) {
  const item = findNews(slug)
  if (!item) return false
  const title = localized(item.title)
  // Closing puts back the fragment the page had (#faq…), so Back still returns to that section.
  const before = location.hash.startsWith('#news-') ? '' : location.hash
  history.replaceState(history.state, '', `${location.pathname}${location.search}#news-${slug}`)
  openDialog(html`
    <article class="news-article">
      <p class="news-card-meta">${t(`news.category.${item.category}`)} · ${dateTag(item.date)}</p>
      ${dialogTitle(title)}
      ${item.image ? html`<img class="news-article-image" src="${item.image}" alt="${item.imageAlt}">` : ''}
      ${item.video ? html`<div class="news-article-video"><button type="button" class="news-video-play" data-video="${item.video.url}">${icon('play')}<span>${t('news.playVideo', { site: item.video.host })}</span></button></div>` : ''}
      <div class="news-article-body">${textBlocks(localized(item.body)).map(block)}</div>
      ${item.gallery.length ? html`<div class="news-article-gallery">${item.gallery.map((image, i, all) => html`<a href="${image}" target="_blank" rel="noopener noreferrer"><img src="${image}" alt="${t('news.galleryImage', { n: i + 1, total: all.length })}" loading="lazy"></a>`)}</div>` : ''}
    </article>`, {
    wide: true,
    onClose: () => { if (location.hash === `#news-${slug}`) history.replaceState(history.state, '', location.pathname + location.search + before) },
  })
  return true
}
