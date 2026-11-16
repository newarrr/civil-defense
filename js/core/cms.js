// Content that staff edit in /admin (Sveltia CMS) is stored as JSON in /content.
// This module loads it once, validates it and hands the rest of the site clean objects.
// Text fields stay as { ar, badini, sorani, en } objects — use localized() from i18n.js to read them.
//
// Everything in /content comes from staff input and is treated as untrusted: a typing mistake or a
// misused editor account must not be able to break a page or run script on the public site.

import { embedVideo } from './video.js'

const LANGS = Object.keys(window.CD.LOCALES)
const SLUG = /^[a-z0-9-]+$/

const load = (name) =>
  fetch(`content/${name}.json`, { cache: 'no-cache' })
    .then((response) => (response.ok ? response.json() : null))
    .catch(() => null)

const list = (value) => (Array.isArray(value) ? value : [])
const object = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : {})
const text = (value) => (typeof value === 'string' ? value : '')

/** { ar: {title}, badini: {title} } → { ar: '…', badini: '…', … } for one field. */
const field = (item, key) => Object.fromEntries(LANGS.map((id) => [id, text(object(item[id])[key])]))
const flat = (item) => Object.fromEntries(LANGS.map((id) => [id, text(item[id])]))

/**
 * Images must be raster files uploaded through /admin: served from this site (no third-party request)
 * and never a document that could run script (SVG, HTML). The CMS may store the path with a leading
 * "/" (pages live at the site root, so it is dropped) and keeps the original file name, which may
 * contain spaces or brackets: the result is URL-encoded so it is safe inside src="" and url('').
 */
export function safeImage(path) {
  const file = /^\/?(assets\/uploads\/[^\x00-\x1f"<>\\]+\.(?:webp|png|jpe?g|gif|avif))$/i.exec(text(path))?.[1]
  // Each folder and file name is encoded on its own, so "#" or "?" in a name stay part of the name
  // ("map.svg#.png" cannot reach map.svg).
  return file ? file.split('/').map((part) => encodeURIComponent(part).replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29')).join('/') : ''
}
/** An https address without characters that could leave an attribute. Apostrophes stay (Google Maps uses them). */
const safeHttps = (url) => (/^https:\/\/[^\s\x00-\x1f"<>\\`]+$/.test(text(url)) ? url : '')
/** Menu links: a page of this site, an https address or a phone number — never javascript: or data:. */
const safeLink = (url) => (/^[a-z0-9-]+\.html(?:[?#][^\s\x00-\x1f"'<>\\`]*)?$/.test(text(url)) || /^tel:\+?[0-9]{2,15}$/.test(text(url)) ? url : safeHttps(url))

function readNews(file) {
  return list(object(file).items)
    .filter((item) => item && item.published !== false && SLUG.test(text(item.slug)) && text(object(item.ar).title))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .map((item) => ({
      slug: item.slug,
      category: ['news', 'event', 'operation', 'training', 'announcement'].includes(item.category) ? item.category : 'news',
      date: String(item.date || '').slice(0, 10),
      title: field(item, 'title'),
      excerpt: field(item, 'excerpt'),
      body: field(item, 'body'),
      image: safeImage(item.image),
      imageAlt: text(item.image_alt),
      gallery: list(item.gallery).map(safeImage).filter(Boolean),
      video: embedVideo(item.video), // { url, host } of the player, or null
    }))
}

function readAlerts(file) {
  const now = Date.now()
  return list(object(file).items)
    .filter((item) => item && item.active !== false && text(object(item.ar).title) && (!item.expires || new Date(item.expires).getTime() > now))
    .map((item) => ({
      level: ['advisory', 'watch', 'warning'].includes(item.level) ? item.level : 'advisory',
      title: field(item, 'title'),
      message: field(item, 'message'),
    }))
}

const GROUPS = ['about', 'services', 'safety', 'sources', 'contact']

function readMenu(file) {
  const latest = object(object(file).latestNews)
  return {
    latestNews: { show: latest.show !== false, group: GROUPS.includes(latest.group) ? latest.group : 'sources', count: Math.min(6, Math.max(1, Number(latest.count) || 3)) },
    links: list(object(file).links)
      .filter((link) => link && safeLink(link.url) && text(link.ar) && GROUPS.includes(link.group))
      .map((link) => ({ group: link.group, url: safeLink(link.url), position: link.position === 'start' ? 'start' : 'end', label: flat(link) })),
  }
}

const STAT_KEYS = ['responseRate', 'beneficiaries', 'centerCount', 'staff', 'rescueCount']

function readStats(file) {
  return STAT_KEYS.map((key) => ({ key, ...object(object(file)[key]) }))
    .filter((stat) => stat.approved && stat.value)
    .map((stat) => ({ key: stat.key, value: String(stat.value), period: String(stat.period || '') }))
}

function readCenters(file) {
  return list(object(file).items)
    .filter((item) => item && item.verified && text(object(item.ar).name))
    .map((item) => ({
      name: field(item, 'name'),
      district: field(item, 'district'),
      hours: field(item, 'hours'),
      phone: String(item.phone || '').replace(/[^+0-9]/g, ''),
      map: safeHttps(item.map),
    }))
}

/** One unreadable file must not take the others down. */
const safely = (reader, file, empty) => {
  try {
    return reader(file)
  } catch {
    return empty
  }
}

let pending

/** Resolves to { news, alerts, menu, stats, centers }. Never rejects; missing or broken files give empty lists. */
export function loadCms() {
  pending ||= Promise.all(['news', 'alerts', 'menu', 'stats', 'centers'].map(load)).then(([news, alerts, menu, stats, centers]) => ({
    news: safely(readNews, news, []),
    alerts: safely(readAlerts, alerts, []),
    menu: safely(readMenu, menu, { latestNews: { show: true, group: 'sources', count: 3 }, links: [] }),
    stats: safely(readStats, stats, []),
    centers: safely(readCenters, centers, []),
  }))
  return pending
}

/**
 * Plain text from the admin → paragraphs and bullet lists, as a list of blocks to render.
 * A blank line starts a new paragraph; lines starting with "- " become list items, also when
 * they follow an introductory line in the same paragraph.
 */
export function textBlocks(value) {
  const blocks = []
  for (const block of text(value).trim().split(/\n\s*\n/).filter(Boolean)) {
    let current = null
    for (const row of block.split('\n')) {
      const bullet = /^\s*-\s+(.*)$/.exec(row)
      const type = bullet ? 'list' : 'paragraph'
      if (!current || current.type !== type) blocks.push((current = type === 'list' ? { type, items: [] } : { type, lines: [] }))
      if (bullet) current.items.push(bullet[1])
      else current.lines.push(row)
    }
  }
  return blocks
}
