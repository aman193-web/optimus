const lifecycle = new AbortController();
const listen = (target, event, handler) =>
  target.addEventListener(event, handler, { signal: lifecycle.signal });
// Pointer-only enhancement. Native links, inputs, and focus stay untouched.
const selector =
  ".cms-feature-card, .workspace-shell, .stack-comparison, .migration-step-card, .search-concept, .plan-card, .price-calculator";
const pointer = matchMedia("(hover: hover) and (pointer: fine)");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
let active = null,
  frame = 0;
const allowed = () =>
  pointer.matches &&
  !reduced.matches &&
  document.documentElement.dataset.scrolling !== "true" &&
  document.querySelector("#motion-toggle")?.getAttribute("aria-pressed") !==
    "true";
const clear = () => {
  cancelAnimationFrame(frame);
  if (!active) return;
  active.classList.remove("card-engaged");
  active.style.removeProperty("rotate");
  active = null;
};
const prepare = () =>
  document
    .querySelectorAll(selector)
    .forEach((card) => card.classList.add("hover-card"));
prepare();
listen(window, "optimus:layout", prepare);
listen(window, "optimus:motion", clear);
listen(window, "optimus:scrollstate", clear);
listen(reduced, "change", clear);
listen(pointer, "change", clear);
listen(document, "pointermove", (event) => {
  const card =
    event.target instanceof Element ? event.target.closest(selector) : null;
  if (!card || !allowed() || card.matches(":focus-within")) {
    clear();
    return;
  }
  if (active !== card) {
    clear();
    active = card;
  }
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    if (active !== card || !allowed()) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const dx = x - 0.5,
      dy = y - 0.5;
    card.style.setProperty("--glow-x", `${x * 100}%`);
    card.style.setProperty("--glow-y", `${y * 100}%`);
    card.style.rotate = `${-dy || 0.001} ${dx || 0.001} 0 ${Math.hypot(dx, dy) * 3}deg`;
    card.classList.add("card-engaged");
  });
});
listen(document, "pointerout", (event) => {
  if (!event.relatedTarget) clear();
});
listen(window, "blur", clear);
listen(document, "focusin", clear);

if (import.meta.hot)
  import.meta.hot.dispose(() => {
    clear();
    lifecycle.abort();
  });
