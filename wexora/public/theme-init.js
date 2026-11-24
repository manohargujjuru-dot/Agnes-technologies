/* Applies the saved (or system) colour theme before the page renders — prevents a flash of the wrong theme.
   Loaded as a normal script in index.html (no inline JS, so the Content-Security-Policy stays strict). */
(function () {
  var theme = null;
  try { theme = localStorage.getItem("agnes-theme"); } catch (e) { /* storage blocked */ }
  if (theme !== "dark" && theme !== "light") {
    theme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  document.documentElement.setAttribute("data-theme", theme);
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#0a1120" : "#1A3B8F");
})();
