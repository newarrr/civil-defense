// Request drafts: stored only in this browser (localStorage). Nothing here talks to a server.

const KEY = window.CD.KEYS.drafts
const LIMIT = 100
const SERVICES = ['permit', 'inspection', 'training', 'volunteer']

/** Districts of Duhok Governorate offered in the draft form (labels: locale keys district.<id>). */
export const DISTRICTS = ['Duhok', 'Zakho', 'Semel', 'Amedi', 'Akre', 'Bardarash']

const isDraft = (draft) =>
  draft && typeof draft.id === 'string' && SERVICES.includes(draft.service) && typeof draft.title === 'string' &&
  typeof draft.updatedAt === 'string' && DISTRICTS.includes(draft.district)

/** All saved drafts, newest first — or null when the browser's storage cannot be read. */
export function readDrafts() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(parsed) ? parsed.filter(isDraft).slice(0, LIMIT) : []
  } catch {
    return null
  }
}

function write(drafts) {
  try {
    localStorage.setItem(KEY, JSON.stringify(drafts))
    return true
  } catch {
    return false
  }
}

const clean = (value, max) => String(value ?? '').trim().slice(0, max)

/** Create or update a draft. Returns false when it cannot be stored. */
export function saveDraft(input) {
  const drafts = readDrafts()
  const title = clean(input.title, 120)
  if (!drafts || !title || !SERVICES.includes(input.service)) return false
  const draft = {
    id: input.id || crypto.randomUUID(),
    service: input.service,
    title,
    name: clean(input.name, 100),
    district: DISTRICTS.includes(input.district) ? input.district : DISTRICTS[0],
    address: clean(input.address, 200),
    notes: clean(input.notes, 2000),
    updatedAt: new Date().toISOString(),
  }
  const others = drafts.filter((item) => item.id !== draft.id)
  return others.length < LIMIT && write([draft, ...others])
}

export function deleteDraft(id) {
  const drafts = readDrafts()
  return Boolean(drafts) && write(drafts.filter((item) => item.id !== id))
}

/** Save one draft as a JSON file on the visitor's device. */
export function downloadDraft(id) {
  const draft = readDrafts()?.find((item) => item.id === id)
  if (!draft) return
  const url = URL.createObjectURL(new Blob([JSON.stringify({ version: 1, status: 'local-draft-not-submitted', ...draft }, null, 2)], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `civil-defense-draft-${draft.id}.json`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
