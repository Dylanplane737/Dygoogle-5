// ===== main.js =====
document.addEventListener('DOMContentLoaded', () => {

  // ===== Logo Animation =====
  const logoDiv = document.querySelector('.logo');
  const logoText = 'Nova';
  logoDiv.innerHTML = '';
  logoText.split('').forEach(char => {
    const span = document.createElement('span');
    span.textContent = char;
    logoDiv.appendChild(span);
  });

  // ===== Progressive Images =====
  const progressiveImages = document.querySelectorAll('.progressive');
  progressiveImages.forEach(img => {
    const highRes = new Image();
    highRes.src = img.dataset.highres;
    highRes.onload = () => { img.src = highRes.src; };
  });

  // ===== Input Focus Effect =====
  const input = document.getElementById('urlInput');
  input.addEventListener('input', () => {
    input.classList.toggle('typing', input.value.length > 0);
  });

  // ===== Open Button =====
  const openBtn = document.getElementById('openBtn');
  openBtn.addEventListener('click', () => {
    const url = input.value.trim();
    if (url) window.open(url.startsWith('http') ? url : 'https://' + url, '_blank');
  });

  // ===== Background Persistence =====
  const savedBG = localStorage.getItem('customBG');
  if (savedBG) document.body.style.background = savedBG;

  // ===== Matrix Canvas Animation (if used) =====
  const matrixCanvas = document.getElementById('matrixCanvas');
  if (matrixCanvas) {
    const ctx = matrixCanvas.getContext('2d');
    let width = matrixCanvas.width = window.innerWidth;
    let height = matrixCanvas.height = window.innerHeight;
    const columns = Math.floor(width / 20);
    const drops = Array(columns).fill(1);

    const drawMatrix = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#0F0';
      ctx.font = '18px monospace';

      drops.forEach((y, i) => {
        const text = String.fromCharCode(Math.random() * 128);
        ctx.fillText(text, i * 20, y * 20);
        drops[i] = y * 20 > height && Math.random() > 0.975 ? 0 : y + 1;
      });
      requestAnimationFrame(drawMatrix);
    };
    drawMatrix();

    window.addEventListener('resize', () => {
      width = matrixCanvas.width = window.innerWidth;
      height = matrixCanvas.height = window.innerHeight;
    });
  }

  // ===== Media (Images & Videos) =====
  const imagesSection = document.getElementById('imagesSection');
  const videosSection = document.getElementById('videosSection');
  let imagesList = [];   // full-size images for lightbox
  let videoList = [];    // video URLs
  let currentLightIndex = -1;

  const BATCH_SIZE = 10;  
  let imgOffset = 0;

  async function appendImagesBatch(newImages) {
    imagesList.push(...newImages);
    const fragment = document.createDocumentFragment();
    for (let i = imgOffset; i < Math.min(imgOffset + BATCH_SIZE, imagesList.length); i++) {
      const img = document.createElement('img');
      img.dataset.src = imagesList[i];
      img.loading = 'lazy';
      img.alt = 'Search Result';
      img.onclick = () => openLightbox(i);
      fragment.appendChild(img);
    }
    imagesSection.appendChild(fragment);
    lazyLoadMedia();
    imgOffset += BATCH_SIZE;
  }

  // ===== Lazy Load Images/Videos =====
  function lazyLoadMedia() {
    [imagesSection, videosSection].forEach(container => {
      if (!container) return;
      container.querySelectorAll('img,video').forEach(el => {
        if (!el.dataset.loaded && el.getBoundingClientRect().top < window.innerHeight + 200) {
          if (el.dataset.src) el.src = el.dataset.src;
          el.dataset.loaded = true;
        }
      });
    });
  }

  window.addEventListener('scroll', throttle(lazyLoadMedia, 150));

  // ===== Infinite Scroll for Images =====
  imagesSection.addEventListener('scroll', throttle(() => {
    if (imagesSection.scrollTop + imagesSection.clientHeight >= imagesSection.scrollHeight - 50) {
      appendImagesBatch([]);
    }
  }, 100));

  // ===== Lightbox =====
  function openLightbox(index) {
    currentLightIndex = index;
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    lightboxImg.src = imagesList[index];
    lightbox.classList.add('show');
    lightbox.setAttribute('aria-hidden', 'false');
  }

  function closeLightboxFn() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('show');
    lightbox.setAttribute('aria-hidden', 'true');
    currentLightIndex = -1;
  }

  document.getElementById('lightNext').onclick = () => {
    if (imagesList.length === 0) return;
    currentLightIndex = (currentLightIndex + 1) % imagesList.length;
    document.getElementById('lightboxImg').src = imagesList[currentLightIndex];
  };
  document.getElementById('lightPrev').onclick = () => {
    if (imagesList.length === 0) return;
    currentLightIndex = (currentLightIndex - 1 + imagesList.length) % imagesList.length;
    document.getElementById('lightboxImg').src = imagesList[currentLightIndex];
  };
  document.getElementById('closeLightbox').onclick = closeLightboxFn;
  document.addEventListener('keydown', (e) => {
    if (document.getElementById('lightbox').classList.contains('show')) {
      if (e.key === 'Escape') closeLightboxFn();
      if (e.key === 'ArrowRight') document.getElementById('lightNext').click();
      if (e.key === 'ArrowLeft') document.getElementById('lightPrev').click();
    }
  });

  // ===== Helper: Throttle =====
  function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function () {
      const context = this;
      const args = arguments;
      if (!lastRan) {
        func.apply(context, args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(function () {
          if ((Date.now() - lastRan) >= limit) {
            func.apply(context, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  }

});
