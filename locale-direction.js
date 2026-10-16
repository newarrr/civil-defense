/* Shared locale boundary. Content renderers must apply this before rendering. */
(() => {
 'use strict';
 const locales=Object.freeze({ar:{lang:'ar',dir:'rtl'},badini:{lang:'ku-Arab',dir:'rtl'},sorani:{lang:'ckb',dir:'rtl'},en:{lang:'en',dir:'ltr'}});
 function apply(id){
  const locale=locales[id]||locales.ar;
  document.documentElement.lang=locale.lang;
  document.documentElement.dir=locale.dir;
  document.documentElement.dataset.locale=locales[id]?id:'ar';
  return locale;
 }
 window.CD_direction=Object.freeze({locales,apply});
 let initial='ar';try{initial=localStorage.getItem('cd-language')||initial;}catch{}
 apply(new URLSearchParams(location.search).get('lang')||initial);
 /* Only presentation metadata: never translate or rewrite content. */
 const enhance=()=>{
  document.querySelectorAll('.phone-number,.source-url,input[type="email"],input[type="tel"],input[type="url"]').forEach(el=>el.setAttribute('dir','ltr'));
  document.querySelectorAll('a[href^="tel:"] b,a[href^="tel:"] strong,time').forEach(el=>{
   if(/^[\d\s+().:/−–-]+$/.test(el.textContent.trim()))el.setAttribute('dir','ltr');
  });
  document.querySelectorAll('.kurdish-line,.page>header .brand small').forEach(el=>{el.lang='ku-Arab';el.dir='rtl';});
  document.querySelectorAll('[data-language],[data-lang]').forEach(el=>{
   const locale=locales[el.dataset.language||el.dataset.lang];
   if(locale){el.lang=locale.lang;el.dir=locale.dir;}
  });
 };
 document.addEventListener('DOMContentLoaded',()=>{
  enhance();
  new MutationObserver(records=>{if(records.some(r=>r.addedNodes.length))enhance();}).observe(document.body,{childList:true,subtree:true});
 });
})();
