// Dygoogle5stuff.js
console.log("Dygoogle5stuff.js loaded!");

// ====== GLOBAL STATE ======
let performanceModeActive = false;

// ====== HELPER FUNCTIONS ======

// Apply user's saved background
function applyUserBackground() {
  const customBG = localStorage.getItem("dygoogleCustomBG");
  const bgColor = localStorage.getItem("dygoogleBGColor");

  if (customBG) {
    document.body.style.backgroundImage = `url('${customBG}')`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundRepeat = "no-repeat";
  } else {
    document.body.style.backgroundImage = "";
  }
  document.body.style.backgroundColor = bgColor || "#2596be";
}

// Enable Performance Mode (Reduced Lag)
function enablePerformanceMode() {
  console.log("Performance Mode enabled: heavy effects paused.");
  performanceModeActive = true;

  // Stop Matrix animation
  if (window.stopMatrix) stopMatrix();

  // Stop seasonal effects
  if (window.stopSeasonalBackground) stopSeasonalBackground();

  // Hide heavy UI sections temporarily
  [window.imagesSection, window.videosSection, window.].forEach(c => c && (c.style.display = "none"));

  // Stop pulsing gear animation
  if (window.performanceModeInterval) {
    clearInterval(window.performanceModeInterval);
    window.performanceModeInterval = null;
  }

  updatePerformanceStatusUI();
}

// Disable Performance Mode
function disablePerformanceMode() {
  console.log("Performance Mode disabled: heavy effects restored.");
  performanceModeActive = false;

  // Restore UI sections
  [window.imagesSection, window.videosSection, window.timelineContainer, window.dictionaryContainer].forEach(c => c && (c.style.display = ""));

  // Restart seasonal effects
  const season = localStorage.getItem("dygoogleSeason") || "none";
  if (season !== "none") startSeasonalBackground(season);

  updatePerformanceStatusUI();
}

// Update Performance Mode status display in menu
function updatePerformanceStatusUI() {
  const label = document.getElementById("performanceStatus");
  if (label) {
    label.textContent = "Performance Mode: " + (performanceModeActive ? "ON ⚡" : "OFF ❌");
    label.style.color = performanceModeActive ? "#ff4d4d" : "#aaa";
  }
}

// Monitor for lag automatically
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

  // --- Menu Container ---
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

  // --- Menu Title ---
  const title = document.createElement("h3");
  title.textContent = "Settings";
  Object.assign(title.style, { textAlign: "center", margin: "0 0 15px 0", fontWeight: "bold" });
  menu.appendChild(title);

  // --- Performance Mode Status ---
  const perfStatusLabel = document.createElement("div");
  perfStatusLabel.id = "performanceStatus";
  perfStatusLabel.style.marginBottom = "10px";
  menu.appendChild(perfStatusLabel);
  updatePerformanceStatusUI();

  // Toggle button
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
    document.body.style.backgroundColor = presetSelect.value;
    document.body.style.backgroundImage = "";
    localStorage.setItem("dygoogleBGColor", presetSelect.value);
    localStorage.removeItem("dygoogleCustomBG");
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
    document.body.style.backgroundColor = bgInput.value;
    document.body.style.backgroundImage = "";
    localStorage.setItem("dygoogleBGColor", bgInput.value);
    localStorage.removeItem("dygoogleCustomBG");
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
      document.body.style.backgroundImage = `url('${reader.result}')`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundRepeat = "no-repeat";
      localStorage.setItem("dygoogleCustomBG", reader.result);
    };
    reader.readAsDataURL(file);
  };
  uploadLabel.appendChild(uploadInput);
  menu.appendChild(uploadLabel);

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Remove BG Image";
  Object.assign(removeBtn.style, { marginTop: "6px", width: "100%", cursor: "pointer" });
  removeBtn.onclick = () => {
    document.body.style.backgroundImage = "";
    localStorage.removeItem("dygoogleCustomBG");
  };
  menu.appendChild(removeBtn);

  // --- Custom Cursor ---
  const cursorLabel = document.createElement("label");
  cursorLabel.textContent = "Custom Cursor Emoji: ";
  cursorLabel.style.display = "block";
  const cursorInput = document.createElement("input");
  cursorInput.type = "text";
  cursorInput.maxLength = 2;
  cursorInput.value = localStorage.getItem("dygoogleCursor") || "🖱️";
  cursorInput.oninput = () => {
    try {
      document.body.style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"><text y="32" font-size="32">${cursorInput.value}</text></svg>') 16 16, auto`;
      localStorage.setItem("dygoogleCursor", cursorInput.value);
    } catch {
      document.body.style.cursor = "auto";
    }
  };
  cursorLabel.appendChild(cursorInput);
  menu.appendChild(cursorLabel);

  // --- Seasonal Animations ---
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

  // Footer
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
    zIndex: "1500",
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

  // Pulsing animation
  let pulseDirection = 1;
  setInterval(() => {
    const scale = 1 + 0.05 * pulseDirection;
    menuIcon.style.transform = `scale(${scale})`;
    pulseDirection *= -1;
  }, 600);

  // Toggle menu open/close
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

  // Load saved settings
  applyUserBackground();
  if (seasonSelect.value !== "none") startSeasonalBackground(seasonSelect.value);
  if (cursorInput.value) cursorInput.oninput();
}

// ====== SEASONAL EFFECTS PLACEHOLDER ======
let seasonalInterval;
function startSeasonalBackground(type = "fall") { /* your seasonal code */ }
function stopSeasonalBackground() { clearInterval(seasonalInterval); }

// ====== INIT ======
window.addEventListener("DOMContentLoaded", () => {
  createSettingsMenu();
  monitorPerformance();
});
// ======= Disable Custom Cursor to Reduce Lag =======
function disableCustomCursor() {
  // Reset cursor to default
  document.body.style.cursor = "default";

  // Remove any input listeners related to custom cursor
  const cursorInput = document.querySelector('input[type="text"][value^="🖱️"]');
  if (cursorInput) {
    cursorInput.disabled = true; // prevents updates
    cursorInput.style.opacity = 0.5;
  }

  console.log("Custom cursors disabled for performance.");
}

// Call it immediately or inside performance mode
disableCustomCursor();
