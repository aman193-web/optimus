import { gsap } from "gsap";

const hero = document.querySelector(".hero");
const light = hero.querySelector(".hero-atmosphere");
const flow = hero.querySelector(".hero-light-flow");
const grid = hero.querySelector(".hero-pointer-grid");
const lifecycle = new AbortController();
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const fine = matchMedia("(hover: hover) and (pointer: fine)");
let frame = 0, visible = true, initialized = false, lastTime = 0;
const target = { x: 0, y: 0 }, point = { x: 0, y: 0 }, velocity = { x: 0, y: 0 };
let driftX = 0, driftY = 0;
let pendingPointer = null;
const listen = (target, type, fn) => target.addEventListener(type, fn, { signal: lifecycle.signal });
const paused = () => reduced.matches || document.hidden || !visible || document.documentElement.dataset.motion === "paused";
const allowed = () => !paused() && fine.matches;
function render(time) {
  if (!allowed()) return reset(true);
  if (pendingPointer) {
    const rect = light.getBoundingClientRect();
    const event = pendingPointer;
    pendingPointer = null;
    if (event.clientY > rect.bottom) return reset();
    target.x = event.clientX - rect.left;
    target.y = event.clientY - rect.top;
    if (!initialized) {
      point.x = target.x; point.y = target.y;
      initialized = true;
    }
    driftX = (target.x / rect.width - .5) * 54;
    driftY = (target.y / rect.height - .5) * 34;
    flow.style.transform = `translate3d(${driftX}px,${driftY}px,0)`;
    if (!hero.classList.contains("hero-pointer-active")) hero.classList.add("hero-pointer-active");
  }
  const dt = Math.min((time - lastTime) / 16.67 || 1, 2);
  lastTime = time;
  let movement = 0;
  for (const axis of ["x", "y"]) {
    velocity[axis] += (target[axis] - point[axis]) * .1 * dt;
    velocity[axis] *= Math.pow(.6, dt);
    point[axis] += velocity[axis] * dt;
    movement += Math.abs(velocity[axis]) + Math.abs(target[axis] - point[axis]);
  }
  // Paint only the small spotlight, keeping its grid aligned to the page.
  const x = point.x - 195, y = point.y - 195;
  grid.style.transform = `translate3d(${x}px,${y}px,0)`;
  grid.style.backgroundPosition = `${-x}px ${-y}px`;
  frame = movement > .1 && allowed() ? requestAnimationFrame(render) : 0;
}
function reset(immediate = false) {
  pendingPointer = null;
  hero.classList.remove("hero-pointer-active");
  flow.style.transform = "translate3d(0,0,0)";
  cancelAnimationFrame(frame); frame = 0;
  if (immediate) initialized = false;
}
function sync() {
  hero.classList.toggle("hero-motion-paused", paused());
  if (!allowed()) reset(true);
}
listen(hero, "pointermove", event => {
  if (!allowed() || event.pointerType !== "mouse") return;
  pendingPointer = event;
  if (!frame) { lastTime = 0; frame = requestAnimationFrame(render); }
});
listen(hero, "pointerleave", () => reset());
listen(window, "blur", () => reset(true));
listen(window, "optimus:motion", sync);
listen(document, "visibilitychange", sync);
listen(reduced, "change", sync);
listen(fine, "change", sync);
const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
observer.observe(light);
// Tiny magnetic offsets preserve a stable, generous hit target.
const primary = hero.querySelector(".hero-actions .button-blue");
const restoreButton = () => gsap.to(primary, { x: 0, y: 0, duration: reduced.matches ? 0 : .35, ease: "power3.out", overwrite: true, clearProps: "transform" });
listen(primary, "pointermove", event => {
  if (!allowed() || event.pointerType !== "mouse") return;
  const rect = primary.getBoundingClientRect();
  gsap.to(primary, { x: (event.clientX - rect.left - rect.width / 2) * .035, y: (event.clientY - rect.top - rect.height / 2) * .07, duration: .25, ease: "power3.out", overwrite: true });
});
listen(primary, "pointerleave", restoreButton);
listen(primary, "blur", restoreButton);
listen(primary, "click", restoreButton);
listen(window, "optimus:motion", restoreButton);
listen(reduced, "change", restoreButton);
sync();
if (import.meta.hot) import.meta.hot.dispose(() => {
  reset(true); observer.disconnect(); lifecycle.abort(); gsap.killTweensOf(primary);
});
