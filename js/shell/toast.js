// Short confirmation message at the bottom of the screen, announced to screen readers.
// While a modal dialog is open everything outside it is inert and dimmed, so the message is
// placed inside that dialog (the top layer) instead of the page.
let element
let timer

export function toast(message) {
  if (!element) {
    element = document.createElement('div')
    element.id = 'toast'
    element.className = 'toast'
    element.setAttribute('role', 'status')
    element.setAttribute('aria-live', 'polite')
  }
  const host = document.querySelector('dialog[open]') || document.body
  const moved = element.parentNode !== host
  if (moved) host.append(element)
  element.textContent = ''
  element.classList.add('is-visible')
  // A live region that was just inserted needs a moment before its text is announced.
  setTimeout(() => { element.textContent = message }, moved ? 100 : 0)
  clearTimeout(timer)
  timer = setTimeout(() => element.classList.remove('is-visible'), 4000)
}
