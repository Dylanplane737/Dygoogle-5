// ===== Global State =====
let highlightedIndex = -1;
let debounceTimer;
let commonsOffset = 0;
let currentQuery = "";
let imagesList = [];
let currentLightIndex = -1;
let matrixState = { running: false, intervalId: null };
const NEWS_API_KEY = "e6af6cc935544b4f8b8833922035df15"; // placeholder

// ===== Elements =====
const urlInput = document.getElementById("urlInput");
const suggestionBox = document.getElementById("suggestionBox");
const spinner = document.getElementById("loadingSpinner");
const resultContainer = document.getElementById("resultContainer");
const imagesSection = document.getElementById("imagesSection");
const videosSection = document.getElementById("videosSection");
const wikiSummaryEl = document.getElementById("wikiSummary");
const dictionaryContainer = document.getElementById("dictionaryContainer");
const dictionaryResults = document.getElementById("dictionaryResults");
const newsContainer = document.getElementById("newsContainer");
const newsResults = document.getElementById("newsResults");
const timelineContainer = document.getElementById("timelineContainer");
const timelineList = document.getElementById("timelineList");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const closeLightbox = document.getElementById("closeLightbox");
const lightPrev = document.getElementById("lightPrev");
const lightNext = document.getElementById("lightNext");
const matrixCanvas = document.getElementById("matrixCanvas");

// ===== Helpers =====
function showSpinner(){ spinner.classList.add("visible"); }
function hideSpinner(){ spinner.classList.remove("visible"); }
function formatURL(input){ input=input.trim(); if(input.startsWith("http")) return input; if(input.includes(".")) return "https://"+input; return input; }
function safeText(s){ return (s||"").toString(); }
function escapeHtml(text){ if(!text)return""; return text.replace(/[&<>'"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'})[c]); }

// ===== Autocomplete =====
urlInput.addEventListener("input", e=>{
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(()=> showSuggestions(e.target.value.trim()), 240);
});
async function fetchWikiSuggestions(q){
  if(!q)return[];
  const cacheKey=`wiki_suggest_${q}`;
  const cached=sessionStorage.getItem(cacheKey);
  if(cached)return JSON.parse(cached);
  try{
    const res=await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&format=json&origin=*&search=${encodeURIComponent(q)}`);
    const j=await res.json();
    sessionStorage.setItem(cacheKey, JSON.stringify(j[1]||[]));
    return j[1]||[];
  }catch{return[];}
}
async function showSuggestions(input){
  suggestionBox.innerHTML=""; highlightedIndex=-1;
  if(!input){ suggestionBox.classList.remove("show"); return; }
  const list=await fetchWikiSuggestions(input);
  if(!list.length){ suggestionBox.classList.remove("show"); return; }
  list.forEach(item=>{
    const d=document.createElement("div");
    d.textContent=item;
    d.onclick=()=>{ urlInput.value=item; suggestionBox.classList.remove("show"); };
    suggestionBox.appendChild(d);
  });
  suggestionBox.classList.add("show");
}

// ===== Wikipedia Summary =====
async function getWikiSummary(query){
  try{
    const res=await fetch(`https://en.wikipedia.org/w/api.php?action=query&origin=*&prop=extracts|pageimages&exintro&explaintext&piprop=thumbnail&pithumbsize=400&format=json&titles=${encodeURIComponent(query)}`);
    const data=await res.json();
    const pages=data.query.pages; const page=Object.values(pages)[0];
    if(!page||page.missing)return null;
    return { title: page.title, extract: page.extract||"", thumbnail: page.thumbnail? page.thumbnail.source:null, fullurl:`https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}` };
  }catch{return null;}
}

// ===== Wikimedia Commons =====
async function getCommonsMedia(query, offset=0){
  try{
    const res=await fetch(`https://commons.wikimedia.org/w/api.php?action=query&origin=*&format=json&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=20&gsroffset=${offset}&gsrnamespace=6&prop=imageinfo&iiprop=url|mime|thumbmime&iiurlwidth=400`);
    const data=await res.json();
    if(!data.query||!data.query.pages)return{images:[],videos:[]};
    const pages=Object.values(data.query.pages);
    const images=[], videos=[];
    for(const p of pages){
      const info=p.imageinfo && p.imageinfo[0]?p.imageinfo[0]:null;
      if(!info)continue;
      if(info.mime.startsWith("image/")) images.push(info.thumburl||info.url);
      else if(info.mime.startsWith("video/")) videos.push(info.url);
    }
    return{images,videos};
  }catch{return{images:[],videos:[]};}
}

