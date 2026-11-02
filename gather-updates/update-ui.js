(function(){
const APP_VERSION="0.5.0";
const KEY="gather-update-feed";
function settingUp(){
  const p=document.getElementById("settings");if(!p||document.getElementById("gather-update-card"))return;
  const card=document.createElement("div");card.id="gather-update-card";card.className="workbox";
  card.innerHTML='<h3>App updates</h3><p class="muted">Current interface: <b id="gather-version">'+APP_VERSION+'</b>. Check for a newer verified Gather build and reload without leaving the app.</p><label>Update feed URL<input class="field" id="gather-feed" type="url" placeholder="https://your-host/manifest.json" /></label><button class="btn" id="gather-check" style="width:100%;margin-top:10px">Check for Updates</button><p id="gather-update-status" class="muted" role="status" aria-live="polite" style="margin-top:10px">Native app required for automatic updates. Only trust update feeds you control.</p><p class="muted" style="font-size:11px">Interface and recipe changes can reload automatically. Changes to native iOS code still require installing a new IPA via LiveContainer.</p>';
  p.insertBefore(card,p.firstChild);
  const feed=card.querySelector("#gather-feed");
  feed.value=localStorage.getItem(KEY)||"https://raw.githubusercontent.com/davidstapleton2308/earned-home-mapper/main/gather-updates/manifest.json";
  feed.addEventListener("change",()=>localStorage.setItem(KEY,feed.value.trim()));
  card.querySelector("#gather-check").addEventListener("click",function(){
    const url=feed.value.trim();localStorage.setItem(KEY,url);
    if(!url){status("Add a trusted HTTPS update feed URL first.");return}
    if(!/^https:\/\//i.test(url)){status("Use an HTTPS update feed.");return}
    if(!window.webkit?.messageHandlers?.gatherUpdater){status("Update checks require the installed iPhone app.");return}
    this.disabled=true;this.textContent="Checking…";status("Checking for a new version…");
    window.webkit.messageHandlers.gatherUpdater.postMessage({action:"check",feedUrl:url,version:APP_VERSION});
  });
}
function status(s){let el=document.getElementById("gather-update-status");if(el)el.textContent=s}
window.gatherUpdateResult=function(result){
 const b=document.getElementById("gather-check");if(b){b.disabled=false;b.textContent="Check for Updates"}
 status(result?.message||"Unable to check for updates.");
 if(result?.state==="updated")status("Update installed. Relaunching Gather…");
};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",settingUp);else settingUp();
})();