// ===== Stuff.js: Settings, Dev Tools, Footer =====

// ===== SETTINGS MENU =====
const settingsBtn = document.createElement("button");
settingsBtn.textContent = "⚙️ Settings";
settingsBtn.style.position = "fixed";
settingsBtn.style.top = "10px";
settingsBtn.style.right = "10px";
settingsBtn.style.zIndex = "1000";
document.body.appendChild(settingsBtn);

// Settings panel
const settingsPanel = document.createElement("div");
settingsPanel.style.position = "fixed";
settingsPanel.style.top = "50px";
settingsPanel.style.right = "10px";
settingsPanel.style.width = "250px";
settingsPanel.style.background = "#fff";
settingsPanel.style.border = "2px solid #333";
settingsPanel.style.padding = "10px";
settingsPanel.style.borderRadius = "6px";
settingsPanel.style.display = "none";
settingsPanel.style.zIndex = "1000";
document.body.appendChild(settingsPanel);

settingsPanel.innerHTML = `
  <h3>Settings</h3>
  <label>Background Color: <input type="color" id="bgColorPicker"></label>
  <br><br>
  <button id="devToolsBtn">Open Dev Tools</button>
  <br><br>
  <div style="font-size:12px; text-align:center;">Made by Dylan.H.</div>
`;

// Toggle settings panel
settingsBtn.onclick = () => {
  settingsPanel.style.display = settingsPanel.style.display === "none" ? "block" : "none";
};

// ===== Background color persistence =====
const bgColorPicker = document.getElementById("bgColorPicker");

// Apply saved background color
const savedBg = localStorage.getItem("novaBgColor");
if(savedBg){
  document.body.style.background = savedBg;
  bgColorPicker.value = savedBg;
}

// Change background color
bgColorPicker.addEventListener("input", e => {
  document.body.style.background = e.target.value;
  localStorage.setItem("novaBgColor", e.target.value);
});

// ===== FAKE DEV TOOLS =====
const devToolsBtn = document.getElementById("devToolsBtn");
devToolsBtn.onclick = () => {
  // Check if debug panel exists
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
    panel.scrollTop = panel.scrollHeight; // auto scroll to bottom
  }
}

// Expose logDebug globally
window.logDebug = logDebug;
