/* Section navigation only. No changes to the hero, images or service status. */
(() => {
  'use strict';
  const K = window.Knowledge;
  const ids = ['ar', 'badini', 'sorani', 'en'];
  const shell = document.querySelector('.nav-shell');
  const nav = shell.querySelector('nav');
  const menuButton = document.querySelector('#menu-open');
  const globe = document.querySelector('#language-open>span:first-child');
  globe.setAttribute('aria-hidden','true');
  globe.innerHTML = '<svg class="sections-language-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-6 6-6 12 0 18 6-6 6-12 0-18ZM5 7h14M5 17h14"/></svg>';
  const words = {
    title: ['استكشف أقسام البوابة', 'بەشێن دەروازەیێ ببینە', 'بەشەکانی دەروازە ببینە', 'Explore portal sections'],
    note: ['معلومات تعليمية ومصادر؛ الخدمات الرسمية والحسابات غير مفعّلة.', 'زانیاری و ژێدەرێن فێرکرنێ؛ خزمەتگوزاری و هژمارێن فەرمی نەچالاکن.', 'زانیاری و سەرچاوەی فێرکاری؛ خزمەتگوزاری و هەژماری فەرمی چالاک نین.', 'Educational information and sources; official submissions and accounts are inactive.'],
    close: ['إغلاق الأقسام', 'گرتنا بەشان', 'داخستنی بەشەکان', 'Close sections'],
    home: ['الرئيسية', 'سەرەکی', 'سەرەکی', 'Home'],
    about: ['عن الدفاع المدني', 'دەربارەی بەرگریێ', 'دەربارەی بەرگری', 'Civil defense'],
    services: ['دليل الخدمات', 'ڕێبەرا خزمەتگوزاریان', 'ڕێبەری خزمەتگوزاری', 'Services'],
    safety: ['التوعية والوقاية', 'هشیاری و پاراستن', 'هۆشیاری و خۆپاراستن', 'Safety'],
    sources: ['المصادر والتحديثات', 'ژێدەر و نووکرن', 'سەرچاوە و نوێکردنەوە', 'Sources'],
    contact: ['التواصل والمساعدة', 'پەیوەندی و هاریکاری', 'پەیوەندی و یارمەتی', 'Help'],
    allTopics: ['جميع موضوعات المعرفة', 'هەمی بابەتێن زانیاریێ', 'هەموو بابەتەکانی زانیاری', 'All knowledge topics'],
    prep: ['دليل التحضير ومسودات الطلبات', 'ڕێبەرا ئامادەکرن و ڕەشنووسان', 'ڕێبەری ئامادەکاری و ڕەشنووس', 'Preparation guide and request drafts'],
    contactPage: ['التواصل والأسئلة الشائعة', 'پەیوەندی و پرسیارێن بەربەلاڤ', 'پەیوەندی و پرسیاری باو', 'Contact and frequently asked questions'],
    call: ['اتصال بالطوارئ من مكان آمن', "پەیوەندییا فریاکەفتنێ ژ جهەکێ پاراستی", 'پەیوەندیی فریاکەوتن لە شوێنێکی سەلامەت', 'Call emergency services from a safe place'],
    latestNews: ['آخر الأخبار', 'دوماهیک نووچە', 'دوایین هەواڵەکان', 'Latest news'],
    topicNote: ['توعية عامة — بانتظار مراجعة بشرية', "هشیاریا گشتی — ل هیڤیا پێداچوونا مرۆڤی", 'هۆشیاریی گشتی — چاوەڕوانی پێداچوونەوەی مرۆیی', 'General education — human review pending']
  };
  const routes = {
    how: 'how-it-works.html', safety: 'safety-guide.html', equipment: 'equipment.html',
    training: 'training.html', glossary: 'glossary.html', sources: 'sources.html',
    updates: 'updates.html', status: 'service-status.html', privacy: 'privacy-accessibility.html'
  };
  let opener = null;
  const panel = document.createElement('section');
  panel.id = 'sections-panel';
  panel.className = 'sections-panel';
  panel.hidden = true;
  shell.append(panel);
  const mobile = document.createElement('dialog');
  mobile.id = 'sections-dialog';
  mobile.className = 'sections-dialog';
  mobile.setAttribute('aria-labelledby', 'sections-dialog-title');
  document.body.append(mobile);
  const locale = () => ids.includes(document.documentElement.dataset.locale) ? document.documentElement.dataset.locale : 'ar';
  const value = a => a[ids.indexOf(locale())];
  const text = key => value(words[key] || K.ui[key]);
  const url = route => {
    if (route.startsWith('tel:')) return route;
    const u = new URL(route, location.href);
    u.searchParams.set('lang', locale());
    return u.pathname.split('/').pop() + u.search + u.hash;
  };
  const item = (key, route = routes[key]) => ({ label: text(key), route });
  // Links and latest news managed in the admin panel (window.CD_CMS, injected by the server).
  const cmsMenu = (window.CD_CMS && window.CD_CMS.menu) || { links: [], latestNews: { show: false } };
  const cmsNews = (window.CD_CMS && window.CD_CMS.news) || [];
  function cmsExtras(id) {
    const own = cmsMenu.links.filter(l => l.group === id).map(l => ({ label: value(l.label) || l.label[0], route: l.url, position: l.position, cms: true }));
    const ln = cmsMenu.latestNews;
    const news = ln.show && ln.group === id ? cmsNews.slice(0, ln.count).map(n => ({ label: value(n.title) || n.title[0], route: 'index.html#news-' + n.slug, date: n.publishedAt, news: true })) : [];
    return { start: own.filter(l => l.position === 'start'), end: own.filter(l => l.position !== 'start'), news };
  }
  function groups() {
    return baseGroups().map(g => Object.assign(g, { extra: cmsExtras(g.id) }));
  }
  function baseGroups() {
    return [
      { id: 'about', items: [item('how'), item('allTopics', 'knowledge.html'), item('glossary'), item('sources')] },
      { id: 'services', items: [item('status'), item('prep', 'portal.html#services'), item('centers', 'service-status.html#centers'), {label: text('account') + ' · ' + text('notActive'), route: 'account.html'}] },
      { id: 'safety', items: [item('safety'), item('equipment'), item('training'), ...K.topics.map(t => ({label: value(t.title), route: 'topic-' + t.id + '.html'}))] },
      { id: 'sources', items: [item('sources'), item('updates'), item('glossary')] },
      { id: 'contact', items: [item('contactPage', 'portal.html#contact'), item('privacy'), item('call', 'tel:115')] }
    ];
  }
  // Line icons (24px grid, stroke) chosen by destination page.
  const svg = d => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  const icons = {
    book: '<path d="M2 5.5C4.5 4 7.5 4 12 6c4.5-2 7.5-2 10-.5V19c-2.5-1.5-5.5-1.5-10 .5-4.5-2-7.5-2-10-.5Z"/><path d="M12 6v13.5"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
    doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/><path d="M8 9h8M8 13h5"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
    status: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    shield: '<path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    tool: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4Z"/>',
    school: '<path d="m2 9 10-5 10 5-10 5Z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5M22 9v6"/>',
    fire: '<path d="M12 22a7 7 0 0 0 7-7c0-4-3-6.5-4-10-2 2-3 3.5-3 6-1-1-2-2-2.5-3.5C7 9.5 5 12 5 15a7 7 0 0 0 7 7Z"/>',
    news: '<path d="M4 4h13v16H6a2 2 0 0 1-2-2Z"/><path d="M17 8h3v10a2 2 0 0 1-4 0M8 8h5M8 12h5M8 16h3"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    water: '<path d="M2 15c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0M2 20c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0"/><path d="M12 3s-4 4.5-4 7a4 4 0 0 0 8 0c0-2.5-4-7-4-7Z"/>',
    quake: '<path d="M2 12h4l2-5 3 10 3-14 2 9h6"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7Z"/>',
    gas: '<path d="M7 21h10M8 21V9a4 4 0 0 1 8 0v12M10 5V3h4v2"/><path d="M12 13v3"/>',
    cloud: '<path d="M7 18a5 5 0 1 1 .9-9.9A6 6 0 0 1 19 10a4 4 0 0 1-1 7.9H7Z"/><path d="m11 21 1-3M15 21l1-3"/>',
    car: '<path d="M5 16V11l2-5h10l2 5v5M3 16h18v3H3Z"/><circle cx="7.5" cy="13" r="1"/><circle cx="16.5" cy="13" r="1"/>',
    height: '<path d="M8 3v18M16 3v18M8 7h8M8 12h8M8 17h8"/>',
    hazard: '<path d="M12 3 2 20h20Z"/><path d="M12 10v4M12 17h.01"/>',
    box: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V4h8v3M12 11v5"/>',
    tree: '<path d="M12 2 6 11h3l-4 6h14l-4-6h3Z"/><path d="M12 17v5"/>',
    tower: '<rect x="6" y="2" width="12" height="20" rx="1"/><path d="M10 6h1M13 6h1M10 10h1M13 10h1M10 14h1M13 14h1M11 22v-3h2v3"/>',
    building: '<path d="M3 21h18M5 21V10l7-6 7 6v11M9 21v-6h6v6"/>'
  };
  const iconFor = item => {
    const r = item.route;
    if (item.news) return icons.news;
    if (r.startsWith('tel:')) return icons.phone;
    const rules = [['history', 'book'], ['how-it-works', 'gear'], ['knowledge', 'doc'], ['glossary', 'chat'], ['sources', 'users'], ['updates', 'news'], ['service-status.html#centers', 'pin'], ['service-status', 'status'], ['account', 'user'], ['#services', 'doc'], ['safety-guide', 'shield'], ['equipment', 'tool'], ['training', 'school'], ['topic-floods', 'water'], ['topic-water-rescue', 'water'], ['topic-earthquakes', 'quake'], ['topic-electricity', 'bolt'], ['topic-gas', 'gas'], ['topic-severe-weather', 'cloud'], ['topic-road-rescue', 'car'], ['topic-height-rescue', 'height'], ['topic-hazardous', 'hazard'], ['topic-confined', 'box'], ['topic-wildfire', 'tree'], ['topic-high-rise', 'tower'], ['topic-inspection', 'shield'], ['topic-training-support', 'school'], ['topic-', 'fire'], ['#contact', 'chat'], ['privacy', 'lock'], ['index.html', 'building']];
    const hit = rules.find(([k]) => r.includes(k));
    return icons[hit ? hit[1] : 'link'];
  };
  const chevron = svg('<path d="m15 6-6 6 6 6"/>');
  function link(item) {
    const a = document.createElement('a');
    a.href = /^https?:/.test(item.route) ? item.route : url(item.route);
    if (/^https?:/.test(item.route)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    if (item.news) a.className = 'sections-news-link';
    const icon = document.createElement('span');
    icon.className = 'sections-link-icon';
    icon.innerHTML = svg(iconFor(item));
    const label = document.createElement('span');
    label.className = 'sections-link-label';
    label.textContent = item.label;
    a.append(icon, label);
    const arrow = document.createElement('span');
    arrow.className = 'sections-link-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    const tel = item.route.startsWith('tel:');
    if (tel || item.news) arrow.textContent = tel ? item.route.slice(4) : item.date;
    else { arrow.classList.add('sections-chevron'); arrow.innerHTML = chevron; }
    if (tel || item.news) arrow.dir = 'ltr';
    a.append(arrow);
    return a;
  }
  function closePanel(restore = false) {
    panel.hidden = true;
    nav.querySelectorAll('button').forEach(b => b.setAttribute('aria-expanded', 'false'));
    if (restore && opener) opener.focus();
    opener = null;
  }
  function placePanel() {
    if (!opener || panel.hidden || !document.body.classList.contains('reference-home')) return;
    const anchor = opener.getBoundingClientRect();
    const width = Math.min(640, innerWidth - 32);
    const top = anchor.bottom + 10;
    const start = document.documentElement.dir === 'rtl' ? anchor.right - width : anchor.left;
    const left = Math.max(16, Math.min(start, innerWidth - width - 16));
    const header = document.querySelector('.page > header').getBoundingClientRect();
    Object.assign(panel.style, {
      width: width + 'px', left: (left - header.left) + 'px', right: 'auto', top: (top - header.top) + 'px',
      maxHeight: Math.max(120, innerHeight - top - 20) + 'px'
    });
  }
  function openPanel(group, button) {
    if (opener === button && !panel.hidden) { closePanel(); return; }
    closePanel();
    opener = button;
    button.setAttribute('aria-expanded', 'true');
    panel.replaceChildren();
    const head = document.createElement('div');
    head.className = 'sections-panel-head';
    const title = document.createElement('h2');
    title.id = 'sections-panel-title';
    title.textContent = text(group.id);
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'sections-close';
    close.textContent = '×';
    close.setAttribute('aria-label', text('close'));
    close.addEventListener('click', () => closePanel(true));
    head.append(title, close);
    const description = document.createElement('p');
    description.className = 'sections-note';
    description.innerHTML = svg(icons.building);
    description.append(document.createTextNode(text('note')));
    const links = document.createElement('nav');
    links.className = 'sections-grid';
    links.setAttribute('aria-label', text(group.id));
    group.extra.start.forEach(i => links.append(link(i)));
    if (group.id === 'safety') {
      group.items.slice(0, 3).forEach(i => links.append(link(i)));
      ['fire', 'rescue', 'risk', 'prevention'].forEach(category => {
        const heading = document.createElement('h3');
        heading.className = 'sections-category';
        heading.textContent = value(K.ui[category]);
        links.append(heading);
        K.topics.filter(t => t.category === category).forEach(t => links.append(link({label: value(t.title), route: 'topic-' + t.id + '.html'})));
      });
    } else group.items.forEach(i => links.append(link(i)));
    group.extra.end.forEach(i => links.append(link(i)));
    if (group.extra.news.length) {
      const heading = document.createElement('h3');
      heading.className = 'sections-category';
      heading.textContent = text('latestNews');
      links.append(heading);
      group.extra.news.forEach(i => links.append(link(i)));
    }
    panel.setAttribute('aria-labelledby', title.id);
    panel.append(head, description, links);
    document.querySelector('#languages').hidden = true;
    document.querySelector('#language-open').setAttribute('aria-expanded', 'false');
    panel.hidden = false;
    placePanel();
  }
  function render() {
    closePanel();
    nav.classList.add('sections-primary');
    nav.setAttribute('aria-label', text('title'));
    nav.replaceChildren();
    const all = groups();
    // Logical keyboard order starts at Home; CSS follows the reading direction.
    all.forEach(group => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'sections-trigger';
      b.textContent = text(group.id);
      b.dataset.section = group.id;
      b.setAttribute('aria-expanded', 'false');
      b.setAttribute('aria-controls', panel.id);
      b.addEventListener('click', () => openPanel(group, b));
      b.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown') { e.preventDefault(); if (panel.hidden || opener !== b) openPanel(group, b); panel.querySelector('a')?.focus(); }
      });
      nav.append(b);
    });
    const home = link(item('home', 'index.html'));
    home.className = 'active';
    home.querySelector('.sections-link-arrow').remove();
    home.querySelector('.sections-link-icon').remove();
    home.setAttribute('aria-current', 'page');
    nav.prepend(home);
    const wasOpen = mobile.open;
    mobile.replaceChildren();
    const head = document.createElement('div');
    head.className = 'sections-panel-head';
    const title = document.createElement('h2');
    title.id = 'sections-dialog-title';
    title.textContent = text('title');
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'sections-close';
    close.textContent = '×';
    close.setAttribute('aria-label', text('close'));
    close.addEventListener('click', () => mobile.close());
    head.append(title, close);
    const note = document.createElement('p');
    note.className = 'sections-note';
    note.textContent = text('note');
    const body = document.createElement('nav');
    body.setAttribute('aria-label', text('title'));
    body.append(link(item('home', 'index.html')));
    all.forEach(group => {
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = text(group.id);
      const list = document.createElement('div');
      list.className = 'sections-mobile-links';
      [...group.extra.start, ...group.items, ...group.extra.end, ...group.extra.news].forEach(i => list.append(link(i)));
      details.append(summary, list);
      body.append(details);
    });
    mobile.append(head, note, body);
    menuButton.setAttribute('aria-controls', mobile.id);
    menuButton.setAttribute('aria-expanded', String(wasOpen));
  }
  menuButton.addEventListener('click', e => {
    e.stopImmediatePropagation();
    closePanel();
    document.querySelector('#languages').hidden = true;
    document.querySelector('#language-open').setAttribute('aria-expanded', 'false');
    mobile.showModal();
    document.body.classList.add('sections-dialog-open');
    menuButton.setAttribute('aria-expanded', 'true');
    mobile.querySelector('.sections-close').focus();
  }, true);
  mobile.addEventListener('close', () => { document.body.classList.remove('sections-dialog-open'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.focus(); });
  panel.addEventListener('click', e => { if (e.target.closest('a')) closePanel(); });
  mobile.addEventListener('click', e => { if (e.target.closest('a[href*="#news-"]')) mobile.close(); });
  document.addEventListener('click', e => { if (!panel.contains(e.target) && !e.target.closest('.sections-trigger')) closePanel(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { e.preventDefault(); closePanel(true); } });
  document.addEventListener('focusin', e => { if (!panel.hidden && !shell.contains(e.target)) closePanel(); });
  document.querySelector('#search-open').addEventListener('click', () => closePanel());
  document.querySelector('#language-open').addEventListener('click', () => closePanel());
  new MutationObserver(render).observe(document.documentElement, {attributes: true, attributeFilter: ['data-locale']});
  addEventListener('resize', () => { if (innerWidth <= 1100) closePanel(); else placePanel(); });
  addEventListener('scroll', () => { if (!panel.hidden) closePanel(); }, {passive: true});
  render();
})();
