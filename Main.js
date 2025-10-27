const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const resultContainer = document.getElementById("resultContainer");
const wikiSummaryEl = document.getElementById("wikiSummary");
const dictionaryEl = document.getElementById("dictionary");
const timelineEl = document.getElementById("timeline");
const imagesSection = document.getElementById("imagesSection");
const videosSection = document.getElementById("videosSection");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const closeLightbox = document.getElementById("closeLightbox");
const lightPrev = document.getElementById("lightPrev");
const lightNext = document.getElementById("lightNext");

let imagesList = [];
let currentLightIndex = -1;

// ===== Lightbox functions =====
function openLightbox(index) {
  currentLightIndex = index;
  lightboxImg.src = imagesList[index];
  lightbox.classList.add("show");
}
function closeLightboxFn() { lightbox.classList.remove("show"); currentLightIndex=-1; }
function lightNextFn() { currentLightIndex=(currentLightIndex+1)%imagesList.length; lightboxImg.src=imagesList[currentLightIndex]; }
function lightPrevFn() { currentLightIndex=(currentLightIndex-1+imagesList.length)%imagesList.length; lightboxImg.src=imagesList[currentLightIndex]; }

closeLightbox.onclick = closeLightboxFn;
lightNext.onclick = lightNextFn;
lightPrev.onclick = lightPrevFn;

document.addEventListener("keydown", e => {
  if(lightbox.classList.contains("show")) {
    if(e.key==="Escape") closeLightboxFn();
    if(e.key==="ArrowRight") lightNextFn();
    if(e.key==="ArrowLeft") lightPrevFn();
  }
});

// ===== Fetch Wikipedia summary =====
async function fetchWiki(query){
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&prop=extracts|pageimages&exintro&explaintext&piprop=thumbnail&pithumbsize=400&titles=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const data = await res.json();
    const page = Object.values(data.query.pages)[0];
    if(!page || page.missing) return null;
    return page;
  } catch { return null; }
}

// ===== Placeholder fetch for dictionary & timeline =====
async function fetchDictionary(query){ return [`Definition of ${query}`]; }
async function fetchTimeline(query){ return [`Timeline event 1 for ${query}`, `Timeline event 2 for ${query}`]; }

// ===== Images & Videos (Wikimedia API) =====
async function fetchCommonsMedia(query){
  // lightweight, just fetch a few at a time for infinite scroll
  try {
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&origin=*&format=json&list=allimages&aiprop=url&ailimit=10&aisort=timestamp&aititle=${encodeURIComponent(query)}`;
    const res = await fetch(searchUrl);
    const data = await res.json();
    const urls = data.query.allimages.map(img=>img.url).slice(0,10);
    return { images: urls, videos: [] };
  } catch { return { images:[], videos:[] }; }
}

// ===== Main search function =====
async function searchNova(){
  const query = searchInput.value.trim();
  if(!query) return alert("Type something!");
  
  // Reset previous results
  wikiSummaryEl.innerHTML = "";
  dictionaryEl.innerHTML = "";
  timelineEl.innerHTML = "";
  imagesSection.innerHTML = "";
  videosSection.innerHTML = "";
  imagesList = [];

  // Wikipedia summary
  const wiki = await fetchWiki(query);
  if(wiki) wikiSummaryEl.innerHTML = `<h2>${wiki.title}</h2>${wiki.thumbnail ? `<img src="${wiki.thumbnail.source}" style="width:200px;">` : ""}<p>${wiki.extract}</p><p><a href="https://en.wikipedia.org/wiki/${encodeURIComponent(wiki.title)}" target="_blank" style="color:#a8d0e6">Read more</a></p>`;

  // Dictionary
  const dict = await fetchDictionary(query);
  dictionaryEl.innerHTML = `<h3>Dictionary</h3><ul>${dict.map(d=>`<li>${d}</li>`).join('')}</ul>`;

  // Timeline
  const timeline = await fetchTimeline(query);
  timelineEl.innerHTML = `<h3>Timeline</h3><ul>${timeline.map(t=>`<li>${t}</li>`).join('')}</ul>`;

  // Images & Videos
  const { images, videos } = await fetchCommonsMedia(query);
  images.forEach(src=>{
    const img = document.createElement("img");
    img.src = src; img.loading="lazy";
    img.onclick = ()=>openLightbox(imagesList.indexOf(src));
    imagesSection.appendChild(img);
    imagesList.push(src);
  });
  videos.forEach(v=>{
    const vid = document.createElement("video");
    vid.src=v; vid.controls=true;
    const fullscreenBtn = document.createElement("button");
    fullscreenBtn.textContent="Full Screen";
    fullscreenBtn.onclick=()=>vid.requestFullscreen();
    const container = document.createElement("div");
    container.appendChild(vid); container.append
