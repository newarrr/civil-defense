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
    call: ['اتصال بالطوارئ من مكان آمن', 'پەیوەندیا فریاکەفتنێ ژ جهەکێ پاراستی', 'پەیوەندیی فریاکەوتن لە شوێنێکی سەلامەت', 'Call emergency services from a safe place'],
    topicNote: ['توعية عامة — بانتظار مراجعة بشرية', 'هشیارییا گشتی — ل هیڤیا پێداچوونا مرۆڤی', 'هۆشیاریی گشتی — چاوەڕوانی پێداچوونەوەی مرۆیی', 'General education — human review pending']
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
  function groups() {
    return [
      { id: 'about', items: [item('how'), item('allTopics', 'knowledge.html'), item('glossary'), item('sources')] },
      { id: 'services', items: [item('status'), item('prep', 'portal.html#services'), item('centers', 'service-status.html#centers'), {label: text('account') + ' · ' + text('notActive'), route: 'account.html'}] },
      { id: 'safety', items: [item('safety'), item('equipment'), item('training'), ...K.topics.map(t => ({label: value(t.title), route: 'topic-' + t.id + '.html'}))] },
      { id: 'sources', items: [item('sources'), item('updates'), item('glossary')] },
      { id: 'contact', items: [item('contactPage', 'portal.html#contact'), item('privacy'), item('call', 'tel:115')] }
    ];
  }
  function link(item) {
    const a = document.createElement('a');
    a.href = url(item.route);
    const label = document.createElement('span');
    label.textContent = item.label;
    a.append(label);
    const arrow = document.createElement('span');
    arrow.className = 'sections-link-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = item.route.startsWith('tel:') ? '115' : '↗';
    if (item.route.startsWith('tel:')) arrow.dir = 'ltr';
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
    const width = Math.min(440, innerWidth - 32);
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
    description.textContent = text('note');
    const links = document.createElement('nav');
    links.className = 'sections-grid';
    links.setAttribute('aria-label', text(group.id));
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
      group.items.forEach(i => list.append(link(i)));
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
