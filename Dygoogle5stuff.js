// Dygoogle5stuff.js
console.log("Dygoogle5stuff.js loaded!");

// --- Settings menu with gear icon ---
function createSettingsMenu() {
  const menuIcon = document.createElement("div");
  menuIcon.id = "settingsIcon";
  menuIcon.textContent = "⚙";
  menuIcon.style.position = "fixed";
  menuIcon.style.bottom = "16px";
  menuIcon.style.right = "16px";
  menuIcon.style.fontSize = "28px";
  menuIcon.style.cursor = "pointer";
  menuIcon.style.zIndex = "1500";
  menuIcon.style.color = "white";
  menuIcon.style.background = "rgba(0,0,0,0.6)";
  menuIcon.style.borderRadius = "50%";
  menuIcon.style.width = "48px";
  menuIcon.style.height = "48px";
  menuIcon.style.display = "flex";
  menuIcon.style.alignItems = "center";
  menuIcon.style.justifyContent = "center";
  menuIcon.style.boxShadow = "0 6px 18px rgba(0,0,0,0.25)";

  const menu = document.createElement("div");
  menu.id = "settingsMenu";
  menu.style.position = "fixed";
  menu.style.bottom = "72px";
  menu.style.right = "16px";
  menu.style.background = "rgba(0,0,0,0.7)";
  menu.style.color = "white";
  menu.style.padding = "14px";
  menu.style.borderRadius = "12px";
  menu.style.zIndex = "1500";
  menu.style.fontFamily = "sans-serif";
  menu.style.width = "240px";
  menu.style.boxShadow = "0 6px 18px rgba(0,0,0,0.25)";
  menu.style.display = "none";

  const title = document.createElement("h4");
  title.textContent = "Settings";
  title.style.margin = "0 0 10px 0";
  menu.appendChild(title);

  // Background color picker
  const bgLabel = document.createElement("label");
  bgLabel.textContent = "Background color: ";
  const bgInput = document.createElement("input");
  bgInput.type = "color";
  bgInput.value = localStorage.getItem("dygoogleBGColor") || "#2596be";
  document.body.style.backgroundColor = bgInput.value;
  bgInput.oninput = () => {
    document.body.style.backgroundColor = bgInput.value;
    localStorage.setItem("dygoogleBGColor", bgInput.value);
  };
  bgLabel.appendChild(bgInput);
  menu.appendChild(bgLabel);

  menu.appendChild(document.createElement("br"));

  // Upload custom background
  const uploadLabel = document.createElement("label");
  uploadLabel.textContent = "Upload background: ";
  const uploadInput = document.createElement("input");
  uploadInput.type = "file";
  uploadInput.accept = "image/*";
  uploadInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      document.body.style.backgroundImage = `url('${reader.result}')`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundRepeat = "no-repeat";
      localStorage.setItem("dygoogleCustomBG", reader.result);
    };
    reader.readAsDataURL(file);
  };
  uploadLabel.appendChild(uploadInput);
  menu.appendChild(uploadLabel);

  menu.appendChild(document.createElement("br"));

  // Animated/seasonal BG toggle
  const animLabel = document.createElement("label");
  animLabel.style.display = "block";
  animLabel.style.marginTop = "8px";
  const animInput = document.createElement("input");
  animInput.type = "checkbox";
  animInput.checked = localStorage.getItem("dygoogleSeasonalBG") === "true";
  animInput.onchange = () => {
    localStorage.setItem("dygoogleSeasonalBG", animInput.checked);
    if (animInput.checked) startSeasonalBackground();
    else stopSeasonalBackground();
  };
  animLabel.appendChild(animInput);
  animLabel.appendChild(document.createTextNode(" Animated/Seasonal BG"));
  menu.appendChild(animLabel);

  // Footer
  const footer = document.createElement("div");
  footer.textContent = "Made by Dylan.H";
  footer.style.fontSize = "11px";
  footer.style.marginTop = "12px";
  footer.style.opacity = "0.7";
  menu.appendChild(footer);

  document.body.appendChild(menu);
  document.body.appendChild(menuIcon);

  // Show/hide menu on icon click
  menuIcon.addEventListener("click", () => {
    menu.style.display = menu.style.display === "none" ? "block" : "none";
  });

  // Load saved custom background
  const savedBG = localStorage.getItem("dygoogleCustomBG");
  if (savedBG) document.body.style.backgroundImage = `url('${savedBG}')`;

  // Load saved animation
  if (animInput.checked) startSeasonalBackground();
}

// --- Seasonal animation example: falling leaves ---
let leavesInterval;
function startSeasonalBackground() {
  stopSeasonalBackground();
  const leafContainer = document.createElement("div");
  leafContainer.id = "leavesContainer";
  leafContainer.style.position = "fixed";
  leafContainer.style.top = 0;
  leafContainer.style.left = 0;
  leafContainer.style.width = "100%";
  leafContainer.style.height = "100%";
  leafContainer.style.pointerEvents = "none";
  leafContainer.style.zIndex = 1000;
  document.body.appendChild(leafContainer);

  leavesInterval = setInterval(() => {
    const leaf = document.createElement("div");
    leaf.textContent = "🍂";
    leaf.style.position = "absolute";
    leaf.style.left = Math.random() * window.innerWidth + "px";
    leaf.style.top = "-50px";
    leaf.style.fontSize = `${12 + Math.random() * 24}px`;
    leaf.style.opacity = Math.random();
    leafContainer.appendChild(leaf);
    const speed = 2 + Math.random() * 3;
    const drift = (Math.random() - 0.5) * 2;
    const fall = () => {
      const top = parseFloat(leaf.style.top);
      const left = parseFloat(leaf.style.left);
      if (top < window.innerHeight) {
        leaf.style.top = top + speed + "px";
        leaf.style.left = left + drift + "px";
        requestAnimationFrame(fall);
      } else {
        leaf.remove();
      }
    };
    fall();
  }, 300);
}
function stopSeasonalBackground() {
  if (leavesInterval) clearInterval(leavesInterval);
  leavesInterval = null;
  const container = document.getElementById("leavesContainer");
  if (container) container.remove();
}

window.addEventListener("DOMContentLoaded", createSettingsMenu);
