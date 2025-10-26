// Dygoogle5stuff.js
console.log("Dygoogle5stuff.js loaded!");

// --- Settings menu with gear icon ---
function createSettingsMenu() {
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
    boxShadow: "0 6px 18px rgba(0,0,0,0.25)"
  });

  const menu = document.createElement("div");
  menu.id = "settingsMenu";
  Object.assign(menu.style, {
    position: "fixed",
    bottom: "72px",
    right: "16px",
    background: "rgba(0,0,0,0.7)",
    color: "white",
    padding: "14px",
    borderRadius: "12px",
    zIndex: "1500",
    fontFamily: "sans-serif",
    width: "240px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
    display: "none"
  });

  const title = document.createElement("h4");
  title.textContent = "Settings";
  title.style.margin = "0 0 10px 0";
  menu.appendChild(title);

  // --- Theme Presets ---
  const presetLabel = document.createElement("label");
  presetLabel.textContent = "Theme Presets: ";
  const presetSelect = document.createElement("select");
  const themes = {
    Classic: "#2596be",
    Dark: "#111111",
    Light: "#f5f5f5",
    Holiday: "#b22222"
  };
  for (const theme in themes) {
    const option = document.createElement("option");
    option.value = themes[theme];
    option.textContent = theme;
    presetSelect.appendChild(option);
  }
  presetSelect.value = localStorage.getItem("dygoogleBGColor") || "#2596be";
  document.body.style.backgroundColor = presetSelect.value;
  presetSelect.onchange = () => {
    document.body.style.backgroundColor = presetSelect.value;
    localStorage.setItem("dygoogleBGColor", presetSelect.value);
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
    localStorage.setItem("dygoogleBGColor", bgInput.value);
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
  menu.appendChild(uploadLabel);
  menu.appendChild(document.createElement("br"));

  // --- Multiple Seasonal Animations ---
  const seasonLabel = document.createElement("label");
  seasonLabel.textContent = "Seasonal Animation: ";
  seasonLabel.style.display = "block";
  const seasonSelect = document.createElement("select");
  const seasons = ["None", "Fall", "Winter", "Spring", "Summer", "Halloween", "Christmas"];
  seasons.forEach(s => {
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
  menu.appendChild(document.createElement("br"));

  // Footer
  const footer = document.createElement("div");
  footer.textContent = "Made by Dylan.H";
  footer.style.fontSize = "11px";
  footer.style.marginTop = "12px";
  footer.style.opacity = "0.7";
  menu.appendChild(footer);

  document.body.appendChild(menu);
  document.body.appendChild(menuIcon);

  menuIcon.addEventListener("click", () => {
    menu.style.display = menu.style.display === "none" ? "block" : "none";
  });

  // Load saved custom background
  const savedBG = localStorage.getItem("dygoogleCustomBG");
  if (savedBG) document.body.style.backgroundImage = `url('${savedBG}')`;

  // Load saved season
  if (seasonSelect.value !== "none") startSeasonalBackground(seasonSelect.value);

  // Load saved cursor
  if (cursorInput.value) cursorInput.oninput();
}

// --- Seasonal animations ---
let seasonalInterval;
function startSeasonalBackground(type = "fall") {
  stopSeasonalBackground();
  const container = document.createElement("div");
  container.id = "seasonalContainer";
  Object.assign(container.style, {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 1000
  });
  document.body.appendChild(container);

  const emojis = {
    fall: "🍂",
    winter: "❄️",
    spring: "🌸",
    summer: "☀️",
    halloween: "🎃",
    christmas: "🎄"
  };
  const emoji = emojis[type] || "🍂";

  seasonalInterval = setInterval(() => {
    const elem = document.createElement("div");
    elem.textContent = emoji;
    elem.style.position = "absolute";
    elem.style.left = Math.random() * window.innerWidth + "px";
    elem.style.top = "-50px";
    elem.style.fontSize = `${12 + Math.random() * 24}px`;
    elem.style.opacity = Math.random();
    container.appendChild(elem);

    const speed = 2 + Math.random() * 3;
    const drift = (Math.random() - 0.5) * 2;
    const fall = () => {
      const top = parseFloat(elem.style.top);
      const left = parseFloat(elem.style.left);
      if (top < window.innerHeight) {
        elem.style.top = top + speed + "px";
        elem.style.left = left + drift + "px";
        requestAnimationFrame(fall);
      } else {
        elem.remove();
      }
    };
    fall();
  }, 300);
}

function stopSeasonalBackground() {
  if (seasonalInterval) clearInterval(seasonalInterval);
  seasonalInterval = null;
  const container = document.getElementById("seasonalContainer");
  if (container) container.remove();
}

window.addEventListener("DOMContentLoaded", createSettingsMenu);
