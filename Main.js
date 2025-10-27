// ===== main.js =====
document.addEventListener('DOMContentLoaded', () => {

  // ===== Logo Animation =====
  const logoDiv = document.querySelector('.logo');
  if (logoDiv) {
    const logoText = 'Nova';
    logoDiv.innerHTML = '';
    logoText.split('').forEach((char, i) => {
      const span = document.createElement('span');
      span.textContent = char;
      span.style.opacity = 0;
      span.style.transition = `opacity 0.3s ${i * 0.1}s`;
      logoDiv.appendChild(span);
      setTimeout(() => span.style.opacity = 1, 50);
    });
  }

  // ===== Progressive Images =====
  const progressiveImages = document.querySelectorAll('.progressive');
  progressiveImages.forEach(img => {
    const highRes = new Image();
    highRes.src = img.dataset.highres;
    highRes.onload = () => { img.src = highRes.src; };
  });

  // ===== Input Focus Effect =====
  const input = document.getElementById('urlInput');
  if (input) {
    input.addEventListener('input', () => {
      input.classList.toggle('typing', input.value.length > 0);
    });
  }

 // ===== Open Button =====
const openBtn = document.getElementById('openBtn');
if (openBtn && input) {
  // Apply logo-style gradient
  openBtn.style.background = 'linear-gradient(90deg, #00f, #0ff, #0f0, #ff0, #f00, #f0f)';
  openBtn.style.color = '#fff';
  openBtn.style.border = 'none';
  openBtn.style.padding = '10px 20px';
  openBtn.style.borderRadius = '8px';
  openBtn.style.cursor = 'pointer';
  openBtn.style.fontWeight = 'bold';
  openBtn.style.transition = 'transform 0.2s, filter 0.2s';
  
  // Hover effect
  openBtn.addEventListener('mouseover', () => {
    openBtn.style.filter = 'brightness(1.2)';
    openBtn.style.transform = 'scale(1.05)';
  });
  openBtn.addEventListener('mouseout', () => {
    openBtn.style.filter = 'brightness(1)';
    openBtn.style.transform = 'scale(1)';
  });

  // Click action
  openBtn.addEventListener('click', () => {
    const url = input.value.trim();
    if (url) window.open(url.startsWith('http') ? url : 'https://' + url, '_blank');
  });
}

  // ===== Background Persistence =====
  const savedBG = localStorage.getItem('customBG');
  if (savedBG) document.body.style.background = savedBG;

  // ===== Matrix Canvas Animation =====
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
        ctx.fillText(String.fromCharCode(Math.random() * 128), i * 20, y * 20);
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
  let imagesList = [];
  let videoList = [];
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
    if (imagesSection) imagesSection.appendChild(fragment);
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
  if (imagesSection) {
    imagesSection.addEventListener('scroll', throttle(() => {
      if (imagesSection.scrollTop + imagesSection.clientHeight >= imagesSection.scrollHeight - 50) {
        appendImagesBatch([]);
      }
    }, 100));
  }

  // ===== Lightbox =====
  function openLightbox(index) {
    currentLightIndex = index;
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    if (lightbox && lightboxImg) {
      lightboxImg.src = imagesList[index];
      lightbox.classList.add('show');
      lightbox.setAttribute('aria-hidden', 'false');
    }
  }

  function closeLightboxFn() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
      lightbox.classList.remove('show');
      lightbox.setAttribute('aria-hidden', 'true');
    }
    currentLightIndex = -1;
  }

  const lightNext = document.getElementById('lightNext');
  const lightPrev = document.getElementById('lightPrev');
  const closeLightboxBtn = document.getElementById('closeLightbox');

  if (lightNext) lightNext.onclick = () => {
    if (imagesList.length === 0) return;
    currentLightIndex = (currentLightIndex + 1) % imagesList.length;
    document.getElementById('lightboxImg').src = imagesList[currentLightIndex];
  };
  if (lightPrev) lightPrev.onclick = () => {
    if (imagesList.length === 0) return;
    currentLightIndex = (currentLightIndex - 1 + imagesList.length) % imagesList.length;
    document.getElementById('lightboxImg').src = imagesList[currentLightIndex];
  };
  if (closeLightboxBtn) closeLightboxBtn.onclick = closeLightboxFn;

  document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (lightbox && lightbox.classList.contains('show')) {
      if (e.key === 'Escape') closeLightboxFn();
      if (e.key === 'ArrowRight') lightNext?.click();
      if (e.key === 'ArrowLeft') lightPrev?.click();
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
