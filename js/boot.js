/* Runs before first paint (classic script in <head>): resolves language and theme and
   stamps them on <html>, so the page never flashes in the wrong direction or colours.
   This is the single source of truth for the language table — modules read window.CD. */
(function () {
  'use strict';
  // Order = the order shown in every language menu.
  var LOCALES = {
    badini: { tag: 'ku-Arab', dir: 'rtl', name: 'بادینی', short: 'BAD' },
    sorani: { tag: 'ckb', dir: 'rtl', name: 'سۆرانی', short: 'SOR' },
    ar: { tag: 'ar', dir: 'rtl', name: 'العربية', short: 'AR' },
    en: { tag: 'en', dir: 'ltr', name: 'English', short: 'EN' }
  };
  var DEFAULT_LOCALE = 'ar';
  var KEYS = { locale: 'cd-language', theme: 'cd-display-theme', drafts: 'cd-drafts-v1' };
  var root = document.documentElement;
  var query = new URLSearchParams(location.search);

  function stored(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function pick(candidates, isValid, fallback) {
    for (var i = 0; i < candidates.length; i++) if (isValid(candidates[i])) return candidates[i];
    return fallback;
  }

  var locale = pick([query.get('lang'), stored(KEYS.locale)], function (v) { return Object.prototype.hasOwnProperty.call(LOCALES, v); }, DEFAULT_LOCALE);
  var theme = pick([query.get('theme'), stored(KEYS.theme)], function (v) { return v === 'light' || v === 'dark'; }, 'light');

  root.lang = LOCALES[locale].tag;
  root.dir = LOCALES[locale].dir;
  root.dataset.locale = locale;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;

  // Canonical link: the page itself, in the language its address names (?lang=en is its own page
  // for search engines, so the hreflang alternates in <head> and sitemap.xml are accepted).
  // Added here rather than in the HTML so a crawler never sees a canonical that contradicts the page.
  var bare = document.querySelector('link[rel="alternate"][hreflang="x-default"]');
  if (bare) {
    var canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = bare.href + (query.get('lang') === locale && locale !== DEFAULT_LOCALE ? '?lang=' + locale : '');
    document.head.appendChild(canonical);
  }

  window.CD = { LOCALES: LOCALES, DEFAULT_LOCALE: DEFAULT_LOCALE, KEYS: KEYS, locale: locale, theme: theme };
})();
