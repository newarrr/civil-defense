# Typefaces

Both typefaces are served from this site. No page asks another server for a font, and each page
downloads only the one its language needs.

| File | Used for | CSS name (`css/tokens.css`) | Source | Licence |
|---|---|---|---|---|
| `Vazirmatn.woff2` (variable weight, 111 KB) | Badini and Sorani | `Duhok Kurdish` | https://github.com/rastikerdar/vazirmatn/tree/v33.003 — `fonts/webfonts/Vazirmatn[wght].woff2`, unmodified | SIL OFL 1.1 — `Vazirmatn-OFL.txt` |
| `NotoSansArabic.woff2` (variable weight, 361 KB) | Arabic and English (the file includes Latin letters) | `Duhok Noto Sans` | https://github.com/google/fonts/tree/main/ofl/notosansarabic — full conversion to WOFF2, no subsetting, no outline changes | SIL OFL 1.1 — `NotoSansArabic-OFL.txt` |

The CSS names are aliases only; the font files keep their original names and metadata.

`Duhok Noto Sans` is also the fallback behind `Duhok Kurdish`. Its `unicode-range` in
`css/tokens.css` limits it to Latin, Arabic script and punctuation, so a Kurdish page does not
download it merely because the page contains an arrow (← ↗ ⌄) that neither font has.
Check with the browser's network panel after any font change: a Badini page must request
`Vazirmatn.woff2` only.

To replace a typeface: put the new `.woff2` here with its licence file, change the matching
`@font-face` block in `css/tokens.css`, then run `node tools/check.mjs`.
