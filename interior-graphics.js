/* Original 2D interface graphics. No operational photographs or local capability claims. */
(() => {
  'use strict';
  const K = window.Knowledge;
  const paths = {
    shield: '<path d="m32 7 20 8v16c0 15-20 25-20 25S12 46 12 31V15Z"/><path d="m22 31 7 7 15-17"/>',
    fire: '<path d="M34 6c8 15-10 17-10 29 0 9 14 14 19 3 2-5 0-10-3-14 18 13 20 26 7 33-13 8-32 2-34-12C10 27 28 22 34 6Z"/>',
    book: '<path d="M8 13h15q9 0 9 8 0-8 9-8h15v38H41q-9 0-9 5-1-5-10-5H8Zm24 8v35M16 24h9m-9 9h9m14-9h9m-9 9h9"/>',
    people: '<circle cx="25" cy="20" r="9"/><path d="M9 54v-8a16 16 0 0 1 32 0v8m0-44a9 9 0 0 1 0 18m6 7q9 2 9 12v7"/>',
    document: '<path d="M13 7h26l12 12v38H13Zm26 0v14h12M22 30h20M22 39h20M22 48h13"/>',
    pin: '<path d="M51 26c0 15-19 31-19 31S13 41 13 26a19 19 0 0 1 38 0Z"/><circle cx="32" cy="26" r="7"/>',
    source: '<circle cx="32" cy="32" r="24"/><path d="M8 32h48M32 8c-17 15-17 33 0 48 17-15 17-33 0-48Z"/>',
    equipment: '<path d="M24 21h16q8 0 8 10v25H16V31q0-10 8-10Zm2 0V11h13v10m-15-10-7-5h28m-5 9h7q11 0 11 15v12"/><path d="M25 32h14v16H25Z"/>',
    route: '<circle cx="13" cy="47" r="6"/><circle cx="51" cy="17" r="6"/><path d="M19 47h19q12 0 12-11T38 25H25q-12 0-12-12h20m-6-6 6 6-6 6"/>'
  };
  const graphic = (name, cls = 'graphic-icon') => {
    const el = document.createElement('span');
    el.className = cls;
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.shield}</svg>`;
    return el;
  };
  const lang = () => ['ar', 'badini', 'sorani', 'en'].indexOf(document.documentElement.dataset.locale || 'ar');
  const val = a => a[lang() < 0 ? 0 : lang()];
  const wording = {
    heading: ['مسارات المعرفة والخدمات', 'ڕێکێن زانیاری و خزمەتگوزاریان', 'ڕێڕەوی زانیاری و خزمەتگوزاری', 'Knowledge and service pathways'],
    intro: ['اختر موضوعاً للتعلّم أو الاطلاع على حالة الخدمات ومصادر المعلومات.', 'بابەتەکی بۆ فێربوونێ یان دیتنا بارێ خزمەتگوزاریان و ژێدەران هەلبژێرە.', 'بابەتێک بۆ فێربوون یان بینینی دۆخی خزمەتگوزاری و سەرچاوەکان هەڵبژێرە.', 'Choose a learning topic or review service status and information sources.'],
    explore: ['استكشف القسم', 'بەشی ببینە', 'بەشەکە ببینە', 'Explore section'],
    learn: ['معرفة وتوعية', 'زانیاری و هشیاری', 'زانیاری و هۆشیاری', 'Knowledge and awareness']
  };
  const routes = {
    how: ['how-it-works.html', 'route', 'cycleNote'],
    safety: ['safety-guide.html', 'shield', 'intro'],
    sources: ['sources.html', 'source', 'scope'],
    equipment: ['equipment.html', 'equipment', 'equipmentNote'],
    training: ['training.html', 'people', 'checklistNote'],
    glossary: ['glossary.html', 'book', 'review'],
    status: ['service-status.html', 'document', 'localDraft'],
    privacy: ['privacy-accessibility.html', 'shield', 'privacyText']
  };
  function emblem(name) {
    const el = document.createElement('div');
    el.className = 'route-emblem';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<svg class="emblem-orbit" viewBox="0 0 320 220" fill="none"><g stroke="currentColor"><circle cx="160" cy="110" r="96"/><circle cx="160" cy="110" r="77"/><circle cx="160" cy="110" r="57"/><path d="M0 110h70m180 0h70M160 0v20m0 180v20M30 25l37 30m185 110 38 30M30 195l37-30m185-110 38-30"/></g><g fill="currentColor"><circle cx="64" cy="110" r="5"/><circle cx="256" cy="110" r="5"/><circle cx="160" cy="14" r="5"/></g></svg>';
    el.append(graphic(name, 'emblem-symbol'));
    return el;
  }
  function portal() {
    const banner = document.querySelector('.interior-banner .wrap');
    const atlas = document.createElement('section');
    atlas.className = 'graphic-atlas wrap';
    atlas.setAttribute('aria-labelledby', 'atlas-heading');
    document.querySelector('.interior-banner').after(atlas);
    function render() {
      const route = location.hash.slice(1) || 'services';
      const selected = {
        about: ['how', 'glossary', 'sources'], services: ['status', 'equipment', 'training'],
        awareness: ['safety', 'equipment', 'training'], centers: ['status', 'sources', 'how'],
        faq: ['how', 'safety', 'status'], contact: ['privacy', 'sources', 'status']
      }[route] || ['how', 'safety', 'sources'];
      banner.querySelector('.route-emblem')?.remove();
      banner.append(emblem({about:'shield',services:'document',awareness:'book',centers:'pin',contact:'people',faq:'source'}[route] || 'shield'));
      atlas.replaceChildren();
      const head = document.createElement('div');
      head.className = 'atlas-heading';
      const copy = document.createElement('div');
      const eyebrow = document.createElement('span');
      eyebrow.className = 'graphic-eyebrow';
      eyebrow.textContent = val(wording.learn);
      const h2 = document.createElement('h2');
      h2.id = 'atlas-heading';
      h2.textContent = val(wording.heading);
      const intro = document.createElement('p');
      intro.textContent = val(wording.intro);
      copy.append(eyebrow, h2, intro);
      head.append(copy);
      const grid = document.createElement('div');
      grid.className = 'atlas-grid';
      selected.forEach((key, index) => {
        const [file, icon, description] = routes[key];
        const a = document.createElement('a');
        a.className = 'atlas-card';
        a.href = file + '?lang=' + (document.documentElement.dataset.locale || 'ar');
        const top = document.createElement('div');
        top.className = 'atlas-card-top';
        const number = document.createElement('bdi');
        number.textContent = '0' + (index + 1);
        top.append(graphic(icon), number);
        const title = document.createElement('h3');
        title.textContent = val(K.ui[key]);
        const body = document.createElement('p');
        body.textContent = val(K.ui[description]);
        const action = document.createElement('span');
        action.className = 'atlas-action';
        action.textContent = val(wording.explore) + (document.documentElement.dir === 'ltr' ? ' →' : ' ←');
        a.append(top, title, body, action);
        grid.append(a);
      });
      atlas.append(head, grid);
    }
    addEventListener('hashchange', render);
    new MutationObserver(render).observe(document.documentElement, {attributes:true, attributeFilter:['data-locale']});
    render();
  }
  function knowledge() {
    function decorate() {
      const intro = document.querySelector('.intro');
      if (intro && !intro.querySelector('.route-emblem')) intro.append(emblem(document.body.dataset.page === 'equipment' ? 'equipment' : 'shield'));
      document.querySelectorAll('.card').forEach(card => {
        if (card.querySelector('.graphic-icon')) return;
        const href = card.getAttribute('href') || '';
        const topic = K.topics.find(t => href.startsWith('topic-' + t.id + '.html'));
        card.prepend(graphic({fire:'fire',rescue:'people',risk:'shield',prevention:'book'}[topic?.category] || 'book'));
      });
    }
    new MutationObserver(decorate).observe(document.querySelector('#app'), {childList:true, subtree:true});
    decorate();
  }
  if (document.body.classList.contains('interior-page')) portal();
  else if (document.body.dataset.page) knowledge();
})();