// ===== Lightbox =====
function openLightbox(index){ if(index<0||index>=imagesList.length)return; currentLightIndex=index; lightboxImg.src=imagesList[index]; lightbox.classList.add("show"); }
function closeLightboxFn(){ lightbox.classList.remove("show"); currentLightIndex=-1; }
function lightNextFn(){ if(!imagesList.length)return; currentLightIndex=(currentLightIndex+1)%imagesList.length; lightboxImg.src=imagesList[currentLightIndex]; }
function lightPrevFn(){ if(!imagesList.length)return; currentLightIndex=(currentLightIndex-1+imagesList.length)%imagesList.length; lightboxImg.src=imagesList[currentLightIndex]; }
closeLightbox.onclick=closeLightboxFn; lightNext.onclick=lightNextFn; lightPrev.onclick=lightPrevFn;

// ===== Main Search =====
document.getElementById("openBtn").onclick=openWebsite;
async function openWebsite(){
  const input=urlInput.value.trim();
  resultContainer.classList.remove("visible"); imagesSection.innerHTML=""; videosSection.innerHTML=""; imagesList=[]; currentLightIndex=-1;
  if(!input){ alert("Enter something!"); return; }
  showSpinner();
  try{
    const summary=await getWikiSummary(input);
    if(!summary){ alert("No Wikipedia found"); return; }
    wikiSummaryEl.innerHTML=`<h2>${escapeHtml(summary.title)}</h2>${summary.thumbnail?`<img src="${summary.thumbnail}">`:""}<p>${escapeHtml(summary.extract)}</p><p><a href="${summary.fullurl}" target="_blank">Read more on Wikipedia</a></p>`;
    // Images
    const media=await getCommonsMedia(input,0);
    for(const src of media.images){ const img=document.createElement("img"); img.src=src; img.onclick=()=>{ const idx=imagesList.indexOf(src); openLightbox(idx>=0?idx:(imagesList.push(src)-1)); }; imagesSection.appendChild(img); imagesList.push(src); }
    videosSection.innerHTML=media.videos.length? media.videos.map(v=>`<video src="${v}" controls></video>`).join("") : "<p>No videos found</p>";
    resultContainer.classList.add("visible");
  }catch(err){ console.error(err); alert("Search error"); }finally{ hideSpinner(); }
}

// ===== Suggestions Keyboard =====
urlInput.addEventListener("keydown", e=>{
  const items=suggestionBox.querySelectorAll("div");
  if(!items.length) return;
  if(e.key==="ArrowDown"){ highlightedIndex=(highlightedIndex+1)%items.length; highlightItem(items); e.preventDefault(); }
  else if(e.key==="ArrowUp"){ highlightedIndex=(highlightedIndex-1+items.length)%items.length; highlightItem(items); e.preventDefault(); }
  else if(e.key==="Enter"){ if(highlightedIndex>=0) urlInput.value=items[highlightedIndex].textContent; suggestionBox.classList.remove("show"); openWebsite(); }
});
function highlightItem(items){ items.forEach((i,j)=>i.classList.toggle("highlighted",j===highlightedIndex)); }

// ===== Matrix effect =====
function startMatrix(){ if(matrixState.running) return; matrixState.running=true; matrixCanvas.style.display="block"; const ctx=matrixCanvas.getContext("2d"); let width=matrixCanvas.width=window.innerWidth; let height=matrixCanvas.height=window.innerHeight; const cols=Math.floor(width/20)+1; const ypos=Array(cols).fill(0); matrixState.intervalId=setInterval(()=>{
  ctx.fillStyle="rgba(0,0,0,0.05)"; ctx.fillRect(0,0,width,height); ctx.fillStyle="#0F0"; ctx.font="20px monospace";
  ypos.forEach((y,idx)=>{ const text=String.fromCharCode(33+Math.random()*94); ctx.fillText(text, idx*20, y); ypos[idx]+=20; if(y>height) ypos[idx]=0; });},45);}
function stopMatrix(){ if(!matrixState.running) return; clearInterval(matrixState.intervalId); matrixState.running=false; matrixCanvas.style.display="none"; }
