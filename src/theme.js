const root = document.documentElement;
const toggle = document.querySelector('.theme-toggle');
// Each visit starts in light mode; dark mode is an explicit choice for this page.
let preference = 'light';
function applyTheme() {
  const theme = preference;
  root.dataset.theme = theme;
  toggle.setAttribute('aria-pressed', String(theme === 'dark'));
  toggle.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#081c16' : '#ffffff';
}
const lifecycle = new AbortController();
// Move the same control so theme state and keyboard focus stay shared.
const mobileMenu = matchMedia('(max-width: 900px)');
const themeRow = document.querySelector('.mobile-theme-row');
const navCta = document.querySelector('.nav-cta');
function placeToggle() {
  if (mobileMenu.matches) themeRow.append(toggle);
  else navCta.before(toggle);
}
mobileMenu.addEventListener('change', placeToggle, { signal: lifecycle.signal });
placeToggle();
toggle.addEventListener('click', () => {
  preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme();
}, { signal: lifecycle.signal });
applyTheme();
if (import.meta.hot) import.meta.hot.dispose(() => lifecycle.abort());
