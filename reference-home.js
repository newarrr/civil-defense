/* Native, localized controls over the photographs supplied with the design. */
(() => {
 'use strict';
 const words={
 brand:['مديرية الدفاع المدني','بەرگرییا شارستانی','بەرگری شارستانی','Civil Defense Directorate'],
 duhok:['محافظة دهوك','پارێزگەها دهۆکێ','پارێزگای دهۆک','Duhok Governorate'],
 kicker:['شركاء المجتمع في السلامة',"پێکڤە دگەل جڤاکی",'هاوپەیمان لەگەڵ کۆمەڵگا','Together with our community'],
 title:['لحماية',"بو پاراستنا",'بۆ پاراستنی','Protecting'],
 life:['الحياة',"ژیانێ",'ژیان','lives'],
 titleEnd:['وسلامة المجتمع',"و سەلامەتیا جڤاکی",'و سەلامەتی کۆمەڵگە','and our community'],
 intro:['مديرية الدفاع المدني في محافظة دهوك. دائماً في خدمتكم للوقاية والاستعداد والمساعدة في أوقات الطوارئ والحوادث.',"بەرگرییا شارستانی یا پارێزگەها دهۆکێ\nهەردەم ل خزمەتا هەوەیە؛ بو پێشگیری، ئامادەکاری\nو هاریکاریێ د دەمێ کارەسات و ڕوودانان دا.",'بەرگری شارستانیی پارێزگای دهۆک\nهەمیشە لە خزمەتدا بۆ پێشگیری، ئامادەبوون\nو هاوکاری لە کاتی کارەسات و ڕووداوەکاندا.','Duhok Civil Defense Directorate. Here to help with prevention, preparedness and support during emergencies and incidents.'],
 emergency:['اتصال الطوارئ',"پەیوەندییا فریاکەفتنێ",'پەیوەندیی فریاکەوتن','Emergency call'],
 rescue:['الإنقاذ والمساعدة',"ڕزگارکرن و هاریکاری",'ڕزگارکردن و هاوکاری','Rescue and support'],
 rescueDesc:['في أوقات الطوارئ والحوادث',"د دەمێ کارەسات و ڕوودانان دا",'لە کاتی کارەسات و ڕووداوەکاندا','During emergencies and incidents'],
 nature:['حماية البيئة والطبيعة',"پاراستنا ژینگەهێ و سروشتی",'پاراستنی ژینگە و سروشت','Protecting our environment'],
 natureDesc:['الوقاية من حرائق الغابات',"پێشگیری ژ ئاگرێ دارستانان",'پێشگیری لە کەوتنەوەی ئاگردا','Preventing wildfires'],
 environment:['حماية البيئة\nوالطبيعة',"پاراستنا ژینگەهێ\nو سروشتی",'پاراستنی ژینگە\nو سروشت','Environment\nand nature'],
 environmentSub:['من أجل مستقبل آمن',"بو داهاتوویەکێ پاراستی",'بۆ داهاتوویەکی سەلامەت','For a safer future'],
 response:['الإنقاذ\nوالاستجابة',"ڕزگارکرن\nو بەرسڤدان",'ڕزگارکردن\nو کارامەیی','Rescue\nand response'],
 responseSub:['في أوقات الطوارئ',"د دەمێ کارەساتان دا",'لە کاتی کارەساتدا','When emergencies happen'],
 prevention:['الوقاية\nوالتوعية',"پێشگیری\nو هشیاری",'پێشگیری\nو هۆشیاری','Prevention\nand awareness'],
 preventionSub:['من أجل مجتمع أكثر أماناً',"بو سەلامەتیا جڤاکی",'بۆ کۆمەڵگەیەکی سەلامەتتر','For a safer community'],
 community:['مساعدة\nالمواطنين',"هاریکارییا\nهاوڵاتیان",'هاوکاری\nهاووڵاتیان','Community\nsupport'],
 communitySub:['في كل الأوقات',"د هەمی دەمان دا",'لە هەموو کاتێکدا','Here when you need us'],
 heading:['التوعية والمعلومات للجميع',"هشیاری و زانیاری بو هەمیان",'هۆشیاری و زانیاری بۆ هەمووان','Safety information for everyone'],
 all:['عرض جميع المواضيع',"هەمی بابەتان ببینە",'هەموو بابەتەکان ببینە','Explore all topics'],
 homeSafety:['السلامة في المنزل',"سەلامەتی د مالێ دا",'سەلامەتی لە ماڵدا','Safety at home'],
 homeDesc:['الوقاية من الحرائق في المنازل والمباني',"پێشگیری ژ ئاگرێ\nمال و جهێن نیشتەجێبوونێ",'چۆنیەتی پێشگیری لە ئاگر\nلە ماڵ و شوێنەکانی نیشتەجێبوون','Fire prevention for your home and living spaces'],
 extinguisher:['استخدام\nطفاية الحريق',"بکارئینانا ئامیرێ\nئاگرڤەمراندنێ",'بەکارهێنانی ئامێری\nئاگرکوژێنەوە','Using a fire\nextinguisher'],
 extinguisherDesc:['إرشادات عامة للوعي والسلامة',"ڕێنماییێن بکارئینانێ\nبو هەمیان",'ڕێنمایی بەکارهێنان\nبۆ هەمووان','Awareness and guidance for everyone'],
 education:['التدريب والتوعية',"فێرکرن و هشیاری",'پەروەردە و هۆشیاری','Education and awareness'],
 educationDesc:['برامج التوعية للمدارس والمجتمع',"بلندکرنا هشیاریێ\nد ناڤ قوتابیان و جڤاکی دا",'بەرزکردنەوەی ئاستی هۆشیاری\nلە نێو قوتابیان و کۆمەڵگا','Building awareness in schools and our community'],
 weather:['الاستعداد\nللكوارث الطبيعية',"ئامادەکاری بو\nکارەساتێن سروشتی",'ئامادەبوون بۆ\nکارەساتە سروشتییەکان','Preparing for\nnatural hazards'],
 weatherDesc:['إرشادات وخطط الاستعداد',"ڕێنمایی و پلانێن\nئامادەکاریێ",'ڕێنماییەکان و پلانی\nئامادەبوون','Guidance and preparedness planning'],
 home:['الرئيسية','سەرەکی','سەرەکی','Home'],
 about:['عن المديرية',"دەربارەی ڕێڤەبەریێ",'دەربارەی بەڕێوەبەرایەتی','About us'],
 services:['الخدمات',"خزمەتگوزاری",'خزمەتگوزارییەکان','Services'],
 safety:['الوقاية والتوعية',"هشیاری و پاراستن",'هۆشیاری و پاراستن','Safety and awareness'],
 sources:['المعلومات والإعلام',"زانیاری و ڕاگەهاندن",'زانیاری و ڕاگەیاندن','Information and media'],
 contact:['اتصل بنا',"پەیوەندی ب مە بکە",'پەیوەندی کردن','Contact'],
 photo:['مشاهد توضيحية للتوعية والإنقاذ وحماية البيئة',"وێنەیێن ڕوونکرنێ یێن هشیاری، ڕزگارکرن و پاراستنا ژینگەهێ",'وێنەی ڕوونکردنەوەی هۆشیاری و ڕزگارکردن و پاراستنی ژینگە','Illustrative scenes of community awareness, rescue and environmental protection']
 };
 const shapes={
 leaf:'<path d="M20 3C10 3 3 7 4 14c1 8 13 8 16-11Z"/><path d="M3 22c2-8 7-12 13-15M8 16v-5"/>',
 hat:'<path d="M5 15V11a7 7 0 0 1 14 0v4M10 3v10m4-10v10M3 16c5 4 13 4 18 0v4c-6 3-12 3-18 0Z"/>',
 shield:'<path d="m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6Z"/>',
 people:'<circle cx="9" cy="6" r="3"/><circle cx="17" cy="7" r="2.5"/><path d="M2 22v-5a7 7 0 0 1 14 0v5m1-10a6 6 0 0 1 5 6v4M6 22v-6m6 6v-6"/>',
 tree:'<path d="m12 1-7 8h4l-6 7h6l-6 6h18l-6-6h6l-6-7h4Z"/><path d="M12 20v4"/>',
 house:'<path d="m2 11 10-9 10 9M5 9v13h5v-8h4v8h5V9"/>',
 extinguisher:'<path d="M8 9h8v13H7V10Zm2-4h4v4m-2-4V2m-3 0h8M14 5c5 0 6 3 6 8v4M7 8C2 8 3 14 3 18"/>',
 rain:'<path d="M6 14a5 5 0 0 1 0-10 6 6 0 0 1 11 1 4 4 0 0 1 1 9ZM6 18l-1 2m7-2-1 2m7-2-1 2M3 23h18"/>',
 phone:'<path d="m7 3 3 5-3 3c2 3 3 4 6 6l3-3 5 3c0 4-3 5-5 4C9 19 5 15 3 8 2 6 3 3 7 3Z"/>'
 };
 const icon=name=>`<svg class="icon" aria-hidden="true" viewBox="0 0 24 24">${shapes[name]}</svg>`;
 const n=()=>({ar:0,badini:1,sorani:2,en:3}[document.documentElement.dataset.locale]??0);
 const t=key=>words[key][n()];
 const escape=value=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const lines=key=>escape(t(key)).replaceAll('\n','<br>');
 const route=path=>{const u=new URL(path,location.href);u.searchParams.set('lang',document.documentElement.dataset.locale);return u.pathname.split('/').pop()+u.search+u.hash};
 const strip=document.querySelector('.service-strip');
 const section=document.createElement('section');section.className='reference-features';strip.after(section);
 const call=document.createElement('a');call.className='hero-emergency';call.href='tel:115';document.querySelector('.hero-copy').append(call);
 document.querySelector('.brand img').src='assets/community-reference/logo.webp';
 document.querySelector('.hero-gallery').removeAttribute('aria-hidden');
 function renderCommunity(){
  document.querySelectorAll('[data-text="brand"]').forEach(el=>el.textContent=t('brand'));
  document.querySelector('[data-text="duhok"]').textContent=t('duhok');
  document.querySelector('.brand img').alt=t('brand')+' — '+t('duhok');
  document.title=t('brand')+' — '+t('duhok');
  const kicker=document.querySelector('.hero-copy .kicker');kicker.removeAttribute('aria-hidden');kicker.textContent=t('kicker');
  const h1=document.querySelector('.hero-copy h1');h1.removeAttribute('aria-label');h1.innerHTML=`<span>${escape(t('title'))} <em>${escape(t('life'))}</em></span><span>${escape(t('titleEnd'))}</span>`;
  document.querySelector('.hero-copy h2').innerHTML=lines('intro');
  call.innerHTML=`${icon('phone')}<b dir="ltr">115</b><i aria-hidden="true"></i><span>${escape(t('emergency'))}</span>`;
  document.querySelector('.field-photo').setAttribute('aria-label',t('photo'));
  [['.gallery-community','people','rescue','rescueDesc','topic-road-rescue.html'],['.gallery-training','tree','nature','natureDesc','topic-wildfire.html']].forEach(([selector,image,title,desc,href])=>{
   const el=document.querySelector(selector);el.innerHTML=`<a href="${route(href)}" class="gallery-link">${icon(image)}<span class="gallery-caption"><strong>${escape(t(title))}</strong><small>${escape(t(desc))}</small></span></a>`;
  });
  strip.setAttribute('aria-label',t('services'));
  strip.innerHTML=[['leaf','environment','environmentSub','topic-wildfire.html'],['hat','response','responseSub','knowledge.html'],['shield','prevention','preventionSub','safety-guide.html'],['people','community','communitySub','portal.html#contact']].map(([image,title,desc,href])=>`<a href="${route(href)}"><span class="quick-icon">${icon(image)}</span><span><strong>${lines(title)}</strong><small>${escape(t(desc))}</small></span></a>`).join('');
  section.innerHTML=`<div class="community-section-head"><a href="${route('knowledge.html')}"><span aria-hidden="true">←</span><span>${escape(t('all'))}</span></a><h2>${escape(t('heading'))}</h2></div><div class="community-feature-grid">${[['house','homeSafety','homeDesc','home','topic-home-fires.html'],['extinguisher','extinguisher','extinguisherDesc','extinguisher','equipment.html'],['people','education','educationDesc','education','training.html'],['rain','weather','weatherDesc','flood','topic-floods.html']].map(([image,title,desc,asset,href])=>`<a class="feature-card" href="${route(href)}" style="--feature-image:url('assets/community-reference/${asset}.webp')"><div class="feature-copy"><h2>${lines(title)}</h2><p>${lines(desc)}</p></div><span class="feature-badge">${icon(image)}</span></a>`).join('')}</div>`;
  const nav=document.querySelector('.sections-primary');
  nav.querySelector('.active>span').textContent=t('home');
  for(const key of ['about','services','safety','sources','contact'])nav.querySelector(`[data-section="${key}"]`).textContent=t(key);
 }
 new MutationObserver(renderCommunity).observe(document.documentElement,{attributes:true,attributeFilter:['data-locale']});
 renderCommunity();
})();
