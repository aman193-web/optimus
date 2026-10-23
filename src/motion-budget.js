// Suspend pointer-driven hit testing while the page moves. Visible ambient
// motion and scroll-linked timelines stay continuous.
const root = document.documentElement;
const lifecycle = new AbortController();
let scrolling = false, timer = 0;
function publish(next) {
  if (next === scrolling) return;
  scrolling = next;
  root.dataset.scrolling = String(next);
  window.dispatchEvent(new Event("optimus:scrollstate"));
}
function onScroll() {
  publish(true);
  clearTimeout(timer);
  timer = setTimeout(() => publish(false), 160);
}
window.addEventListener("scroll", onScroll, { passive:true, signal:lifecycle.signal });
document.addEventListener("visibilitychange", () => {
  if (document.hidden) { clearTimeout(timer); publish(false); }
}, { signal:lifecycle.signal });
if (import.meta.hot) import.meta.hot.dispose(() => {
  lifecycle.abort(); clearTimeout(timer); publish(false);
});
