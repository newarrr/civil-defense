// Educational 2D diagrams for the knowledge pages. Numbers in a diagram match the numbered
// list printed under it; colours come from CSS variables so they follow the light/dark theme.
import { esc, raw } from '../core/dom.js'

const numbered = (points) => points.map(([x, y, n]) => `<circle cx="${x}" cy="${y - 7}" r="19" class="d-badge"/><text x="${x}" y="${y}">${n}</text>`).join('')

const ART = {
  // Parts of a portable fire extinguisher (1–7).
  extinguisher: `
    <g class="d-line" stroke-width="5" fill="none">
      <rect x="250" y="95" width="140" height="190" rx="40" class="d-red"/>
      <path d="M285 95V65h70v30M285 65l-20-25h95M355 75h35q60 0 60 70v70l-25 12v-92q0-35-35-35"/>
      <path d="m290 47 55-12M273 57l-15 8"/>
      <circle cx="320" cy="83" r="16" class="d-surface"/><path d="m320 83 7-7"/>
      <rect x="282" y="153" width="77" height="70" rx="4" class="d-surface"/>
    </g>
    <g class="d-guide" stroke-width="2"><path d="m130 245 120-15M130 35l150 30M490 35 355 38M130 82l140-24M510 230l-65-12M140 180l140 6M500 110l-165-27"/></g>
    <g class="d-text" font-size="22" text-anchor="middle">${numbered([[110, 252, 1], [110, 38, 2], [510, 42, 3], [110, 90, 4], [530, 238, 5], [120, 186, 6], [520, 118, 7]])}</g>`,
  // A ceiling smoke alarm.
  alarm: `
    <circle cx="320" cy="145" r="118" class="d-surface d-line" stroke-width="6"/>
    <circle cx="320" cy="145" r="35" class="d-badge d-line" stroke-width="4"/>
    <g class="d-guide" stroke-width="8"><path d="M255 85h130M245 105h55m40 0h55M245 185h150M255 205h130"/></g>`,
  // A home escape plan: two ways out and a meeting point (1–3).
  escape: `
    <rect x="80" y="30" width="390" height="230" rx="8" class="d-surface d-line" stroke-width="6"/>
    <path d="M270 30v95M80 145h115M350 145h120M270 195v65" class="d-line" stroke-width="5"/>
    <path d="M150 95h100v65H45M365 80v125h160" class="d-safe-line" stroke-width="8" fill="none" stroke-dasharray="12 7"/>
    <path d="m45 160 20-15v30Zm480 45-20-15v30Z" class="d-safe-fill"/>
    <circle cx="555" cy="200" r="40" class="d-safe" stroke-width="3"/>
    <g class="d-text" font-size="25"><text x="118" y="85">1</text><text x="350" y="74">2</text><text x="548" y="208">3</text></g>`,
  // Hazard area, public area and responders' area (1–3).
  zones: `
    <rect x="20" y="75" width="170" height="140" rx="12" class="d-danger" stroke-width="3"/>
    <path d="m105 100 48 82H57Z" class="d-surface d-danger-line" stroke-width="3"/>
    <path d="M105 126v25m0 9v5" class="d-danger-line" stroke-width="6"/>
    <path d="M225 40v220" class="d-danger-line" stroke-width="5" stroke-dasharray="12 9"/>
    <rect x="270" y="75" width="160" height="140" rx="12" class="d-safe" stroke-width="3"/>
    <path d="m315 143 24 24 48-48" fill="none" class="d-safe-line" stroke-width="8"/>
    <rect x="480" y="75" width="135" height="140" rx="12" class="d-info" stroke-width="3"/>
    <g class="d-text" font-size="23" text-anchor="middle"><text x="105" y="246">1</text><text x="345" y="246">2</text><text x="550" y="246">3</text></g>`,
}

/** SVG diagram with an accessible name. */
export const diagram = (kind, label) =>
  raw(`<svg viewBox="0 0 640 300" role="img" aria-label="${esc(label)}" xmlns="http://www.w3.org/2000/svg"><title>${esc(label)}</title>${ART[kind] || ''}</svg>`)
