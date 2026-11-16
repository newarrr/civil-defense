// HTML templating that escapes by default, plus small DOM helpers. No other file builds HTML by hand.

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

/** Escape text for use in HTML content or a quoted attribute. */
export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c])

class SafeHtml {
  constructor(value) { this.value = value }
  toString() { return this.value }
}

/** Mark a string as already-safe HTML (icons, output of other templates). */
export const raw = (value) => new SafeHtml(String(value ?? ''))

const render = (value) => {
  if (value instanceof SafeHtml) return value.value
  if (Array.isArray(value)) return value.map(render).join('')
  if (value === null || value === undefined || value === false) return ''
  return esc(value)
}

/**
 * Tagged template: html`<p>${userText}</p>` escapes every interpolation unless it is
 * another html`` result, raw(), or an array of those. false/null/undefined render as nothing,
 * except as a whole attribute value: aria-pressed="${on}" must say "false", not "".
 */
export const html = (strings, ...values) =>
  new SafeHtml(strings.reduce((out, part, i) => {
    if (i >= values.length) return out + part
    const value = values[i]
    const wholeAttribute = typeof value === 'boolean' && /=["']$/.test(part) && /^["']/.test(strings[i + 1])
    return out + part + (wholeAttribute ? String(value) : render(value))
  }, ''))

/** Multi-line copy ("a\nb") as escaped text with <br>. */
export const lines = (text) => raw(esc(text).replaceAll('\n', '<br>'))

export const $ = (selector, scope = document) => scope.querySelector(selector)
export const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)]

/** Replace an element's content with a template result. */
export const mount = (target, template) => {
  const el = typeof target === 'string' ? $(target) : target
  if (el) el.innerHTML = render(template)
  return el
}

/** Delegated event listener: on(root, 'click', '[data-x]', (event, match) => …). */
export const on = (root, type, selector, handler, options) =>
  root.addEventListener(type, (event) => {
    const match = event.target instanceof Element ? event.target.closest(selector) : null
    if (match && root.contains(match)) handler(event, match)
  }, options)

export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/** Close a <dialog> when its backdrop is clicked. */
export const closeOnBackdrop = (dialog) =>
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return
    const r = dialog.getBoundingClientRect()
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close()
  })

/** Text search normaliser shared by every search box (handles Arabic-script variants). */
export const normalizeText = (value) =>
  String(value ?? '')
    .normalize('NFKC')
    .replace(/[ً-ْـ]/g, '') // Arabic diacritics and tatweel
    .replace(/[إأآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/[كک]/g, 'ک')
    .replace(/[يیێ]/g, 'ی')
    .replace(/[ةە]/g, 'ه')
    .toLocaleLowerCase()
    .trim()
