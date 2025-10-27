// ===== Global State =====
let highlightedIndex = -1;
let debounceTimer;
let imagesList = [];
let currentLightIndex = -1;
let matrixState = { running: false, intervalId: null };
let currentQuery = "";

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
const timelineContainer = document.getElementById("timelineContainer");
const timelineList = document.getElementById("timelineList");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const closeLightbox = document.getElementById("closeLightbox");
const lightPrev = document.getElementById("lightPrev");
const lightNext = document.getElementById("lightNext");

// ===== Helpers =====
function showSpinner(){ spinner.classList.add("visible"); }
function hideSpinner(){ spinner.classList.remove("visible"); }
function escapeHtml(text){ if(!text) return ""; return text.replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'})[c]); }

// ===== Autocomplete =====
urlInput.addEventListener("input", e=>{
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(()=> showSuggestions(e.target.value.trim()), 240);
});

async function fetchWikiSuggestions(q){
  if(!q) return [];
  const cacheKey=`wiki_suggest_${q}`;
  const cached=sessionStorage.getItem(cacheKey);
  if(cached) return JSON.parse(cached);
  try{
    const res=await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&format=json&origin=*&search=${encodeURIComponent(q)}`);
    const j=await res.json();
    sessionStorage.setItem(cacheKey, JSON.stringify(j[1]||[]));
    return j[1]||[];
  }catch{return [];}
}

async function showSuggestions(input){
  suggestionBox.innerHTML=""; highlightedIndex=-1;
  if(!input){ suggestionBox.classList.remove("show"); return; }
  const list=await fetchWikiSuggestions(input);
  if(!list.length){ suggestionBox.classList.remove("show"); return; }
  list.forEach(item=>{
    const d=document.createElement("div");
    d.textContent=item;
    d.onclick=()=>{ urlInput.value=item; suggestionBox.classList.remove("show"); openWebsite(); };
    suggestionBox.appendChild(d);
  });
  suggestionBox.classList.add("show");
}

// ===== Wikipedia Summary =====
async function getWikiSummary(query){
  try{
    const res=await fetch(`https://en.wikipedia.org/w/api.php?action=query&origin=*&prop=extracts|pageimages&exintro&explaintext&piprop=thumbnail&pithumbsize=400&format=json&titles=${encodeURIComponent(query)}`);
    const data=await res.json();
    const pages=data.query.pages; 
    const page=Object.values(pages)[0];
    if(!page || page.missing) return null;
    return { title: page.title, extract: page.extract||"", thumbnail: page.thumbnail? page.thumbnail.source:null, fullurl:`https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}` };
  }catch{return null;}
}

// ===== Wikimedia Commons Media =====
async function getCommonsMedia(query){
  try{
    const res=await fetch(`https://commons.wikimedia.org/w/api.php?action=query&origin=*&format=json&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=20&gsrnamespace=6&prop=imageinfo&iiprop=url|mime|thumbmime&iiurlwidth=400`);
    const data=await res.json();
    if(!data.query || !data.query.pages) return { images: [], videos: [] };
    const pages = Object.values(data.query.pages);
    const images = [], videos = [];
    for(const p of pages){
      const info=p.imageinfo && p.imageinfo[0]? p.imageinfo[0]: null;
      if(!info) continue;
      if(info.mime.startsWith("image/")) images.push(info.thumburl||info.url);
      else if(info.mime.startsWith("video/")) videos.push(info.url);
    }
    return { images, videos };
  }catch{return { images: [], videos: [] }; }
}

// ===== Dictionary =====
async function getDictionary(query){
  if(!query) return [];
  try{
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(query)}`);
    if(!res.ok) return [];
    const data = await res.json();
    return data;
  }catch{return [];}
}

function renderDictionary(data){
  if(!data.length){ dictionaryResults.innerHTML="<p>No dictionary results found.</p>"; return; }
  dictionaryResults.innerHTML = data.map(entry=>{
    const meanings = entry.meanings.map(m=>{
      return `<h4>${escapeHtml(m.partOfSpeech)}</h4>`+
             m.definitions.map(d=>`<p>${escapeHtml(d.definition)}</p>`).join("")+
             (m.definitions[0] && m.definitions[0].audio ? `<audio controls src="${m.definitions[0].audio}"></audio>`:"");
    }).join("");
    return `<h3>${escapeHtml(entry.word)}</h3>${meanings}`;
  }).join("");
}

// ===== Timeline (Years) =====
async function getTimeline(query){
  if(!query) return [];
  try{
    const res=await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
    const data = await res.json();
    if(!data.extract) return [];
    const sentences = data.extract.split(". ").filter(s=>/\b\d{3,4}\b/.test(s));
    return sentences.slice(0,6);
  }catch{return [];}
}

function renderTimeline(sentences){
  if(!sentences.length){ timelineList.innerHTML="<p>No timeline events found.</p>"; return; }
  timelineList.innerHTML = sentences.map(s=>`<p>• ${escapeHtml(s)}</p>`).join("");
}

// ===== Lightbox =====
function openLightbox(index){ if(index<0||index>=imagesList.length) return; currentLightIndex=index; lightboxImg.src=imagesList[index]; lightbox.classList.add("show"); }
function closeLightboxFn(){ lightbox.classList.remove("show"); currentLightIndex=-1; }
function lightNextFn(){ if(!imagesList.length) return; currentLightIndex=(currentLightIndex+1)%imagesList.length; lightboxImg.src=imagesList[currentLightIndex]; }
function lightPrevFn(){ if(!imagesList.length) return; currentLightIndex=(currentLightIndex-1+imagesList.length)%imagesList.length; lightboxImg.src=imagesList[currentLightIndex]; }
closeLightbox.onclick=closeLightboxFn; lightNext.onclick=lightNextFn; lightPrev.onclick=lightPrevFn;

// ===== Main Search =====
document.getElementById("openBtn").onclick=openWebsite;

async function openWebsite(){
  const input=urlInput.value.trim();
  if(!input){ alert("Enter something!"); return; }
  resultContainer.classList.remove("visible"); imagesSection.innerHTML=""; videosSection.innerHTML=""; imagesList=[]; currentLightIndex=-1;
  dictionaryResults.innerHTML=""; timelineList.innerHTML="";
  dictionaryContainer.style.display="none"; timelineContainer.style.display="none";
  showSpinner();
  try{
    currentQuery=input;

    // Wikipedia Summary
    const summary=await getWikiSummary(input);
    if(!summary){ alert("No Wikipedia found"); return; }
    wikiSummaryEl.innerHTML=`<h2>${escapeHtml(summary.title)}</h2>`+
                            `${summary.thumbnail?`<img src="${summary.thumbnail}">`:""}`+
                            `<p>${escapeHtml(summary.extract)}</p>`+
                            `<p><a href="${summary.fullurl}" target="_blank">Read more on Wikipedia</a></p>`;

    // Commons Media
    const media=await getCommonsMedia(input);
    for(const src of media.images){
      const img=document.createElement("img");
      img.src=src;
      img.onclick=()=>{ const idx=imagesList.indexOf(src); openLightbox(idx>=0?idx:(imagesList.push(src)-1)); };
      imagesSection.appendChild(img);
      imagesList.push(src);
    }
    videosSection.innerHTML = media.videos.length? media.videos.map(v=>`<video src="${v}" controls></video>`).join("") : "<p>No videos found</p>";

    // Dictionary
    const dictData=await getDictionary(input);
    if(dictData.length){ dictionaryContainer.style.display="block"; renderDictionary(dictData); }

    // Timeline
    const timelineEvents=await getTimeline(input);
    if(timelineEvents.length){ timelineContainer.style.display="block"; renderTimeline(timelineEvents); }

    resultContainer.classList.add("visible");
  }catch(err){ console.error(err); alert("Search error"); }finally{ hideSpinner(); }
}

// ===== Keyboard for suggestions =====
urlInput.addEventListener("keydown", e=>{
  const items=suggestionBox.querySelectorAll("div");
  if(!items.length) return;
  if(e.key==="ArrowDown"){ highlightedIndex=(highlightedIndex+1)%items.length; highlightItem(items); e.preventDefault(); }
  else if(e.key==="ArrowUp"){ highlightedIndex=(highlightedIndex-1+items.length)%items.length; highlightItem(items); e.preventDefault(); }
  else if(e.key==="Enter"){ if(highlightedIndex>=0) urlInput.value=items[highlightedIndex].textContent; suggestionBox.classList.remove("show"); openWebsite(); }
});
function highlightItem(items){ items.forEach((i,j)=>i.classList.toggle("highlighted",j===highlightedIndex)); }

