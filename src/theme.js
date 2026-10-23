const root = document.documentElement;
const toggle = document.querySelector('.theme-toggle');
const system = matchMedia('(prefers-color-scheme: dark)');
let preference;
try { preference = localStorage.getItem('optimus:theme'); } catch { /* Storage is optional. */ }
const valid = (value) => value === 'dark' || value === 'light';
function applyTheme() {
  const theme = valid(preference) ? preference : system.matches ? 'dark' : 'light';
  root.dataset.theme = theme;
  toggle.setAttribute('aria-pressed', String(theme === 'dark'));
  toggle.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#081c16' : '#ffffff';
}
const lifecycle = new AbortController();
// Move the same control so theme state, keyboard focus and storage stay shared.
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
  try { localStorage.setItem('optimus:theme', preference); } catch { /* Still switch without persistence. */ }
  applyTheme();
}, { signal: lifecycle.signal });
system.addEventListener('change', applyTheme, { signal: lifecycle.signal });
window.addEventListener('storage', (event) => {
  if (event.key === 'optimus:theme' || event.key === null) {
    preference = event.newValue;
    applyTheme();
  }
}, { signal: lifecycle.signal });
applyTheme();
if (import.meta.hot) import.meta.hot.dispose(() => lifecycle.abort());
