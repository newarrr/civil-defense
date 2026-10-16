/* Apply the saved appearance before styles paint; language and draft storage stay separate. */
(() => {
 'use strict';
 const root=document.documentElement,key='cd-display-theme',valid=v=>v==='light'||v==='dark';
 let theme='light';try{const requested=new URLSearchParams(location.search).get('theme');const saved=localStorage.getItem(key);theme=valid(requested)?requested:valid(saved)?saved:'light';if(valid(requested))localStorage.setItem(key,requested)}catch{}
 const words={ar:{light:'فاتح',dark:'داكن',appearance:'المظهر',toLight:'الوضع الفاتح',toDark:'الوضع الداكن'},badini:{light:'ڕوون',dark:'تاری',appearance:'ڕووکار',toLight:'ڕووکارێ ڕوون',toDark:'ڕووکارێ تاری'},sorani:{light:'ڕوون',dark:'تاریک',appearance:'ڕووکار',toLight:'ڕووکاری ڕوون',toDark:'ڕووکاری تاریک'},en:{light:'Light',dark:'Dark',appearance:'Appearance',toLight:'Light mode',toDark:'Dark mode'}};
 const sun='<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/>';
 const moon='<path d="M20.8 13.4A9 9 0 0 1 10.6 3.2a9 9 0 1 0 10.2 10.2Z"/>';
 const icon=kind=>`<svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">${kind==='light'?sun:moon}</svg>`;
 const labels=()=>words[root.dataset.locale]||words.ar;
 function updateControls(){
  const text=labels(),state=theme+'-'+(root.dataset.locale||'ar');
  document.querySelectorAll('[data-theme-toggle]').forEach(button=>{
   const label=theme==='dark'?text.toLight:text.toDark;button.setAttribute('aria-label',label);button.title=label;button.setAttribute('aria-pressed',String(theme==='dark'));
   if(button.dataset.themeState!==state){button.innerHTML=icon(theme==='dark'?'light':'dark');button.dataset.themeState=state}
  });
  document.querySelectorAll('.theme-preference').forEach(group=>{
   group.setAttribute('aria-label',text.appearance);
   if(group.dataset.themeState!==state){group.innerHTML=`<span class="theme-preference-label">${text.appearance}</span><div class="theme-segments">${['light','dark'].map(value=>`<button type="button" data-set-theme="${value}" aria-pressed="${theme===value}">${icon(value)}<span>${text[value]}</span></button>`).join('')}</div>`;group.dataset.themeState=state}
  });
 }
 function apply(value,persist=false){
  if(!valid(value))return;theme=value;root.dataset.theme=value;root.style.colorScheme=value;
  const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=value==='dark'?'#101a22':'#faf8f4';
  if(persist){try{localStorage.setItem(key,value)}catch{}const url=new URL(location.href);if(url.searchParams.has('theme')){url.searchParams.set('theme',value);history.replaceState(null,'',url)}}
  updateControls();
 }
 apply(theme);
 window.CDTheme=Object.freeze({get:()=>theme,set:value=>apply(value,true)});
 function mount(){
  const host=document.querySelector('.reference-home .tools')||document.querySelector('.header-actions')||document.querySelector('.language-controls')||document.querySelector('.account-languages');
  if(host&&!host.querySelector('[data-theme-toggle]')){const button=document.createElement('button');button.type='button';button.className='theme-toggle';button.dataset.themeToggle='';host.append(button)}
  const utilities=document.querySelector('.site-footer .footer-utilities');
  if(utilities&&!utilities.querySelector('.theme-preference')){const group=document.createElement('div');group.className='theme-preference';group.setAttribute('role','group');utilities.append(group)}
  updateControls();
 }
 function init(){
  apply(theme);mount();let pending=false;
  new MutationObserver(()=>{if(!pending){pending=true;queueMicrotask(()=>{pending=false;mount()})}}).observe(document.body,{childList:true,subtree:true});
  new MutationObserver(updateControls).observe(root,{attributes:true,attributeFilter:['data-locale']});
  addEventListener('resize',()=>{const nav=document.querySelector('.sections-primary'),panel=document.querySelector('#sections-panel');if(nav&&panel&&!panel.hidden&&getComputedStyle(nav).display==='none')panel.querySelector('.sections-close')?.click()});
  document.addEventListener('click',event=>{
   const button=event.target.closest('[data-theme-toggle],[data-set-theme]');if(!button)return;
   const next=button.dataset.setTheme||(theme==='dark'?'light':'dark');const fromGroup=button.hasAttribute('data-set-theme');apply(next,true);
   if(fromGroup)document.querySelector(`[data-set-theme="${next}"]`)?.focus({preventScroll:true});
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 addEventListener('storage',event=>{if(event.key===key)apply(valid(event.newValue)?event.newValue:'light')});
})();
