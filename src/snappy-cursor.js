import "./snappy-cursor.css";

// A short, frame-rate-independent glide. The loop sleeps as soon as it settles.
const lifecycle = new AbortController();
const root = document.documentElement;
const fine = matchMedia("(hover: hover) and (pointer: fine)");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const cursor = document.createElement("div");
cursor.className = "snappy-cursor";
cursor.setAttribute("aria-hidden", "true");
cursor.innerHTML = `<svg width="26" height="30" viewBox="0 0 26 30" fill="none"><path d="M3 3L22 17L13 18.5L8.5 26L3 3Z" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
document.body.append(cursor);
let frame = 0, pending = null;
let initialized = false, lastTime = 0;
let x = 0, y = 0, targetX = 0, targetY = 0;
const listen = (target, name, handler) => target.addEventListener(name, handler, { passive: true, signal: lifecycle.signal });
const enabled = () => fine.matches && !reduced.matches && !document.hidden && root.dataset.motion !== "paused";
const hide = () => {
  cancelAnimationFrame(frame);
  frame = 0;
  pending = null;
  initialized = false;
  lastTime = 0;
  delete root.dataset.snappyCursor;
  cursor.classList.remove("is-visible", "is-pressed", "is-hovering");
};
const paint = () => {
  cursor.style.transform = `translate3d(${x - 3}px,${y - 3}px,0)`;
};
const render = (time) => {
  frame = 0;
  if (!enabled()) return hide();
  if (pending) {
    const event = pending;
    pending = null;
    const target = event.target instanceof Element ? event.target : null;
    if (event.pointerType !== "mouse" || target?.closest("input, textarea, select, [contenteditable], dialog[open], iframe")) return hide();
    targetX = event.clientX;
    targetY = event.clientY;
    if (!initialized) {
      x = targetX; y = targetY;
      initialized = true;
    }
    cursor.classList.toggle("is-hovering", !!target?.closest("a, button, summary, [role='button'], [role='tab']"));
    cursor.classList.add("is-visible");
    if (root.dataset.snappyCursor !== "active") root.dataset.snappyCursor = "active";
  }
  const dt = lastTime ? Math.min(time - lastTime, 40) : 16.67;
  lastTime = time;
  const distance = Math.hypot(targetX - x, targetY - y);
  // Keep fast sweeps close to the true hit position rather than trailing far behind.
  if (distance > 32) {
    x = targetX - (targetX - x) / distance * 32;
    y = targetY - (targetY - y) / distance * 32;
  }
  const blend = 1 - Math.exp(-dt / 32);
  x += (targetX - x) * blend;
  y += (targetY - y) * blend;
  const settled = Math.hypot(targetX - x, targetY - y) < .1;
  if (settled) { x = targetX; y = targetY; }
  paint();
  if (!settled) frame = requestAnimationFrame(render);
  else lastTime = 0;
};
listen(document, "pointermove", (event) => {
  pending = event;
  if (!frame) frame = requestAnimationFrame(render);
});
listen(document, "pointerdown", (event) => {
  if (event.pointerType !== "mouse") return hide();
  // Press feedback stays at the exact click point.
  if (initialized) {
    x = targetX = event.clientX; y = targetY = event.clientY;
    paint();
  }
  cursor.classList.add("is-pressed");
});
listen(document, "pointerup", () => cursor.classList.remove("is-pressed"));
listen(document, "pointerout", (event) => { if (!event.relatedTarget) hide(); });
listen(document, "keydown", hide);
listen(document, "focusin", (event) => { if (event.target.closest?.("input, textarea, select, dialog")) hide(); });
listen(window, "blur", hide);
listen(document, "visibilitychange", hide);
listen(window, "optimus:motion", hide);
listen(fine, "change", hide);
listen(reduced, "change", hide);
if (import.meta.hot) import.meta.hot.dispose(() => {
  hide(); lifecycle.abort(); cursor.remove();
});
