/** Theme names and the inline pre-paint script (server-safe: no "use client"). */
export type ThemeName = "dark" | "light" | "jarvis";
export const THEME_KEY = "mj-theme";

/** Inline, runs before paint so a saved theme never flashes the default. */
export const themeInitScript = (fallback: ThemeName) =>
  `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="dark"&&t!=="light"&&t!=="jarvis")t=${JSON.stringify(fallback)};var r=document.documentElement;r.dataset.theme=t;r.style.colorScheme=t==="light"?"light":"dark";}catch(e){document.documentElement.dataset.theme=${JSON.stringify(fallback)};}})();`;
