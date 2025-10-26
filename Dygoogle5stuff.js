// Dygoogle5stuff.js
console.log("Dygoogle5stuff.js loaded!");

// --- Settings menu ---
function createSettingsMenu() {
  // Create container
  const menu = document.createElement("div");
  menu.id = "settingsMenu";
  menu.style.position = "fixed";
  menu.style.top = "16px";
  menu.style.right = "16px";
  menu.style.background = "rgba(0,0,0,0.7)";
  menu.style.color = "white";
  menu.style.padding = "14px";
  menu.style.borderRadius = "12px";
  menu.style.zIndex = "1500";
  menu.style.fontFamily = "sans-serif";
  menu.style.width = "220px";
  menu.style.boxShadow = "0 6px 18px rgba(0,0,0,0.25)";

  // Title
  const title = document.createElement("h4");
  title.textContent = "Settings";
  title.style.margin = "0 0 10px 0";
  menu.appendChild(title);

  // Background color picker
  const bgLabel = document.createElement("label");
  bgLabel.textContent = "Background color: ";
  const bgInput = document.createElement("input");
  bgInput.type = "color";

  // Load saved color
  bgInput.value = localStorage.getItem("dygoogleBGColor") || "#2596be";
  document.body.style.backgroundColor = bgInput.value;

  bgInput.oninput = () => {
    document.body.style.backgroundColor = bgInput.value;
    localStorage.setItem("dygoogleBGColor", bgInput.value);
  };
  bgLabel.appendChild(bgInput);
  menu.appendChild(bgLabel);

  menu.appendChild(document.createElement("br"));

  // Animated/Seasonal backgrounds toggle
  const animLabel = document.createElement("label");
  animLabel.style.display = "block";
  animLabel.style.marginTop = "8px";
  const animInput = document.createElement("input");
  animInput.type = "checkbox";

  // Load saved state
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

  // Apply saved animation state on load
  if (animInput.checked) startSeasonalBackground();
}

// --- Example seasonal background ---
let seasonalInterval = null;
function startSeasonalBackground() {
  stopSeasonalBackground();
  let hue = 0;
  seasonalInterval = setInterval(() => {
    document.body.style.backgroundColor = `hsl(${hue}, 60%, 50%)`;
    hue = (hue + 1) % 360;
  }, 100);
}
function stopSeasonalBackground() {
  if (seasonalInterval) clearInterval(seasonalInterval);
  seasonalInterval = null;
  // Restore background color from storage
  document.body.style.backgroundColor = localStorage.getItem("dygoogleBGColor") || "#2596be";
}

// Initialize settings menu after DOM loads
window.addEventListener("DOMContentLoaded", createSettingsMenu);
