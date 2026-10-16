/* Local opt-in lab evidence only. Not analytics and not a field-INP claim. */
(() => {
if(new URLSearchParams(location.search).get('qa')!=='1')return;
const data={context:'local lab run; not field data',viewport:{width:innerWidth,height:innerHeight},lcpMs:null,cls:0,interactionMaxMs:null,inp:'not assessed',navigationMs:null};
const output=document.createElement('output');output.id='qa-metrics';output.hidden=true;document.body.append(output);
const update=()=>output.textContent=JSON.stringify(data);
let start=0,last=0,score=0;
if('PerformanceObserver' in window){
 try{new PerformanceObserver(list=>{for(const e of list.getEntries())data.lcpMs=Math.round(e.startTime);update();}).observe({type:'largest-contentful-paint',buffered:true});}catch{}
 try{new PerformanceObserver(list=>{for(const e of list.getEntries()){if(e.hadRecentInput)continue;if(e.startTime-last>1000||e.startTime-start>5000){start=e.startTime;score=0;}score+=e.value;last=e.startTime;data.cls=Math.max(data.cls,score);}update();}).observe({type:'layout-shift',buffered:true});}catch{}
 try{new PerformanceObserver(list=>{for(const e of list.getEntries())if(e.interactionId)data.interactionMaxMs=Math.max(data.interactionMaxMs||0,e.duration);update();}).observe({type:'event',buffered:true,durationThreshold:16});}catch{}
}
window.addEventListener('load',()=>{data.navigationMs=Math.round(performance.now());update();});update();
})();
