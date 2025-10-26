// dygoogle-extensions.js

// Example: Dark/Light Mode toggle
const toggleThemeBtn = document.createElement("button");
toggleThemeBtn.textContent = "Toggle Theme";
toggleThemeBtn.style.position = "fixed";
toggleThemeBtn.style.bottom = "20px";
toggleThemeBtn.style.right = "20px";
toggleThemeBtn.style.zIndex = 2000;
document.body.appendChild(toggleThemeBtn);

let darkMode = false;
toggleThemeBtn.onclick = () => {
  darkMode = !darkMode;
  if (darkMode) {
    document.body.style.background = "#121212";
    document.body.style.color = "#e0e0e0";
  } else {
    document.body.style.background = "#2596be";
    document.body.style.color = "white";
  }
};

// Example: Extra Easter Egg
document.getElementById("openBtn").addEventListener("click", () => {
  const val = document.getElementById("urlInput").value.trim().toLowerCase();
  if (val === "catparty") {
    alert("🐱🎉 Welcome to Cat Party!");
  }
});
