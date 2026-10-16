/* Exact wording supplied by the user. Other locale dictionaries are preserved. */
(() => {
  const phrases = [
    'پێکڤە، ژ بۆ کۆمەڵگەهەکا پاراستیتر',
    'بەرگرییا شارستانی؛ پارێزەرێ ژیان و سامانێ وە',
    'بەرگرییا شارستانی',
    'پاراستنا ژیان و سامانان، بەرپرسیاریا هەمی مە'
  ];
  const secondary = document.querySelector('.hero-copy .kurdish-line');
  const originalSecondary = secondary?.textContent;
  const heading = document.querySelector('.hero-copy h1');
  const kicker = document.querySelector('.hero-copy .kicker');
  const duplicateBrand = document.querySelector('body>.page>header .brand small');
  function put(selector, text) { document.querySelectorAll(selector).forEach(n => { if(n.textContent !== text) n.textContent = text; }); }
  function apply() {
    const active = document.documentElement.dataset.locale === 'badini';
    if(secondary) secondary.textContent = active ? phrases[3] : originalSecondary;
    if(duplicateBrand) duplicateBrand.hidden = active;
    if(heading) { if(active) heading.setAttribute('aria-label',phrases[0]); else heading.removeAttribute('aria-label'); }
    if(kicker) { if(active) kicker.setAttribute('aria-hidden','true'); else kicker.removeAttribute('aria-hidden'); }
    if(active) {
      put('[data-text="hero1"]','پێکڤە، ژ بۆ');
      put('[data-text="hero2"]','کۆمەڵگەهەکا');
      put('[data-text="hero3"]','پاراستیتر');
      put('[data-text="protection"]',phrases[1]);
      put('[data-text="brand"],[data-i18n="brand"],[data-account="brand"]',phrases[2]);
      document.documentElement.dataset.badiniFontReady = 'pending';
      document.fonts.ready.then(() => {
        if(document.documentElement.dataset.locale === 'badini') document.documentElement.dataset.badiniFontReady = String(document.fonts.check('800 20px "Duhok Noto Kufi"',phrases[0]) && document.fonts.check('400 20px "Duhok Noto Sans"',phrases[3]));
      });
    } else document.documentElement.dataset.badiniFontReady = 'not-needed';
    const footer = document.querySelector('footer');
    if(footer) {
      let motto = footer.querySelector('.badini-motto');
      if(!motto) { motto = document.createElement('p');motto.className='badini-motto';motto.lang='ku-Arab';motto.dir='rtl';(footer.querySelector('.wrap') || footer).prepend(motto); }
      motto.textContent = phrases[3];
      motto.hidden = !active;
    }
  }
  new MutationObserver(apply).observe(document.documentElement,{attributes:true,attributeFilter:['data-locale']});
  apply();
})();
