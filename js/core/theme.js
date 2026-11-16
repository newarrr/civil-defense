// Light / dark appearance. boot.js applies the saved value before paint; this module changes it.

const { KEYS } = window.CD
const root = document.documentElement
const listeners = new Set()
const isTheme = (value) => value === 'light' || value === 'dark'

export const getTheme = () => (isTheme(root.dataset.theme) ? root.dataset.theme : 'light')

function apply(theme) {
  root.dataset.theme = theme
  root.style.colorScheme = theme
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.content = theme === 'dark' ? '#101a22' : '#faf8f4'
  for (const listener of listeners) listener(theme)
}

export function setTheme(theme) {
  if (!isTheme(theme)) return
  try { localStorage.setItem(KEYS.theme, theme) } catch { /* not persisted in private mode */ }
  apply(theme)
}

export const toggleTheme = () => setTheme(getTheme() === 'dark' ? 'light' : 'dark')

export const onThemeChange = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Keep several open tabs in step.
addEventListener('storage', (event) => {
  if (event.key === KEYS.theme && isTheme(event.newValue)) apply(event.newValue)
})

apply(getTheme())
