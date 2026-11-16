// Language state for the whole site. One catalogue per language lives in /locales/<id>.js;
// only the active one is downloaded. Pages subscribe with onLocaleChange() and re-render.

const { LOCALES, DEFAULT_LOCALE, KEYS } = window.CD

let locale = window.CD.locale
let messages = {}
const listeners = new Set()

export const locales = LOCALES
export const localeIds = Object.keys(LOCALES)
export const getLocale = () => locale
export const isRtl = () => LOCALES[locale].dir === 'rtl'

const loadCatalogue = (id) => import(`../../locales/${id}.js`).then((module) => module.default)

/** Load the catalogue for the current language. Call once before the first render. */
export async function initI18n() {
  messages = await loadCatalogue(locale)
}

/** Translate a key. `vars` fills {placeholders}. A missing key is reported and shown as the key. */
export function t(key, vars) {
  const template = messages[key]
  if (template === undefined) {
    console.error(`[i18n] missing "${key}" in locales/${locale}.js`)
    return key
  }
  return vars ? template.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? vars[name] : match)) : template
}

export const has = (key) => key in messages

/** Pick the active language from a { ar, badini, sorani, en } object (CMS content); Arabic is the fallback. */
export const localized = (value) => (value && (value[locale] || value[DEFAULT_LOCALE])) || ''

/** Internal link that keeps the visitor's language: href('knowledge.html#topics'). */
export function href(path) {
  if (/^(https?:|tel:|mailto:|#)/.test(path)) return path
  const [file, hash] = path.split('#')
  const [name, query] = file.split('?')
  const params = new URLSearchParams(query || '')
  params.set('lang', locale)
  return `${name}?${params}${hash ? '#' + hash : ''}`
}

/**
 * "2026-11-10" → "10ێ چریا دووێ 2026"; "2025-03" → "ئادارا 2025".
 * Month names and word order come from the catalogue (date.months, date.day, date.month):
 * browsers have no Badini calendar names, and the result must not depend on the visitor's browser.
 */
export function formatDate(iso) {
  const text = String(iso ?? '')
  const moment = text.includes('T') ? new Date(text) : null
  const [year, month, day] = moment && !Number.isNaN(moment.getTime())
    ? [moment.getFullYear(), moment.getMonth() + 1, moment.getDate()]
    : (/^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?/.exec(text) || []).slice(1).map(Number)
  const name = t('date.months').split('|')[month - 1]
  return year && name ? t(day ? 'date.day' : 'date.month', { day, month: name, year }) : text
}

let switching = 0
let prepare = () => Promise.resolve(undefined)

const remember = (id) => { try { localStorage.setItem(KEYS.locale, id) } catch { /* private mode: the URL still carries it */ } }

/** The page registers how to load its own data for a language (see js/shell/shell.js). */
export const setLocalePreparer = (fn) => { prepare = fn }

/**
 * Switch language in place: stamps <html>, remembers the choice, updates the URL and re-renders.
 * All or nothing: the catalogue and the page data are loaded first, and nothing changes if either
 * fails (offline, for example). Only the most recent request wins. Resolves to true when the
 * requested language is the active one afterwards.
 */
export async function setLocale(next) {
  if (!LOCALES[next]) return false
  const ticket = ++switching // also cancels an older switch that is still loading
  if (next === locale) {
    remember(next)
    return true
  }
  let catalogue, data
  try {
    [catalogue, data] = await Promise.all([loadCatalogue(next), prepare(next)])
  } catch (error) {
    console.error(`[i18n] cannot switch to ${next}:`, error)
    return false
  }
  if (ticket !== switching) return false
  messages = catalogue
  locale = next
  const root = document.documentElement
  root.lang = LOCALES[next].tag
  root.dir = LOCALES[next].dir
  root.dataset.locale = next
  remember(next)
  const url = new URL(location.href)
  url.searchParams.set('lang', next)
  history.replaceState(history.state, '', url)
  for (const listener of listeners) {
    await listener(next, data)
    if (ticket !== switching) return false
  }
  return true
}

/** listener(locale, pageData) runs after a switch has been applied. */
export const onLocaleChange = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
