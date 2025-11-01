// ===== Stuff.js Upgrade: Presets + Animated Settings =====

// ===== SETTINGS BUTTON =====
const settingsBtn = document.createElement("button");
settingsBtn.textContent = "⚙️ Settings";
settingsBtn.style.position = "fixed";
settingsBtn.style.top = "10px";
settingsBtn.style.right = "10px";
settingsBtn.style.zIndex = "1000";
settingsBtn.style.padding = "6px 10px";
settingsBtn.style.borderRadius = "5px";
settingsBtn.style.border = "1px solid #333";
settingsBtn.style.background = "#fff";
settingsBtn.style.cursor = "pointer";
document.body.appendChild(settingsBtn);

// ===== SETTINGS PANEL =====
const settingsPanel = document.createElement("div");
settingsPanel.style.position = "fixed";
settingsPanel.style.top = "50px";
settingsPanel.style.right = "10px";
settingsPanel.style.width = "260px";
settingsPanel.style.background = "#fff";
settingsPanel.style.border = "2px solid #333";
settingsPanel.style.padding = "15px";
settingsPanel.style.borderRadius = "10px";
settingsPanel.style.display = "none";
settingsPanel.style.zIndex = "1000";
settingsPanel.style.boxShadow = "0 0 15px rgba(0,0,0,0.3)";
settingsPanel.style.transform = "scale(0.9)";
settingsPanel.style.transition = "transform 0.25s ease, opacity 0.25s ease";
settingsPanel.style.opacity = "0";
document.body.appendChild(settingsPanel);

settingsPanel.innerHTML = `
  <h3 style="margin-top:0;">Settings</h3>

  <div style="margin-bottom:10px;">
    <strong>Presets:</strong><br>
    <button class="presetBtn" data-color="#1e90ff" style="background:#1e90ff;color:#fff;margin:2px;">Nova Blue</button>
    <button class="presetBtn" data-color="#222" style="background:#222;color:#fff;margin:2px;">Dark</button>
    <button class="presetBtn" data-color="#f0f0f0" style="background:#f0f0f0;color:#000;margin:2px;">Light</button>
  </div>

  <div style="margin-bottom:10px;">
    <strong>Custom Color:</strong><br>
    <input type="color" id="bgColorPicker">
  </div>

  <button id="devToolsBtn" style="margin-bottom:10px;">Open Dev Tools</button>

  <div style="font-size:12px; text-align:center;">Made by Dylan.H.</div>
`;

// ===== OPEN/CLOSE ANIMATION =====
settingsBtn.onclick = () => {
  if(settingsPanel.style.display === "none"){
    settingsPanel.style.display = "block";
    setTimeout(() => {
      settingsPanel.style.transform = "scale(1)";
      settingsPanel.style.opacity = "1";
    }, 10);
  } else {
    settingsPanel.style.transform = "scale(0.9)";
    settingsPanel.style.opacity = "0";
    setTimeout(() => settingsPanel.style.display = "none", 250);
  }
};

// ===== BACKGROUND COLOR PRESETS =====
const presetBtns = document.querySelectorAll(".presetBtn");
presetBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    document.body.style.background = btn.dataset.color;
    localStorage.setItem("novaBgColor", btn.dataset.color);
    // Update color picker too
    const bgPicker = document.getElementById("bgColorPicker");
    if(bgPicker) bgPicker.value = btn.dataset.color;
  });
});

// ===== CUSTOM COLOR PICKER =====
const bgColorPicker = document.getElementById("bgColorPicker");
const savedBg = localStorage.getItem("novaBgColor");
if(savedBg){
  document.body.style.background = savedBg;
  bgColorPicker.value = savedBg;
}

bgColorPicker.addEventListener("input", e => {
  document.body.style.background = e.target.value;
  localStorage.setItem("novaBgColor", e.target.value);
});

// ===== FAKE DEV TOOLS =====
const devToolsBtn = document.getElementById("devToolsBtn");
devToolsBtn.onclick = () => {
  let debugPanel = document.getElementById("debugPanel");
  if(!debugPanel){
    debugPanel = document.createElement("div");
    debugPanel.id = "debugPanel";
    debugPanel.style.position = "fixed";
    debugPanel.style.bottom = "0";
    debugPanel.style.left = "0";
    debugPanel.style.width = "100%";
    debugPanel.style.maxHeight = "150px";
    debugPanel.style.overflowY = "auto";
    debugPanel.style.background = "#222";
    debugPanel.style.color = "#fff";
    debugPanel.style.fontFamily = "monospace";
    debugPanel.style.padding = "5px";
    debugPanel.style.zIndex = "9999";
    debugPanel.innerHTML = `<h4 style="margin:0; font-size:14px;">Debug Panel</h4><div id="debugOutput"></div>`;
    document.body.appendChild(debugPanel);
  }
  debugPanel.style.display = debugPanel.style.display === "none" ? "block" : "none";
};

// ===== HELPER TO LOG DEBUG MESSAGES =====
function logDebug(msg){
  const panel = document.getElementById("debugOutput");
  if(panel){
    const p = document.createElement("div");
    p.textContent = msg;
    panel.appendChild(p);
    panel.scrollTop = panel.scrollHeight;
  }
}
window.logDebug = logDebug;
