(() => {
  const labels = [
    ['تصوّر توضيحي', 'صورة توضيحية من مرجع التصميم، وليست توثيقاً لعملية ميدانية.'],
    ['وێنەیەکا ڕوونکرنێ', 'وێنەیا ڕوونکرنێ ژ ژێدەرێ دیزاینی، نە بەڵگەیا کارەکێ مەیدانی یە.'],
    ['وێنەی ڕوونکردنەوە', 'وێنەی ڕوونکردنەوە لە سەرچاوەی دیزاینە، نە بەڵگەی کارێکی مەیدانی.'],
    ['Illustrative visual', 'Illustration from the design reference, not a record of a field operation.']
  ];
  const visual = document.querySelector('#about .about-visual');
  document.querySelector('#about .values>div:last-child use').setAttribute('href','#i-shield');
  const caption = document.createElement('span');
  caption.className = 'reference-photo-note';
  visual.append(caption);
  function render() {
    document.body.classList.toggle('reference-about', location.hash === '#about');
    const index = ['ar','badini','sorani','en'].indexOf(document.documentElement.dataset.locale);
    const wording = labels[index < 0 ? 0 : index];
    caption.textContent = wording[0];
    visual.setAttribute('role','img');
    visual.setAttribute('aria-label',wording[1]);
  }
  addEventListener('hashchange',render);
  new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['data-locale']});
  render();
})();
