// Replace text logo with PNG
(function(){
  const logoDiv = document.querySelector('.logo');
  if (logoDiv) {
    logoDiv.innerHTML = ''; // remove any text
    const logoImg = document.createElement('img');
    logoImg.src = "Novalogo.png";
    logoImg.alt = "Nova Logo";
    logoImg.style.width = "160px";
    logoImg.style.height = "auto";
    logoImg.style.display = "block";
    logoImg.style.margin = "0 auto 16px";
    logoDiv.appendChild(logoImg);
  }
})();
