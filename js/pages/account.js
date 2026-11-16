// Citizen account (account.html) — interface preview only. There is no account server yet:
// nothing typed here is sent or stored, and the form says so before and after submitting.
import { $, $$, html, mount, on } from '../core/dom.js'
import { icon } from '../core/icons.js'
import { t, href } from '../core/i18n.js'
import { startPage, setTitle } from '../shell/shell.js'
import { emergencyBar } from '../shell/layout.js'

let tab = new URLSearchParams(location.search).get('tab') === 'signup' ? 'signup' : 'login'
let message = '' // a text key, so the message follows a language switch

const template = () => html`
  <div class="wrap account">
    <section class="account-intro">
      <p class="eyebrow">${t('account.kicker')}</p>
      <h1>${t('account.welcome')} <em>${t('site.name')}</em></h1>
      <p class="lead">${t('account.description')}</p>
      <div class="values">
        ${[['shield-check', 1], ['people', 2], ['document', 3]].map(([name, n]) => html`<div class="value">${icon(name)}<strong>${t(`account.value${n}`)}</strong><small>${t(`account.value${n}Desc`)}</small></div>`)}
      </div>
      ${emergencyBar()}
    </section>
    <section class="account-card" aria-labelledby="form-title">
      <div class="account-tabs" role="tablist" aria-label="${t('page.account')}">
        ${['login', 'signup'].map((id) => html`<button type="button" id="${id}-tab" role="tab" aria-selected="${tab === id}" aria-controls="account-panel" tabindex="${tab === id ? 0 : -1}" data-tab="${id}">${t(`account.${id}`)}</button>`)}
      </div>
      <div id="account-panel" role="tabpanel" aria-labelledby="${tab}-tab">
        <h2 id="form-title">${t(`account.${tab}`)}</h2>
        <p class="account-subtitle">${t(`account.${tab}Desc`)}</p>
        <p class="notice">${t('account.notice')}</p>
        <form id="account-form" class="form-grid" novalidate>
          ${tab === 'signup' ? html`<label class="field field--full">${t('account.name')}<input id="account-name" name="name" autocomplete="name" maxlength="100" minlength="2" required></label>` : ''}
          <label class="field field--full">${t('account.email')}<input id="account-email" type="email" name="email" autocomplete="username" placeholder="name@example.com" required maxlength="150" dir="ltr"></label>
          <label class="field field--full">${t('account.password')}
            <span class="input-with-action">
              <input id="account-password" type="password" name="password" autocomplete="off" minlength="8" maxlength="100" required dir="ltr">
              <button type="button" id="password-toggle" aria-label="${t('account.showPassword')}" aria-pressed="false">${icon('eye')}</button>
            </span>
          </label>
          ${tab === 'signup' ? html`
          <label class="field field--full">${t('account.confirmPassword')}<input id="account-confirm" type="password" autocomplete="off" minlength="8" maxlength="100" required dir="ltr"></label>
          <p class="account-help field--full">${t('account.passwordHelp')}<span class="password-meter" id="password-meter" data-level="0" aria-hidden="true"><span></span><span></span><span></span></span></p>` : html`
          <button type="button" class="text-link field--full" id="forgot-password">${t('account.forgot')}</button>`}
          <button class="button field--full" type="submit">${t(`account.${tab}`)}${icon('arrow', 'icon-forward')}</button>
          <p id="account-message" class="field--full" role="status" aria-live="polite" tabindex="-1">${message ? t(message) : ''}</p>
        </form>
        <p class="account-or"><span>${t('account.or')}</span></p>
        <a class="button button--ghost" href="${href('portal.html?portal=drafts#services')}">${icon('document')}${t('account.drafts')}</a>
        <p class="account-privacy">${t('account.privacy')}</p>
      </div>
    </section>
  </div>`

function render({ main }) {
  setTitle(t(`account.${tab}`))
  mount(main, template())
}

function setTab(next, focus = false) {
  tab = next
  message = ''
  render({ main: $('#main') })
  if (focus) $(`#${tab}-tab`).focus()
}

function strength(password) {
  if (!password) return 0
  if (password.length < 8) return 1
  const groups = [/[a-zA-Z؀-ۿ]/, /\d/, /[^a-zA-Z؀-ۿ\d\s]/].filter((pattern) => pattern.test(password)).length
  return Math.min(3, groups)
}

function validate() {
  const password = $('#account-password').value
  const confirm = $('#account-confirm')
  const name = $('#account-name')
  confirm?.setCustomValidity(confirm.value !== password ? t('account.passwordMismatch') : '')
  name?.setCustomValidity(name.value.trim().length < 2 ? t('account.nameInvalid') : '')
  const meter = $('#password-meter')
  if (meter) meter.dataset.level = String(strength(password))
}

on(document, 'click', '[data-tab]', (event, button) => setTab(button.dataset.tab))
on(document, 'keydown', '[data-tab]', (event) => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  setTab(event.key === 'Home' ? 'login' : event.key === 'End' ? 'signup' : tab === 'login' ? 'signup' : 'login', true)
})
on(document, 'input', '#account-form input', validate)
on(document, 'click', '#password-toggle', (event, button) => {
  const show = $('#account-password').type === 'password'
  $$('#account-password, #account-confirm').forEach((input) => { input.type = show ? 'text' : 'password' })
  button.setAttribute('aria-pressed', String(show))
  button.setAttribute('aria-label', t(show ? 'account.hidePassword' : 'account.showPassword'))
})
on(document, 'click', '#forgot-password', () => {
  message = 'account.forgotMessage'
  $('#account-message').textContent = t(message)
})
on(document, 'submit', '#account-form', (event, form) => {
  event.preventDefault()
  validate()
  if (!form.reportValidity()) return
  // No account server: discard what was typed and say so.
  message = 'account.unavailable'
  render({ main: $('#main') })
  $('#account-message')?.focus()
})

startPage({ id: 'account', render })
