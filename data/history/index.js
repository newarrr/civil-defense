// History page — what is the same in every language: the milestones and their references.
// Text lives in ./<lang>.js.

/** Date the references were last checked. */
export const CHECKED_DATE = '2026-10-16'

/** Reference documents. Titles are translated in ./<lang>.js under `refs`. */
export const REFS = {
  mandate: { publisher: 'ICDO', url: 'https://icdo.org/index.php' },
  origin: { publisher: 'ICDO', url: 'https://icdo.org/about-icdo/history.html' },
  about: { publisher: 'ICDO', url: 'https://icdo.org/en/about-icdo/' },
  iraq: { publisher: 'وزارة الداخلية العراقية', url: 'https://moi.gov.iq/upload/2515194386.pdf' },
  protocol: { publisher: 'ICRC', url: 'https://ihl-databases.icrc.org/en/ihl-treaties/api-1977/article-61' },
  day: { publisher: 'ICDO', url: 'https://icdo.org/files/documents/ICDO-presentation-2019.pdf' },
  law: { publisher: 'وزارة العدل العراقية', url: 'https://www.moj.gov.iq/view.806/' },
  sendai: { publisher: 'UNDRR', url: 'https://www.undrr.org/implementing-sendai-framework/what-sendai-framework' },
  duhok: { publisher: 'University of Duhok', url: 'https://phr.uod.ac/activities/news/workshop-about-the-chemical-safety/' },
  krg: { publisher: 'KRG Department of Media and Information', url: 'https://gov.krd/dmi-en/publications/news-service/' },
}

/** Milestones in chronological order. track: world | iraq | local. */
export const EVENTS = [
  { id: 'geneva', year: 1931, date: '1931-05-28', track: 'world', ref: 'origin' },
  { id: 'iraqi-institution', year: 1956, date: '1956', track: 'iraq', ref: 'iraq' },
  { id: 'icdo-name', year: 1958, date: '1958', track: 'world', ref: 'origin' },
  { id: 'intergovernmental', year: 1972, date: '1972-03-01', track: 'world', ref: 'about' },
  { id: 'humanitarian-tasks', year: 1977, date: '1977-06-08', track: 'world', ref: 'protocol' },
  { id: 'world-day', year: 1990, date: '1990-12-18', track: 'world', ref: 'day' },
  { id: 'iraqi-law', year: 2013, date: '2013-11-11', track: 'iraq', ref: 'law' },
  { id: 'sendai', year: 2015, date: '2015-03-18', track: 'world', ref: 'sendai' },
  { id: 'duhok-training', year: 2024, date: '2024-11-29', track: 'local', ref: 'duhok' },
  { id: 'regional-guidelines', year: 2026, date: '2026-08-18', track: 'local', ref: 'krg' },
]
