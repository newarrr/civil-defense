// The one icon set of the site: 24px grid, stroked with currentColor. Add new icons here only.
import { raw } from './dom.js'

const PATHS = {
  // interface
  search: '<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>', // points forward; mirrored in RTL by CSS
  chevron: '<path d="m9 6 6 6-6 6"/>', // points forward; mirrored in RTL by CSS
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  up: '<path d="M12 20V4m-6 6 6-6 6 6"/>',
  play: '<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4Z"/>', // no mirroring: play points right in every language
  external: '<path d="M14 5h5v5M19 5l-8 8M11 7H6a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-6 6-6 12 0 18 6-6 6-12 0-18ZM5 7h14M5 17h14"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/>',
  moon: '<path d="M20.8 13.4A9 9 0 0 1 10.6 3.2a9 9 0 1 0 10.2 10.2Z"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m7 12 3 3 7-7"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 10v7m0-11v1"/>',
  print: '<path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M7 14h10v7H7Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  // people and places
  phone: '<path d="m7 3 3 5-3 3c2 3 3 4 6 6l3-3 5 3c0 4-3 5-5 4C9 19 5 15 3 8 2 6 3 3 7 3Z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  people: '<circle cx="9" cy="6" r="3"/><circle cx="17" cy="7" r="2.5"/><path d="M2 22v-5a7 7 0 0 1 14 0v5m1-10a6 6 0 0 1 5 6v4M6 22v-6m6 6v-6"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
  building: '<path d="M3 21h18M5 21V10l7-6 7 6v11M9 21v-6h6v6"/>',
  house: '<path d="m2 11 10-9 10 9M5 9v13h5v-8h4v8h5V9"/>',
  school: '<path d="m2 9 10-5 10 5-10 5Z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5M22 9v6"/>',
  tower: '<rect x="6" y="2" width="12" height="20" rx="1"/><path d="M10 6h1M13 6h1M10 10h1M13 10h1M10 14h1M13 14h1M11 22v-3h2v3"/>',
  // content
  book: '<path d="M2 5.5C4.5 4 7.5 4 12 6c4.5-2 7.5-2 10-.5V19c-2.5-1.5-5.5-1.5-10 .5-4.5-2-7.5-2-10-.5Z"/><path d="M12 6v13.5"/>',
  document: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
  news: '<path d="M4 4h13v16H6a2 2 0 0 1-2-2Z"/><path d="M17 8h3v10a2 2 0 0 1-4 0M8 8h5M8 12h5M8 16h3"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/><path d="M8 9h8M8 13h5"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
  status: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  history: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  // safety topics
  shield: '<path d="m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6Z"/>',
  'shield-check': '<path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
  fire: '<path d="M12 22a7 7 0 0 0 7-7c0-4-3-6.5-4-10-2 2-3 3.5-3 6-1-1-2-2-2.5-3.5C7 9.5 5 12 5 15a7 7 0 0 0 7 7Z"/>',
  helmet: '<path d="M5 15V11a7 7 0 0 1 14 0v4M10 3v10m4-10v10M3 16c5 4 13 4 18 0v4c-6 3-12 3-18 0Z"/>',
  extinguisher: '<path d="M8 9h8v13H7V10Zm2-4h4v4m-2-4V2m-3 0h8M14 5c5 0 6 3 6 8v4M7 8C2 8 3 14 3 18"/>',
  tool: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4Z"/>',
  leaf: '<path d="M20 3C10 3 3 7 4 14c1 8 13 8 16-11Z"/><path d="M3 22c2-8 7-12 13-15M8 16v-5"/>',
  tree: '<path d="m12 1-7 8h4l-6 7h6l-6 6h18l-6-6h6l-6-7h4Z"/><path d="M12 20v4"/>',
  water: '<path d="M2 15c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0M2 20c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0"/><path d="M12 3s-4 4.5-4 7a4 4 0 0 0 8 0c0-2.5-4-7-4-7Z"/>',
  rain: '<path d="M6 14a5 5 0 0 1 0-10 6 6 0 0 1 11 1 4 4 0 0 1 1 9ZM6 18l-1 2m7-2-1 2m7-2-1 2M3 23h18"/>',
  cloud: '<path d="M7 18a5 5 0 1 1 .9-9.9A6 6 0 0 1 19 10a4 4 0 0 1-1 7.9H7Z"/><path d="m11 21 1-3M15 21l1-3"/>',
  quake: '<path d="M2 12h4l2-5 3 10 3-14 2 9h6"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7Z"/>',
  gas: '<path d="M7 21h10M8 21V9a4 4 0 0 1 8 0v12M10 5V3h4v2"/><path d="M12 13v3"/>',
  car: '<path d="M5 16V11l2-5h10l2 5v5M3 16h18v3H3Z"/><circle cx="7.5" cy="13" r="1"/><circle cx="16.5" cy="13" r="1"/>',
  ladder: '<path d="M8 3v18M16 3v18M8 7h8M8 12h8M8 17h8"/>',
  hazard: '<path d="M12 3 2 20h20Z"/><path d="M12 10v4M12 17h.01"/>',
  box: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V4h8v3M12 11v5"/>',
}

/** Inline SVG for an icon name. Unknown names fall back to "link" so a typo never breaks a page. */
export const icon = (name, className = '') =>
  raw(`<svg class="icon${className ? ' ' + className : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${PATHS[name] || PATHS.link}</svg>`)

export const hasIcon = (name) => Object.prototype.hasOwnProperty.call(PATHS, name)
