// Site footer: knowledge invitation, emergency number, link columns, language and theme controls.
import { $, html, mount, on, prefersReducedMotion, raw } from '../core/dom.js'
import { icon } from '../core/icons.js'
import { t, href, getLocale, locales, localeIds, setLocale } from '../core/i18n.js'
import { getTheme, setTheme, onThemeChange } from '../core/theme.js'
import { PAGES, EMERGENCY_NUMBER, MINISTRY_URL } from '../core/site.js'

const DISCOVER = ['history', 'how', 'knowledge', 'safety', 'updates', 'glossary']
const SERVICES = ['services', 'status', 'centers', 'training', 'equipment']

const column = (id, titleKey, pages) => html`
  <nav class="footer-link-column" aria-labelledby="${id}">
    <h2 id="${id}">${t(titleKey)}</h2>
    ${pages.map((page) => html`<a href="${href(PAGES[page].file)}">${t(`footer.link.${page}`)}<span aria-hidden="true">↗</span></a>`)}
  </nav>`

const themeControl = () => html`
  <span class="theme-preference-label">${t('theme.appearance')}</span>
  <div class="theme-segments">
    ${['light', 'dark'].map((value) => html`<button type="button" data-set-theme="${value}" aria-pressed="${getTheme() === value}">${icon(value === 'light' ? 'sun' : 'moon', 'theme-icon')}<span>${t(`theme.${value}`)}</span></button>`)}
  </div>`

function footerTemplate({ invitation }) {
  const locale = getLocale()
  return html`
    ${invitation ? html`
    <section class="footer-invitation" aria-labelledby="footer-invitation-title">
      <div>
        <p class="footer-eyebrow">${t('footer.eyebrow')}</p>
        <h2 id="footer-invitation-title">${t('footer.cta')}</h2>
        <p>${t('footer.ctaDesc')}</p>
      </div>
      <div class="footer-invitation-actions">
        <a class="footer-primary" href="${href('knowledge.html')}">${t('footer.explore')}${icon('arrow', 'footer-icon icon-forward')}</a>
        <a class="footer-secondary" href="${href(PAGES.contact.file)}">${t('footer.contact')}</a>
      </div>
    </section>` : ''}
    <div class="footer-dark">
      <section class="footer-emergency" aria-label="${t('footer.emergency')}">
        <div class="footer-emergency-label">
          <span class="footer-phone-icon">${icon('phone', 'footer-icon')}</span>
          <div><h2>${t('footer.emergency')}</h2><p>${t('footer.emergencyText')}</p></div>
        </div>
        <a href="tel:${EMERGENCY_NUMBER}" class="footer-call"><strong dir="ltr">${EMERGENCY_NUMBER}</strong><span>${t('action.callNow')}${icon('arrow', 'footer-icon icon-forward')}</span></a>
      </section>
      <div class="footer-columns">
        <section class="footer-brand">
          <a class="footer-brand-link" href="${href('index.html')}">
            <img src="assets/brand/logo.webp" alt="" width="64" height="78">
            <h2>${t('site.name')}</h2>
          </a>
          <p>${t('footer.brandDesc')}</p>
          <span class="footer-region">${icon('pin', 'footer-icon')}${t('site.region')}</span>
          <p class="footer-motto">${t('site.motto')}</p>
        </section>
        ${column('footer-discover-title', 'footer.discover', DISCOVER)}
        ${column('footer-services-title', 'footer.services', SERVICES)}
        <section class="footer-contact">
          <h2>${t('footer.contact')}</h2>
          <p class="footer-contact-place">${icon('pin', 'footer-icon')}${t('site.region')}</p>
          <a class="footer-help-link" href="${href(PAGES.contact.file)}">${t('footer.help')}<span aria-hidden="true">↗</span></a>
          <a class="footer-help-link" href="${MINISTRY_URL}" target="_blank" rel="noopener noreferrer">${t('footer.ministry')}<span aria-hidden="true">↗</span></a>
          <div class="footer-office"><h3>${t('footer.admin')}</h3><p>${t('footer.officePending')}</p></div>
        </section>
      </div>
      <div class="footer-utilities">
        <div class="footer-content-state">
          <h2>${t('footer.transparency')}</h2>
          <a href="${href('sources.html')}">${icon('shield-check', 'footer-icon')}${t('footer.education')}</a>
          <a href="${href('service-status.html')}"><span class="footer-state-dot" aria-hidden="true"></span>${t('footer.digital')}</a>
        </div>
        <div class="footer-languages">
          <span>${t('footer.languages')}</span>
          <div role="group" aria-label="${t('footer.languages')}">
            ${localeIds.map((id) => html`<button type="button" data-footer-lang="${id}" lang="${locales[id].tag}" aria-pressed="${id === locale}">${locales[id].name}</button>`)}
          </div>
        </div>
        <div class="theme-preference" role="group" aria-label="${t('theme.appearance')}">${themeControl()}</div>
      </div>
      <div class="footer-bottom">
        <p>© ${raw(String(new Date().getFullYear()))} <span>${t('site.name')}</span><span class="footer-preview">${t('footer.version')}</span></p>
        <nav aria-label="${t('footer.sourcePolicy')}">
          <a href="${href('privacy-accessibility.html')}">${t('footer.privacy')}</a>
          <a href="${href('sources.html')}">${t('footer.sourcePolicy')}</a>
          <a href="#main" class="footer-to-top">${t('action.backToTop')}${icon('up', 'footer-icon')}</a>
        </nav>
      </div>
      <p class="footer-language-note">${t('footer.translation')}</p>
    </div>`
}

let options = { invitation: true }

export function renderFooter(next = {}) {
  options = { ...options, ...next }
  mount('#site-footer', footerTemplate(options))
}

export function initFooter(initial) {
  const footer = $('#site-footer')
  on(footer, 'click', '[data-footer-lang]', async (event, button) => {
    const id = button.dataset.footerLang
    // Focus follows only a switch that took effect (a later choice or a failed load leaves it alone).
    if (await setLocale(id)) $(`[data-footer-lang="${id}"]`)?.focus({ preventScroll: true })
  })
  on(footer, 'click', '[data-set-theme]', (event, button) => {
    setTheme(button.dataset.setTheme)
    $(`[data-set-theme="${button.dataset.setTheme}"]`)?.focus({ preventScroll: true })
  })
  on(footer, 'click', '.footer-to-top', (event) => {
    event.preventDefault()
    const main = $('#main')
    main.setAttribute('tabindex', '-1')
    main.focus({ preventScroll: true })
    scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'instant' : 'smooth' })
  })
  onThemeChange(() => mount('.theme-preference', themeControl()))
  renderFooter(initial)
}
