console.log("Dygoogle5stuff.js loaded!");

// ====== GLOBAL STATE ======
let performanceModeActive = false;

// ====== HELPER FUNCTIONS ======

// Apply user's saved background persistently
function applyUserBackground() {
  const customBG = localStorage.getItem("dygoogleCustomBG");
  const bgColor = localStorage.getItem("dygoogleBGColor") || "#2596be";

  document.body.style.backgroundColor = bgColor;

  if (customBG) {
    document.body.style.backgroundImage = `url('${customBG}')`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundRepeat = "no-repeat";
  } else {
    document.body.style.backgroundImage = "";
  }

  // Keep text/button colors readable on light/dark BGs
  const brightness = getColorBrightness(bgColor);
  document.body.style.color = brightness < 128 ? "#fff" : "#111";
}

// Helper to calculate brightness from hex color
function getColorBrightness(hex) {
  const c = hex.substring(1);
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = rgb & 0xff;
  return (r * 299 + g * 587 + b * 114) / 1000;
}

// Always reapply background when page updates
window.addEventListener("focus", applyUserBackground);
window.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") applyUserBackground();
});

// ====== PERFORMANCE MODE ======
function enablePerformanceMode() {
  console.log("Performance Mode enabled: heavy effects paused.");
  performanceModeActive = true;

  if (window.stopMatrix) stopMatrix();
  if (window.stopSeasonalBackground) stopSeasonalBackground();

  [window.imagesSection, window.videosSection].forEach(c => c && (c.style.display = "none"));

  updatePerformanceStatusUI();
}

function disablePerformanceMode() {
  console.log("Performance Mode disabled: heavy effects restored.");
  performanceModeActive = false;

  [window.imagesSection, window.videosSection].forEach(c => c && (c.style.display = ""));

  const season = localStorage.getItem("dygoogleSeason") || "none";
  if (season !== "none") startSeasonalBackground(season);

  updatePerformanceStatusUI();
}

function updatePerformanceStatusUI() {
  const label = document.getElementById("performanceStatus");
  if (label) {
    label.textContent = "Performance Mode: " + (performanceModeActive ? "ON ⚡" : "OFF ❌");
    label.style.color = performanceModeActive ? "#ff4d4d" : "#aaa";
  }
}

function monitorPerformance() {
  let lastTime = performance.now();
  const threshold = 50;

  function check() {
    const now = performance.now();
    const delta = now - lastTime;
    lastTime = now;

    if (delta > threshold && !performanceModeActive) {
      console.warn("High frame time detected:", delta.toFixed(1), "ms — enabling Performance Mode.");
      enablePerformanceMode();
      return;
    }
    requestAnimationFrame(check);
  }
  requestAnimationFrame(check);
}

