import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let activeScroller;

// Chapter navigation must cancel the same wheel tail that drives the page.
export function scrollToPosition(top) {
  if (activeScroller) activeScroller.scrollTo(top, { immediate: true });
  else window.scrollTo({ top, behavior: "instant" });
  ScrollTrigger.update();
}

export function setupSmoothScroll() {
  const lifecycle = new AbortController();
  const root = document.documentElement;
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const dialogs = [...document.querySelectorAll("dialog")];
  let lenis;
  const tick = (time) => lenis?.raf(time * 1000);
  const resize = () => lenis?.resize();
  const syncDialog = () => {
    if (!lenis) return;
    if (dialogs.some((dialog) => dialog.open)) lenis.stop();
    else lenis.start();
  };
  const sync = () => {
    const enabled = fine.matches && !reduced.matches && !document.hidden && root.dataset.motion !== "paused";
    if (!enabled) {
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = undefined;
      activeScroller = undefined;
      delete root.dataset.scrollEngine;
      return;
    }
    if (lenis) return;
    lenis = new Lenis({
      lerp: .18,
      smoothWheel: true,
      syncTouch: false,
      autoRaf: false,
      // Preserve native behavior for nested editors, dialogs and horizontal UI.
      prevent: (node) => node.matches("dialog, textarea, input, select, [contenteditable], [data-lenis-prevent]"),
      virtualScroll: ({ event }) => !event.ctrlKey && !event.metaKey && !event.shiftKey,
    });
    activeScroller = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(tick);
    root.dataset.scrollEngine = "smooth";
    syncDialog();
  };
  // One clock for wheel motion and the scroll scenes; no second RAF loop.
  gsap.ticker.lagSmoothing(0);
  ScrollTrigger.addEventListener("refresh", resize);
  const listen = (target, name, handler) => target.addEventListener(name, handler, { signal: lifecycle.signal });
  listen(fine, "change", sync);
  listen(reduced, "change", sync);
  listen(window, "optimus:motion", sync);
  listen(document, "visibilitychange", sync);
  listen(document, "keydown", (event) => {
    if (!lenis || !["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) return;
    if (event.target instanceof Element && event.target.closest("input, textarea, select, [contenteditable], dialog")) return;
    // Stop any wheel tail before the browser handles a keyboard scroll.
    lenis.scrollTo(window.scrollY, { immediate: true });
  });
  const modalObserver = new MutationObserver(syncDialog);
  dialogs.forEach((dialog) => modalObserver.observe(dialog, { attributes: true, attributeFilter: ["open"] }));
  listen(document, "click", (event) => {
    const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!lenis || !link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !link.getAttribute("href").includes("#")) return;
    let target;
    try { target = url.hash ? document.getElementById(decodeURIComponent(url.hash.slice(1))) : document.body; } catch { return; }
    if (!target) return;
    event.preventDefault();
    // Focus/scrollIntoView can move native scroll before its event reaches Lenis.
    // Synchronize first so anchor geometry uses the current viewport position.
    lenis.scrollTo(window.scrollY, { immediate: true });
    history.pushState(null, "", url);
    lenis.scrollTo(target === document.body ? 0 : target, {
      immediate: event.detail === 0,
      onComplete: () => {
        if (event.detail !== 0) return;
        const temporary = !target.hasAttribute("tabindex");
        if (temporary) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
        if (temporary) target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
      },
    });
  });
  sync();
  return () => {
    lifecycle.abort();
    modalObserver.disconnect();
    ScrollTrigger.removeEventListener("refresh", resize);
    gsap.ticker.remove(tick);
    lenis?.destroy();
    activeScroller = undefined;
    delete root.dataset.scrollEngine;
  };
}
