// The single modal dialog of the site (search, news, service drafts). Created on first use.
import { $, closeOnBackdrop, html, mount, on } from '../core/dom.js'
import { t } from '../core/i18n.js'

let dialog
let afterClose = null

function ensure() {
  if (dialog) return dialog
  dialog = document.createElement('dialog')
  dialog.id = 'site-dialog'
  dialog.className = 'site-dialog'
  dialog.setAttribute('aria-labelledby', 'dialog-title')
  dialog.innerHTML = '<button type="button" class="dialog-close"></button><div class="dialog-content"></div>'
  document.body.append(dialog)
  on(dialog, 'click', '.dialog-close', () => dialog.close())
  closeOnBackdrop(dialog)
  dialog.addEventListener('close', () => {
    const callback = afterClose
    afterClose = null
    $('.dialog-content', dialog).innerHTML = '' // stops any embedded video
    callback?.()
  })
  return dialog
}

/**
 * Show a template in the dialog. The template must contain an element with id="dialog-title".
 * `wide` gives long content (news) more room; `onClose` runs once when the dialog closes.
 */
export function openDialog(template, { wide = false, onClose = null } = {}) {
  const el = ensure()
  el.classList.toggle('site-dialog--wide', wide)
  const close = $('.dialog-close', el)
  close.textContent = '×'
  close.setAttribute('aria-label', t('action.close'))
  const wasOpen = el.open
  mount($('.dialog-content', el), template)
  afterClose = onClose
  if (!wasOpen) el.showModal()
  el.scrollTop = 0
  // The control that was pressed is gone with the old view: tell keyboard and screen-reader users
  // where they are now. (On first opening showModal() already focuses the close button.)
  if (wasOpen) $('#dialog-title', el)?.focus({ preventScroll: true })
  return $('.dialog-content', el)
}

export const closeDialog = () => dialog?.open && dialog.close()
export const dialogContent = () => (dialog?.open ? $('.dialog-content', dialog) : null)

/** Standard dialog heading. */
export const dialogTitle = (text) => html`<h2 id="dialog-title" tabindex="-1">${text}</h2>`
