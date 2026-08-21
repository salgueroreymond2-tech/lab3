const themeKey = "zofranca_theme";
const savedTheme = localStorage.getItem(themeKey);
const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
const isDark = savedTheme ? savedTheme === "dark" : prefersDark;

function updateThemeButton(button) {
  const darkMode = document.body.classList.contains("dark-mode");
  button.innerHTML = `<span class="material-symbols-outlined" aria-hidden="true">${darkMode ? "light_mode" : "dark_mode"}</span>`;
  button.setAttribute("aria-label", darkMode ? "Activar modo claro" : "Activar modo oscuro");
  button.title = darkMode ? "Activar modo claro" : "Activar modo oscuro";
}

function setupThemeToggle() {
  document.body.classList.toggle("dark-mode", isDark);

  const button = document.createElement("button");
  button.className = "theme-toggle";
  button.type = "button";
  button.addEventListener("click", () => {
    const darkMode = document.body.classList.toggle("dark-mode");
    localStorage.setItem(themeKey, darkMode ? "dark" : "light");
    updateThemeButton(button);
  });

  updateThemeButton(button);
  document.body.append(button);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupThemeToggle, { once: true });
} else {
  setupThemeToggle();
}
