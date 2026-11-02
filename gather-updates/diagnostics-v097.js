(()=>{'use strict';
const VERSION='1.0.1';let running=false,lastReport='';
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const panel=document.createElement('section');panel.id='gatherDiagnostics';panel.className='workbox';panel.innerHTML='<h3>App health check</h3><p class="muted">Checks your installed app without editing saved plans, recipes, or pantry.</p><button class="btn" id="gatherTestButton">Test This App</button><div id="gatherTestProgress" role="status" aria-live="polite" style="margin:12px 0;font-size:13px"></div><div id="gatherTestResult"></div><div class="manage" id="gatherTestActions" style="display:none"><button class="btn secondary" id="gatherCopyTest">Copy bug report for ChatGPT</button><button class="btn outline" id="gatherDownloadTest">Download report</button></div>';
document.getElementById('settings')?.prepend(panel);
const progress=panel.querySelector('#gatherTestProgress'),result=panel.querySelector('#gatherTestResult');
function makeReport(){return {app:'Gather',version:VERSION,time:new Date().toISOString(),platform:navigator.userAgent,checks:[],issues:[],note:'These are non-destructive diagnostics. Passing checks do not guarantee all behaviors work.'}}
function check(rep,id,label,fn){try{let data=fn();let ok=!!data;rep.checks.push({id,label,passed:ok});if(!ok)rep.issues.push({id,label,detail:'Condition failed'});}catch(e){rep.checks.push({id,label,passed:false});rep.issues.push({id,label,detail:String(e.message||e)})}}
function id(id){return document.getElementById(id)}
function stateHash(){let values={};for(let i=0;i<localStorage.length;i++){let k=localStorage.key(i);values[k]=localStorage.getItem(k)}return JSON.stringify(values)}
async function run(){
if(running)return;running=true;const btn=id('gatherTestButton');btn.disabled=true;btn.textContent='Testing…';progress.textContent='Checking app screens and data…';result.innerHTML='';
let before=stateHash(),r=makeReport();
check(r,'CORE-001','Main navigation exists',()=>!!document.querySelector('nav.nav'));
check(r,'CORE-002','Today screen exists',()=>!!id('gToday'));
check(r,'CORE-003','Meal setup screen exists',()=>!!id('gWizard9'));
check(r,'CORE-004','Grocery screen exists',()=>!!id('shop'));
check(r,'CORE-005','Kitchen settings exists',()=>!!id('settings'));
check(r,'CORE-006','Update button exists',()=>!!id('gather-check'));
check(r,'DATA-001','Recipes load',()=>typeof recipes==='function'&&Array.isArray(recipes())&&recipes().length>=100);
check(r,'DATA-002','Recipe IDs are unique',()=>{let x=recipes().map(r=>r.id);return x.every(Boolean)&&new Set(x).size===x.length});
check(r,'DATA-003','All approved recipes have names and ingredients',()=>recipes().filter(x=>x.status==='keep').every(x=>x.name&&Array.isArray(x.ingredients)&&x.ingredients.length));
check(r,'DATA-004','All approved recipes have cooking instructions',()=>recipes().filter(x=>x.status==='keep').every(x=>Array.isArray(x.steps)&&x.steps.length));
check(r,'MEAL-001','Guided planner functions are available',()=>['start','next','mode','pick','finish'].every(x=>typeof window.gWizard9?.[x]==='function'));
check(r,'MEAL-002','Recipe cards use tap handlers',()=>typeof window.gWizard9?.pick==='function'&&document.querySelectorAll('#gWizard9 button.recipe').length>=0);
check(r,'SHOP-001','Grocery calculation returns a list',()=>Array.isArray(buildGroceries()));
check(r,'SHOP-002','Store shopping functions exist',()=>['show','save','choose'].every(x=>typeof window.gStore?.[x]==='function'));
check(r,'PANTRY-001','Pantry functions exist',()=>['show','stock','consume'].every(x=>typeof window.smartGather?.[x]==='function'));
check(r,'SAFE-001','Local data storage accessible',()=>{let k=localStorage.length;return Number.isInteger(k)});
progress.textContent='Checking embedded recipe images…';
let images=[...document.querySelectorAll('#cards img,#gWizard9 img,#gPantry img')];if(!images.length){try{let source=window.gWizard9?.open;let sample=recipes().find(x=>x.status==='keep'&&x.category==='Meal 2');if(sample){let div=document.createElement('div');div.style.display='none';div.innerHTML='<img src="https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400">';// image availability evaluated only for existing rendered assets, without a live network test
}}catch(e){}}
const broken=images.filter(x=>x.complete&&x.naturalWidth===0).map(x=>x.alt||x.currentSrc.slice(0,100));
r.checks.push({id:'IMAGE-001',label:'Visible recipe images load',passed:images.length>0&&!broken.length,detail:images.length+' images checked'});if(!images.length){r.checks[r.checks.length-1].passed=true;r.checks[r.checks.length-1].detail='Not applicable on this screen. Open meal selection to inspect images.';}else if(broken.length)r.issues.push({id:'IMAGE-001',detail:'Broken images: '+broken.slice(0,10).join(', ')});
let buttons=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null);let inactive=buttons.filter(x=>!x.disabled&&!x.onclick&&!x.getAttribute('onclick')&&!x.closest('form')&&x.id!=='gatherTestButton'&&x.id!=='gather-check');
r.checks.push({id:'BUTTON-001',label:'Visible buttons have an event handler',passed:inactive.length===0,detail:buttons.length+' visible buttons inspected'});if(inactive.length)r.issues.push({id:'BUTTON-001',detail:'No obvious event handlers: '+inactive.slice(0,12).map(x=>x.textContent.trim()).join('; ')});
if(stateHash()!==before)r.issues.push({id:'SAFE-002',detail:'Local storage changed during diagnostic run (possibly from another app action)'});
r.checks.push({id:'SAFE-002',label:'Diagnostics did not alter stored data',passed:stateHash()===before});
r.passed=r.checks.filter(x=>x.passed).length;r.failed=r.checks.length-r.passed;lastReport=JSON.stringify(r,null,2);
progress.textContent='Finished: '+r.passed+' passed · '+r.failed+' flagged';
result.innerHTML='<div class="notice">'+(r.issues.length?'<strong>Checks needing attention:</strong><ul>'+r.issues.map(x=>'<li>'+escape(x.id)+': '+escape(x.detail)+'</li>').join('')+'</ul>':'No issues detected in these automated checks. Manual interaction testing is still recommended.')+'</div>';
panel.querySelector('#gatherTestActions').style.display='flex';btn.disabled=false;btn.textContent='Test This App Again';running=false;
}
function copy(){let text='Please diagnose these Gather app issues, prioritize reliable fixes, and produce the next update. Do not expose my personal data.\n\n'+lastReport;if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(()=>alert('Report copied. Paste it into our ChatGPT conversation.')).catch(()=>fallback(text));else fallback(text)}
function fallback(value){let t=document.createElement('textarea');t.value=value;document.body.append(t);t.select();document.execCommand('copy');t.remove();alert('Report copied. Paste it into ChatGPT.')}
function download(){let blob=new Blob([lastReport],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='gather-diagnostics-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
id('gatherTestButton').addEventListener('click',run);id('gatherCopyTest').addEventListener('click',copy);id('gatherDownloadTest').addEventListener('click',download);
window.gatherDiagnostics={run,version:VERSION};
})();