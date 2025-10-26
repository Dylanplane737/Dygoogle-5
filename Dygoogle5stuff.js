// Dygoogle5stuff.js
console.log("Dygoogle5stuff.js loaded!");

// --- Apply user's saved background ---
function applyUserBackground() {
  const customBG = localStorage.getItem("dygoogleCustomBG");
  const bgColor = localStorage.getItem("dygoogleBGColor") || "#2596be"; // fallback to Classic

  if (customBG) {
    document.body.style.backgroundImage = `url('${customBG}')`;
    document.body.style.backgroundColor = bgColor;
  } else {
    document.body.style.backgroundImage = "";
    document.body.style.backgroundColor = bgColor;
  }
}

// --- Settings menu with animated gear icon ---
function createSettingsMenu() {
  // Gear icon
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
    color: "white",
    background: "rgba(0,0,0,0.6)",
    borderRadius: "50%",
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
    transition: "transform 0.5s ease"
  });

  // Menu container
  const menu = document.createElement("div");
  menu.id = "settingsMenu";
  Object.assign(menu.style, {
    position: "fixed",
    bottom: "72px",
    right: "16px",
    background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(8px)",
    color: "white",
    padding: "20px",
    borderRadius: "16px",
    zIndex: "1500",
    fontFamily: "Arial, sans-serif",
    width: "280px",
    boxShadow: "0 8px 28px rgba(0,0,0,0.4)",
    display: "none",
    transform: "scale(0)",
    transformOrigin: "bottom right",
    transition: "transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55)"
  });

  const title = document.createElement("h4");
  title.textContent = "Settings";
  title.style.margin = "0 0 12px 0";
  title.style.textAlign = "center";
  menu.appendChild(title);

  // --- Theme Presets ---
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
    document.body.style.backgroundImage = ""; // remove any previous image
    localStorage.setItem("dygoogleBGColor", presetSelect.value);
    localStorage.removeItem("dygoogleCustomBG");
  };
  presetLabel.appendChild(presetSelect);
  menu.appendChild(presetLabel);
  menu.appendChild(document.createElement("br"));

  // --- Background color picker ---
  const bgLabel = document.createElement("label");
  bgLabel.textContent = "Custom BG Color: ";
  const bgInput = document.createElement("input");
  bgInput.type = "color";
  bgInput.value = localStorage.getItem("dygoogleBGColor") || "#2596be";
  bgInput.oninput = () => {
    document.body.style.backgroundColor = bgInput.value;
    document.body.style.backgroundImage = ""; // remove image if exists
    localStorage.setItem("dygoogleBGColor", bgInput.value);
    localStorage.removeItem("dygoogleCustomBG");
  };
  bgLabel.appendChild(bgInput);
  menu.appendChild(bgLabel);
  menu.appendChild(document.createElement("br"));

  // --- Upload custom background ---
  const uploadLabel = document.createElement("label");
  uploadLabel.textContent = "Upload BG: ";
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

  // Remove background button
  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Remove BG Image";
  removeBtn.style.marginTop = "6px";
  removeBtn.style.width = "100%";
  removeBtn.style.cursor = "pointer";
  removeBtn.onclick = () => {
    document.body.style.backgroundImage = "";
    localStorage.removeItem("dygoogleCustomBG");
  };
  menu.appendChild(uploadLabel);
  menu.appendChild(document.createElement("br"));
  menu.appendChild(removeBtn);
  menu.appendChild(document.createElement("br"));

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

  // --- Custom Cursor ---
  const cursorLabel = document.createElement("label");
  cursorLabel.textContent = "Custom Cursor Emoji: ";
  const cursorInput = document.createElement("input");
  cursorInput.type = "text";
  cursorInput.maxLength = 2;
  cursorInput.value = localStorage.getItem("dygoogleCursor") || "🖱️";
  cursorInput.oninput = () => {
    document.body.style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"><text y="32" font-size="32">${cursorInput.value}</text></svg>') 16 16, auto`;
    localStorage.setItem("dygoogleCursor", cursorInput.value);
  };
  cursorLabel.appendChild(cursorInput);
  menu.appendChild(cursorLabel);

  // Footer
  const footer = document.createElement("div");
  footer.textContent = "Made by Dylan.H";
  footer.style.fontSize = "11px";
  footer.style.marginTop = "12px";
  footer.style.opacity = "0.7";
  footer.style.textAlign = "center";
  menu.appendChild(footer);

  document.body.appendChild(menu);
  document.body.appendChild(menuIcon);

  // Animated menu open/close
  menuIcon.addEventListener("click", () => {
    if (menu.style.display === "none" || !menu.style.display) {
      menu.style.display = "block";
      requestAnimationFrame(()=>{ menu.style.transform = "scale(1)"; });
      menuIcon.style.transform = "rotate(360deg)";
      setTimeout(()=>{ menuIcon.style.transform = "rotate(0deg)"; }, 600);
    } else {
      menu.style.transform = "scale(0)";
      setTimeout(()=>{ menu.style.display = "none"; }, 400);
    }
  });

  // Load saved user background
  applyUserBackground();

  // Load saved season
  if (seasonSelect.value !== "none") startSeasonalBackground(seasonSelect.value);

  // Load saved cursor
  if (cursorInput.value) cursorInput.oninput();
}

// --- Seasonal animations (unchanged) ---
let seasonalInterval;
function startSeasonalBackground(type = "fall") { /* ... existing code ... */ }
function stopSeasonalBackground() { /* ... existing code ... */ }

window.addEventListener("DOMContentLoaded", createSettingsMenu);
