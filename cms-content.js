'use strict';
// Content edited in /admin (Sveltia CMS) lives in content/*.json in this repository.
// This script loads it and feeds it into the ORIGINAL design without new layout:
// news → existing .news-card / .notice markup and #home-dialog; alerts → thin bar;
// menu → sections-nav.js (reads window.CD_CMS).
(function () {
  var LANGS = ['ar', 'badini', 'sorani', 'en'];
  var IDX = { ar: 0, badini: 1, sorani: 2, en: 3 };
  var esc = function (v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var lang = function () {
    var b = document.querySelector('[data-lang][aria-pressed="true"]');
    if (b && b.dataset.lang in IDX) return b.dataset.lang;
    var l = document.documentElement.dataset.locale || new URLSearchParams(location.search).get('lang');
    return l in IDX ? l : 'ar';
  };
  var pick = function (arr) { return (arr && arr[IDX[lang()]]) || (arr && arr[0]) || ''; };
  // [ar, badini, sorani, en] with Arabic as fallback for empty translations.
  var four = function (item, key) {
    var ar = (item.ar && item.ar[key]) || '';
    return LANGS.map(function (l) { return (item[l] && item[l][key]) || ar; });
  };
  var fourFlat = function (item) {
    return LANGS.map(function (l) { return item[l] || item.ar || ''; });
  };
  // Plain text → safe HTML: blank line = paragraph, "- " = bullet.
  var textToHtml = function (text) {
    return String(text || '').trim().split(/\n\s*\n/).filter(Boolean).map(function (block) {
      var lines = block.split('\n');
      if (lines.every(function (l) { return /^\s*-\s+/.test(l); }))
        return '<ul>' + lines.map(function (l) { return '<li>' + esc(l.replace(/^\s*-\s+/, '')) + '</li>'; }).join('') + '</ul>';
      return '<p>' + lines.map(esc).join('<br>') + '</p>';
    }).join('');
  };
  var embed = function (url) {
    try {
      var u = new URL(url), h = u.hostname.replace(/^www\.|^m\./, '');
      if (h === 'youtu.be') return 'https://www.youtube-nocookie.com/embed/' + u.pathname.slice(1);
      if (h === 'youtube.com') { var id = u.searchParams.get('v') || u.pathname.split('/').filter(Boolean).pop(); return id ? 'https://www.youtube-nocookie.com/embed/' + id : ''; }
      if (h === 'vimeo.com') return 'https://player.vimeo.com/video/' + u.pathname.split('/').filter(Boolean).pop();
    } catch (e) {}
    return '';
  };
  var safeImage = function (p) { return /^(assets\/uploads\/|https:\/\/)[^"'<>\s]+$/.test(p || '') ? p : ''; };

  var load = function (file) {
    return fetch('content/' + file + '?t=' + Math.floor(Date.now() / 60000), { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  };

  var ready = new Promise(function (r) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', r); else r();
  });

  Promise.all([load('news.json'), load('alerts.json'), load('menu.json'), ready]).then(function (res) {
    var now = Date.now();
    var news = ((res[0] && res[0].items) || [])
      .filter(function (n) { return n && /^[a-z0-9-]+$/.test(n.slug || '') && n.ar && n.ar.title; })
      .sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); })
      .map(function (n) {
        var bodies = four(n, 'body');
        return {
          slug: n.slug,
          title: four(n, 'title'),
          desc: four(n, 'excerpt'),
          body: bodies.map(textToHtml),
          publishedAt: String(n.date || '').slice(0, 10),
          image: safeImage(n.image),
          video: n.video ? embed(n.video) : ''
        };
      });
    var alerts = ((res[1] && res[1].items) || []).filter(function (a) {
      return a && a.active !== false && a.ar && a.ar.title && (!a.expires || new Date(a.expires).getTime() > now);
    }).map(function (a) { return { level: a.level, title: four(a, 'title'), message: four(a, 'message') }; });
    var m = res[2] || {};
    var ln = m.latestNews || {};
    var menu = {
      latestNews: { show: ln.show !== false, group: ln.group || 'sources', count: Math.min(6, Math.max(1, ln.count || 3)) },
      links: (m.links || []).filter(function (l) { return l && l.url && l.ar; }).map(function (l) {
        return { group: l.group, url: l.url, position: l.position || 'end', label: fourFlat(l) };
      })
    };
    window.CD_CMS = { news: news, alerts: alerts, menu: menu };
    apply();
  });

  function apply() {
    var cms = window.CD_CMS;
    var bySlug = {};
    cms.news.forEach(function (n) { bySlug[n.slug] = n; });

    // News: newest items take the first card slots; the number of cards stays the same.
    var vc = window.CDVerifiedContent;
    if (vc && Array.isArray(vc.resources) && cms.news.length) {
      var original = vc.__original || (vc.__original = vc.resources.slice());
      vc.resources = cms.news.map(function (n, i) {
        var slot = original[i] || original[0] || {};
        return { id: 'cms-' + n.slug, icon: slot.icon || 'info', art: slot.art, source: '#news-' + n.slug, publishedAt: n.publishedAt, title: n.title, desc: n.desc, body: n.body };
      }).concat(original).slice(0, Math.max(original.length, 1));
    }

    function decorate() {
      document.querySelectorAll('#news-cards a[href*="#news-"], #notices a[href*="#news-"]').forEach(function (a) {
        a.removeAttribute('target');
        a.removeAttribute('rel');
        var n = bySlug[a.getAttribute('href').split('#news-')[1]];
        var photo = a.querySelector('.news-photo');
        if (n && photo && n.image) {
          photo.style.backgroundImage = 'url("' + n.image + '")';
          photo.style.backgroundSize = 'cover';
          photo.style.backgroundPosition = 'center';
        }
      });
    }
    ['#news-cards', '#notices'].forEach(function (sel) {
      var el = document.querySelector(sel);
      if (el) new MutationObserver(decorate).observe(el, { childList: true });
    });

    function open(slug) {
      var n = bySlug[slug], dialog = document.querySelector('#home-dialog'), box = document.querySelector('#dialog-content');
      if (!n || !dialog || !box) return;
      var media = '';
      if (n.image) media += '<img src="' + esc(n.image) + '" alt="" style="width:100%;border-radius:6px;margin:12px 0">';
      if (n.video) media += '<div style="position:relative;aspect-ratio:16/9;margin:12px 0"><iframe src="' + esc(n.video) + '" title="' + esc(pick(n.title)) + '" style="position:absolute;inset:0;width:100%;height:100%;border:0" allowfullscreen loading="lazy"></iframe></div>';
      // body is built only from escaped text by textToHtml().
      box.innerHTML = '<h2 id="home-dialog-title">' + esc(pick(n.title)) + '</h2><time dir="ltr">' + esc(n.publishedAt) + '</time>' + media + '<div style="line-height:1.9">' + pick(n.body) + '</div>';
      if (!dialog.open) dialog.showModal();
    }
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href*="#news-"]');
      if (!a || !document.querySelector('#home-dialog')) return;
      var slug = a.getAttribute('href').split('#news-')[1];
      if (!bySlug[slug]) return;
      e.preventDefault();
      history.replaceState(null, '', location.pathname + location.search + '#news-' + slug);
      open(slug);
    });

    if (cms.alerts.length && !document.querySelector('.cms-alerts')) {
      var colors = { advisory: '#1d4ed8', watch: '#b45309', warning: '#c1121f' };
      var bar = document.createElement('div');
      bar.className = 'cms-alerts';
      bar.setAttribute('role', 'region');
      bar.setAttribute('aria-live', 'polite');
      bar.innerHTML = cms.alerts.map(function (a) {
        return '<div style="background:' + (colors[a.level] || colors.advisory) + ';color:#fff;padding:8px 16px;font-size:14px;text-align:center"' + (a.level === 'warning' ? ' role="alert"' : '') + '><strong>' + esc(pick(a.title)) + '</strong> — ' + esc(pick(a.message)) + '</div>';
      }).join('');
      document.body.prepend(bar);
    }

    // Re-render the original page with the new data: re-select the current language
    // (home.js re-renders cards; sections-nav.js re-renders the menu on data-locale change).
    var current = document.querySelector('[data-lang][aria-pressed="true"]');
    if (current) current.click();
    else if (document.documentElement.dataset.locale) document.documentElement.setAttribute('data-locale', document.documentElement.dataset.locale);
    decorate();
    if (location.hash.indexOf('#news-') === 0) open(location.hash.slice(6));
  }
})();
