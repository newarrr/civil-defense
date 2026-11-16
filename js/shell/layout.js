// Building blocks shared by every interior page: page hero with breadcrumbs,
// the emergency bar and the "on this page" column.
import { html } from '../core/dom.js'
import { icon } from '../core/icons.js'
import { t, href } from '../core/i18n.js'
import { EMERGENCY_NUMBER } from '../core/site.js'

/**
 * Title block at the top of an interior page.
 * crumbs: [{ label, url }] between "Home" and the current page.
 */
export const pageHero = ({ title, lead = '', chip = '', icon: emblem = 'shield-check', crumbs = [], meta = '' }) => html`
  <section class="page-hero">
    <div class="wrap page-hero-inner">
      <div class="page-hero-copy">
        <nav class="breadcrumbs" aria-label="${t('nav.breadcrumbs')}">
          <a href="${href('index.html')}">${t('nav.home')}</a>
          ${crumbs.map((crumb) => html`<span aria-hidden="true">/</span><a href="${href(crumb.url)}">${crumb.label}</a>`)}
          <span aria-hidden="true">/</span><span aria-current="page">${title}</span>
        </nav>
        ${chip ? html`<span class="chip">${chip}</span>` : ''}
        <h1>${title}</h1>
        ${lead ? html`<p class="lead">${lead}</p>` : ''}
        ${meta ? html`<p class="page-hero-meta">${meta}</p>` : ''}
      </div>
      <div class="page-emblem" aria-hidden="true">${icon(emblem)}</div>
    </div>
  </section>`

/** "In danger: call 115" — shown near the top of every interior page. */
export const emergencyBar = ({ title = t('emergency.title'), note = t('emergency.note') } = {}) => html`
  <aside class="emergency-bar" aria-label="${title}">
    <div><strong>${title}</strong><p>${note}</p></div>
    <a href="tel:${EMERGENCY_NUMBER}" aria-label="${t('action.emergencyCall')} ${EMERGENCY_NUMBER}">${icon('phone')}<bdi dir="ltr">${EMERGENCY_NUMBER}</bdi></a>
  </aside>`

/** Sticky list of the page's sections; the page fills #page-toc after rendering. */
export const tableOfContents = () => html`
  <aside class="toc no-print">
    <h2>${t('nav.onThisPage')}</h2>
    <nav class="toc-links" id="page-toc" aria-label="${t('nav.onThisPage')}"></nav>
    <button type="button" class="button button--ghost" id="print-page">${icon('print')}${t('action.print')}</button>
  </aside>`