// ====== SETTINGS MENU ======
function createSettingsMenu() {
  if (document.getElementById("settingsIcon")) return;

  const menu = document.createElement("div");
  menu.id = "settingsMenu";
  Object.assign(menu.style, {
    position: "fixed",
    bottom: "72px",
    right: "16px",
    width: "300px",
    background: "rgba(0,0,0,0.75)",
    color: "#fff",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
    backdropFilter: "blur(8px)",
    fontFamily: "Arial, sans-serif",
    transform: "scale(0)",
    transformOrigin: "bottom right",
    transition: "transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55)",
    zIndex: 1500
  });

  const title = document.createElement("h3");
  title.textContent = "Settings";
  Object.assign(title.style, { textAlign: "center", margin: "0 0 15px 0", fontWeight: "bold" });
  menu.appendChild(title);

  const perfStatusLabel = document.createElement("div");
  perfStatusLabel.id = "performanceStatus";
  perfStatusLabel.style.marginBottom = "10px";
  menu.appendChild(perfStatusLabel);
  updatePerformanceStatusUI();

  const togglePerfBtn = document.createElement("button");
  togglePerfBtn.textContent = "Toggle Performance Mode";
  Object.assign(togglePerfBtn.style, {
    width: "100%",
    padding: "8px",
    marginBottom: "12px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    background: "#ff4d4d",
    color: "#fff",
    fontWeight: "bold"
  });
  togglePerfBtn.onclick = () => {
    if (performanceModeActive) disablePerformanceMode();
    else enablePerformanceMode();
  };
  menu.appendChild(togglePerfBtn);

  // --- Theme Presets ---
  const themeContainer = document.createElement("div");
  themeContainer.style.marginBottom = "12px";
  const presetLabel = document.createElement("label");
  presetLabel.textContent = "Theme Presets: ";
  const presetSelect = document.createElement("select");
  const themes = { Classic: "#2596be", Dark: "#111111", Light: "#f5f5f5", Holiday: "#b22222" };
  for (const theme in themes) {
    const option = document.createElement("option");
    option.value = themes[theme];
    option.textContent = theme;
    presetSelect.appendChild(option);
  }
  presetSelect.value = localStorage.getItem("dygoogleBGColor") || "#2596be";
  presetSelect.onchange = () => {
    localStorage.setItem("dygoogleBGColor", presetSelect.value);
    localStorage.removeItem("dygoogleCustomBG");
    applyUserBackground();
  };
  presetLabel.appendChild(presetSelect);
  themeContainer.appendChild(presetLabel);
  menu.appendChild(themeContainer);

  // --- Custom Background Color ---
  const bgLabel = document.createElement("label");
  bgLabel.textContent = "Custom BG Color: ";
  const bgInput = document.createElement("input");
  bgInput.type = "color";
  bgInput.value = localStorage.getItem("dygoogleBGColor") || "#2596be";
  bgInput.oninput = () => {
    localStorage.setItem("dygoogleBGColor", bgInput.value);
    localStorage.removeItem("dygoogleCustomBG");
    applyUserBackground();
  };
  bgLabel.appendChild(bgInput);
  menu.appendChild(bgLabel);

  // --- Upload Custom Background ---
  const uploadLabel = document.createElement("label");
  uploadLabel.textContent = "Upload BG: ";
  const uploadInput = document.createElement("input");
  uploadInput.type = "file";
  uploadInput.accept = "image/*";
  uploadInput.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem("dygoogleCustomBG", reader.result);
      applyUserBackground();
    };
    reader.readAsDataURL(file);
  };
  uploadLabel.appendChild(uploadInput);
  menu.appendChild(uploadLabel);

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Remove BG Image";
  Object.assign(removeBtn.style, { marginTop: "6px", width: "100%", cursor: "pointer" });
  removeBtn.onclick = () => {
    localStorage.removeItem("dygoogleCustomBG");
    applyUserBackground();
  };
  menu.appendChild(removeBtn);

  const seasonLabel = document.createElement("label");
  seasonLabel.textContent = "Seasonal Animation: ";
  seasonLabel.style.display = "block";
  const seasonSelect = document.createElement("select");
  ["None", "Fall", "Winter", "Spring", "Summer", "Halloween", "Christmas"].forEach(s => {
    const option = document.createElement("option");
    option.value = s.toLowerCase();
    option.textContent = s;
    seasonSelect.appendChild(option);
  });
  seasonSelect.value = localStorage.getItem("dygoogleSeason") || "none";
  seasonSelect.onchange = () => {
    localStorage.setItem("dygoogleSeason", seasonSelect.value);
    if (seasonSelect.value !== "none") startSeasonalBackground(seasonSelect.value);
    else stopSeasonalBackground();
  };
  seasonLabel.appendChild(seasonSelect);
  menu.appendChild(seasonLabel);

  const footer = document.createElement("div");
  footer.textContent = "Made by Dylan.H";
  Object.assign(footer.style, { fontSize: "11px", marginTop: "12px", opacity: "0.7", textAlign: "center" });
  menu.appendChild(footer);

  // --- Gear Icon ---
  const menuIcon = document.createElement("div");
  menuIcon.id = "settingsIcon";
  menuIcon.textContent = "⚙";
  Object.assign(menuIcon.style, {
    position: "fixed",
    bottom: "16px",
    right: "16px",
    fontSize: "28px",
    cursor: "pointer",
    zIndex: 1500,
    color: "#fff",
    background: "rgba(0,0,0,0.6)",
    borderRadius: "50%",
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
    transition: "transform 0.3s ease"
  });

  let pulseDirection = 1;
  setInterval(() => {
    const scale = 1 + 0.05 * pulseDirection;
    menuIcon.style.transform = `scale(${scale})`;
    pulseDirection *= -1;
  }, 600);

  menuIcon.addEventListener("click", () => {
    if (menu.style.transform === "scale(0)") {
      menu.style.display = "block";
      requestAnimationFrame(() => menu.style.transform = "scale(1)");
    } else {
      menu.style.transform = "scale(0)";
      setTimeout(() => { menu.style.display = "none"; }, 400);
    }
  });

  document.body.appendChild(menu);
  document.body.appendChild(menuIcon);

  applyUserBackground();
  if (seasonSelect.value !== "none") startSeasonalBackground(seasonSelect.value);
}

// ====== SEASONAL EFFECTS PLACEHOLDER ======
let seasonalInterval;
function startSeasonalBackground(type = "fall") {}
function stopSeasonalBackground() { clearInterval(seasonalInterval); }

// ====== OPEN BUTTON ======
function setupOpenButton() {
  const openBtn = document.getElementById("openBtn");
  const urlInput = document.getElementById("urlInput");
  if (!openBtn || !urlInput) return;

  openBtn.addEventListener("click", () => {
    const url = urlInput.value.trim();
    if (url) window.open(url.startsWith("http") ? url : "https://" + url, "_blank");
  });

  urlInput.addEventListener("keydown", e => {
    if (e.key === "Enter") openBtn.click();
  });
}

// ====== INIT ======
window.addEventListener("DOMContentLoaded", () => {
  createSettingsMenu();
  setupOpenButton();
  monitorPerformance();
  applyUserBackground(); // <— ensures color persists even after searches
});
