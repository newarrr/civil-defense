/* The homepage footer uses existing pages and the project's available contact data. */
(() => {
 'use strict';
 const footer=document.querySelector('.page > footer');
 footer.className='site-footer';footer.id='site-footer';
 const copy={
 eyebrow:['معكم، من أجل السلامة','پێکڤە، ژ بۆ پاراستنێ','پێکەوە، بۆ سەلامەتی','Here for a safer community'],
 cta:['المعرفة أول خطوة نحو مجتمع أكثر أماناً',"زانیاری، گاڤا ئێکێ بو سەلامەتیا جڤاکی",'زانیاری، یەکەم هەنگاو بۆ کۆمەڵگەیەکی سەلامەتتر','A safer community starts with awareness'],
 ctaDesc:['أدلة التوعية، معلومات الوقاية، وموضوعات الدفاع المدني في مكان واحد.','ڕێنماییێن هشیاریێ، زانیاریێن پێشگیریێ و بابەتێن بەرگرییا شارستانی ل جهەکێ.','ڕێنمایی هۆشیاری، زانیاریی پێشگیری و بابەتەکانی بەرگری شارستانی لە یەک شوێن.','Explore awareness guides, prevention information and civil defense topics in one place.'],
 explore:['استكشف دليل المعرفة','ڕێبەرا زانیاریێ ببینە','ڕێبەری زانیاری ببینە','Explore the knowledge guide'],
 contact:['التواصل والمساعدة','پەیوەندی و هاریکاری','پەیوەندی و یارمەتی','Contact and help'],
 emergency:['الدفاع المدني · الطوارئ','بەرگرییا شارستانی · فریاکەفتن','بەرگری شارستانی · فریاکەوتن','Civil defense · Emergencies'],
 emergencyText:['للطوارئ، اتصل مباشرة من مكان آمن','بۆ فریاکەفتنێ، ژ جهەکێ پاراستی ڕاستەوخۆ پەیوەندیێ بکە','بۆ فریاکەوتن، لە شوێنێکی سەلامەتەوە ڕاستەوخۆ پەیوەندی بکە','For emergencies, call directly from a safe place'],
 call:['اتصل الآن','نوکە پەیوەندیێ بکە','ئێستا پەیوەندی بکە','Call now'],
 brand:['الدفاع المدني — دهوك','بەرگرییا شارستانی — دهۆک','بەرگری شارستانی — دهۆک','Civil Defense — Duhok'],
 brandDesc:['بوابة للمعلومات والتوعية بأعمال الدفاع المدني، والوقاية، والاستعداد، ودليل الخدمات للمجتمع.',"دەروازەکا زانیاری و هشیاریێ دەربارەی کارێن بەرگرییا شارستانی، پێشگیری، ئامادەکاری و ڕێبەرا خزمەتێن جڤاکی.",'دەروازەی زانیاری و هۆشیاری دەربارەی کارەکانی بەرگری شارستانی، پێشگیری، ئامادەکاری و ڕێبەری خزمەتگوزاریی کۆمەڵگا.','An information and awareness portal for civil defense, prevention, preparedness and community service guidance.'],
 region:['إقليم كردستان العراق · محافظة دهوك','هەرێما کوردستانێ · پارێزگەها دهۆکێ','هەرێمی کوردستانی عێراق · پارێزگای دهۆک','Kurdistan Region, Iraq · Duhok Governorate'],
 discover:['اكتشف البوابة','دەروازەیێ ببینە','دەروازە ببینە','Explore the portal'],
 about:['عن الدفاع المدني','دەربارەی بەرگرییا شارستانی','دەربارەی بەرگری شارستانی','About civil defense'],
 knowledge:['موسوعة المعرفة','ئینسایکلۆپیدیا زانیاریێ','ئینسایکلۆپیدیای زانیاری','Knowledge library'],
 guides:['أدلة السلامة والوقاية','ڕێنماییێن پاراستن و پێشگیریێ','ڕێنماییەکانی سەلامەتی و پێشگیری','Safety and prevention guides'],
 updates:['المصادر والتحديثات','ژێدەر و نووکرن','سەرچاوە و نوێکردنەوە','Sources and updates'],
 glossary:['قاموس المصطلحات','فەرهەنگا زاراڤان','فەرهەنگی زاراوەکان','Terms and glossary'],
 services:['الخدمات والاستعداد','خزمەت و ئامادەکاری','خزمەتگوزاری و ئامادەکاری','Services and preparedness'],
 preparation:['دليل تحضير الطلبات','ڕێبەرا ئامادەکرنا داخوازان','ڕێبەری ئامادەکردنی داواکاری','Request preparation guide'],
 status:['حالة الخدمات','بارودۆخێ خزمەتان','دۆخی خزمەتگوزارییەکان','Service availability'],
 centers:['دليل المراكز','ڕێبەرا ناڤەندان','ڕێبەری ناوەندەکان','Center information'],
 training:['التدريب والتوعية','فێرکرن و هشیارکرن','ڕاهێنان و هۆشیاری','Training and awareness'],
 equipment:['دليل المعدات','ڕێبەرا کەرەستان','ڕێبەری کەرەستەکان','Equipment guide'],
 admin:['معلومات التواصل الإداري','زانیاریێن پەیوەندییا ئیداری','زانیاریی پەیوەندیی کارگێڕی','Administrative contact information'],
 officePending:['العنوان التفصيلي، أوقات الدوام وأرقام المكاتب تُضاف بعد اعتماد بيانات المديرية.','ناڤونیشانێ ورد، دەمێن کار و ژمارێن مەکتەبان پشتی پەسەندکرنا زانیاریێن ڕێڤەبەریێ دێ هێنە زێدەکرن.','ناونیشانی ورد، کاتەکانی کار و ژمارەی نووسینگەکان دوای پەسەندکردنی زانیاریی بەڕێوەبەرایەتی زیاد دەکرێن.','Office address, opening hours and office numbers will be added after directorate approval.'],
 help:['المساعدة والأسئلة الشائعة','هاریکاری و پرسیارێن بەربەلاڤ','یارمەتی و پرسیارە باوەکان','Help and frequently asked questions'],
 ministry:['موقع وزارة الداخلية','ماڵپەرێ وەزارەتا ناڤخۆ','ماڵپەڕی وەزارەتی ناوخۆ','Ministry of Interior website'],
 transparency:['معلومات المحتوى والخدمات','زانیاریێن ناڤەرۆک و خزمەتان','زانیاریی ناوەڕۆک و خزمەتگوزارییەکان','Content and service information'],
 education:['محتوى تعليمي ومصادر مرجعية','ناڤەرۆکا فێرکاری و ژێدەر','ناوەڕۆکی فێرکاری و سەرچاوە','Educational content and reference sources'],
 digital:['الخدمات الإلكترونية قيد التجهيز','خزمەتێن ئەلیکترۆنی د ئامادەکرنێ دا نە','خزمەتگوزارییە ئەلیکترۆنییەکان لە ئامادەکاریدان','Online services are in preparation'],
 languages:['اختر اللغة',"زمانێ هەلبژێرە",'زمان هەڵبژێرە','Choose language'],
 privacy:['الخصوصية وإمكانية الوصول','تایبەتمەندی و دەستگەهشتن','تایبەتمەندی و دەستڕاگەیشتن','Privacy and accessibility'],
 sourcePolicy:['المصادر ومنهجية المحتوى','ژێدەر و ڕێبازا ناڤەرۆکێ','سەرچاوە و ڕێبازی ناوەڕۆک','Sources and content approach'],
 top:['العودة إلى أعلى الصفحة','ڤەگەڕیان بۆ سەرێ ڕووپەلی','گەڕانەوە بۆ سەرەوەی پەڕە','Back to top'],
 version:['نسخة تطويرية',"وەشانا پێشڤەبرنێ",'وەشانی گەشەپێدان','Development preview'],
 translation:['الترجمات الكردية قيد المراجعة اللغوية','وەرگێڕانێن کوردی د پێداچوونا زمانڤانیێ دا نە','وەرگێڕانە کوردییەکان لە پێداچوونەوەی زمانەوانیدان','Kurdish translations are under language review'],
 motto:['حماية الأرواح والممتلكات مسؤوليتنا جميعاً','پاراستنا ژیان و سامانان، بەرپرسیاریا هەمی مە','پاراستنی ژیان و موڵک و ماڵ بەرپرسیاریی هەموومانە','Protecting lives and property is our shared responsibility']
 };
 const locale=()=>document.documentElement.dataset.locale;
 const text=key=>copy[key][({ar:0,badini:1,sorani:2,en:3})[locale()]??0];
 const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const url=path=>{const target=new URL(path,location.href);target.searchParams.set('lang',locale());return target.pathname.split('/').pop()+target.search+target.hash};
 const svg=(name)=>`<svg viewBox="0 0 24 24" aria-hidden="true" class="footer-icon">${({phone:'<path d="m7 3 3 5-3 3c2 3 3 4 6 6l3-3 5 3c0 4-3 5-5 4C9 19 5 15 3 8 2 6 3 3 7 3Z"/>',arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',pin:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',shield:'<path d="m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6Z"/><path d="m8 12 3 3 5-6"/>',up:'<path d="M12 20V4m-6 6 6-6 6 6"/>'})[name]}</svg>`;
 const item=(label,path)=>`<a href="${url(path)}">${esc(text(label))}<span aria-hidden="true">↗</span></a>`;
 function renderFooter(){
  footer.innerHTML=`<section class="footer-invitation" aria-labelledby="footer-invitation-title"><div><p class="footer-eyebrow">${esc(text('eyebrow'))}</p><h2 id="footer-invitation-title">${esc(text('cta'))}</h2><p>${esc(text('ctaDesc'))}</p></div><div class="footer-invitation-actions"><a class="footer-primary" href="${url('knowledge.html')}">${esc(text('explore'))}${svg('arrow')}</a><a class="footer-secondary" href="${url('portal.html#contact')}">${esc(text('contact'))}</a></div></section>
  <div class="footer-dark"><section class="footer-emergency" aria-label="${esc(text('emergency'))}"><div class="footer-emergency-label"><span class="footer-phone-icon">${svg('phone')}</span><div><h2>${esc(text('emergency'))}</h2><p>${esc(text('emergencyText'))}</p></div></div><a href="tel:115" class="footer-call"><strong dir="ltr">115</strong><span>${esc(text('call'))}${svg('arrow')}</span></a></section>
  <div class="footer-columns"><section class="footer-brand"><a class="footer-brand-link" href="${url('index.html')}"><img src="assets/civil-defense-logo.png" alt="${esc(text('brand'))}" width="64" height="78"><h2>${esc(text('brand'))}</h2></a><p>${esc(text('brandDesc'))}</p><span class="footer-region">${svg('pin')}${esc(text('region'))}</span><p class="footer-motto">${esc(text('motto'))}</p></section>
  <nav class="footer-link-column" aria-labelledby="footer-discover-title"><h2 id="footer-discover-title">${esc(text('discover'))}</h2>${[['about','how-it-works.html'],['knowledge','knowledge.html'],['guides','safety-guide.html'],['updates','updates.html'],['glossary','glossary.html']].map(([a,b])=>item(a,b)).join('')}</nav>
  <nav class="footer-link-column" aria-labelledby="footer-services-title"><h2 id="footer-services-title">${esc(text('services'))}</h2>${[['preparation','portal.html#services'],['status','service-status.html'],['centers','service-status.html#centers'],['training','training.html'],['equipment','equipment.html']].map(([a,b])=>item(a,b)).join('')}</nav>
  <section class="footer-contact"><h2>${esc(text('contact'))}</h2><p class="footer-contact-place">${svg('pin')}${esc(text('region'))}</p><a class="footer-help-link" href="${url('portal.html#contact')}">${esc(text('help'))}<span aria-hidden="true">↗</span></a><a class="footer-help-link" href="https://gov.krd/moi-en/" target="_blank" rel="noopener noreferrer">${esc(text('ministry'))}<span aria-hidden="true">↗</span></a><div class="footer-office"><h3>${esc(text('admin'))}</h3><p>${esc(text('officePending'))}</p></div></section></div>
  <div class="footer-utilities"><div class="footer-content-state"><h2>${esc(text('transparency'))}</h2><a href="${url('sources.html')}">${svg('shield')}${esc(text('education'))}</a><a href="${url('service-status.html')}"><span class="footer-state-dot" aria-hidden="true"></span>${esc(text('digital'))}</a></div><div class="footer-languages"><span>${esc(text('languages'))}</span><div role="group" aria-label="${esc(text('languages'))}">${[['badini','بادینی','ku-Arab'],['sorani','سۆرانی','ckb'],['ar','العربية','ar'],['en','English','en']].map(([id,label,lang])=>`<button type="button" data-footer-lang="${id}" lang="${lang}" aria-pressed="${locale()===id}">${label}</button>`).join('')}</div></div></div>
  <div class="footer-bottom"><p>© 2026 <span>${esc(text('brand'))}</span><span class="footer-preview">${esc(text('version'))}</span></p><nav aria-label="${esc(text('sourcePolicy'))}"><a href="${url('privacy-accessibility.html')}">${esc(text('privacy'))}</a><a href="${url('sources.html')}">${esc(text('sourcePolicy'))}</a><a href="#main" class="footer-to-top">${esc(text('top'))}${svg('up')}</a></nav></div><p class="footer-language-note">${esc(text('translation'))}</p></div>`;
 }
 footer.addEventListener('click',event=>{
  const button=event.target.closest('[data-footer-lang]');
  if(button){const lang=button.dataset.footerLang;document.querySelector(`[data-lang="${lang}"]`).click();requestAnimationFrame(()=>footer.querySelector(`[data-footer-lang="${lang}"]`)?.focus({preventScroll:true}));}
  const top=event.target.closest('.footer-to-top');if(top){event.preventDefault();const main=document.querySelector('#main');main.setAttribute('tabindex','-1');main.focus({preventScroll:true});scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});}
 });
 new MutationObserver(renderFooter).observe(document.documentElement,{attributes:true,attributeFilter:['data-locale']});
 renderFooter();
})();
