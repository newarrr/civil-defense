# Local typefaces

Noto Kufi Arabic is used for Badini display headings; Noto Sans Arabic for Badini body text. CSS family aliases do not modify font metadata. Original font names are retained inside the files.

Sources retrieved 2026-10-15:
- https://github.com/google/fonts/tree/main/ofl/notokufiarabic
- https://github.com/google/fonts/tree/main/ofl/notosansarabic

Full font conversions to WOFF2 with FontTools4.67.0 and Brotli1.2.0. No glyph subsetting or outline editing. Original TTF copies remain local and ignored by Git. Production requires no Python tools, only WOFF2 files.

Both typefaces are distributed under SIL Open Font License1.1. Copyright and full licenses are included in NotoKufiArabic-OFL.txt and NotoSansArabic-OFL.txt. Font file hashes and coverage of the four user-supplied phrases are recorded in audit/badini-font-glyphs.json.

These typefaces support the tested glyphs; this does not certify the linguistic accuracy of all Badini translations. Existing legacy stylesheets still import Google Fonts; the new Badini font files themselves are served locally.

Kurdish typography update, 2026-10-16: locally hosted Vazirmatn v33.003 variable WOFF2 for Badini and Sorani. Source: https://github.com/rastikerdar/vazirmatn/tree/v33.003. Font: fonts/webfonts/Vazirmatn[wght].woff2, unmodified. License: typography/Vazirmatn-OFL.txt (SIL OFL 1.1). CSS alias Duhok Kurdish does not change font metadata. Native Kurdish letter coverage checked before use. Noto files remain as fallback and for other locales.
