import { useEffect, useRef, useState } from "react";
import { MODE_FRAMES, paintFrame, resolvePreset, type OrbFrame, type OrbState } from "thinking-orbs/engine";
import { createOrbTransition } from "./orb-transition";

const modes: Record<string, { state: OrbState; label: string }> = {
  performance: { state: "working", label: "A lighter foundation" },
  security: { state: "breathing", label: "Updates and security, taken care of" },
  growth: { state: "connecting", label: "Content, connected" },
  open: { state: "weaving", label: "Open at the core" },
};

export function FoundationOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [feature, setFeature] = useState(
    () =>
      document.getElementById("foundation-orb-root")?.dataset.feature ||
      "performance",
  );
  const mode = modes[feature] || modes.performance;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let activeFeature = document.getElementById("foundation-orb-root")?.dataset.feature || "performance";
    let preset = resolvePreset((modes[activeFeature] || modes.performance).state, 64);
    let size = 360, frame = 0, visible = false, time = 0.6, previous = 0;
    let transition: ReturnType<typeof createOrbTransition> | null = null;
    let elapsed = 0;
    let rendered: OrbFrame = MODE_FRAMES[preset.mode](size, time, preset.opts);
    const duration = 1.15;
    const motionEnabled = () =>
      !reduced.matches &&
      document.getElementById("motion-toggle")?.getAttribute("aria-pressed") !== "true";
    const canAnimate = () => visible && !document.hidden && motionEnabled();
    const allowed = canAnimate;
    const geometry = () => MODE_FRAMES[preset.mode](size, time, preset.opts);
    const draw = () => {
      rendered = transition ? transition(elapsed / duration) : geometry();
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      paintFrame(ctx, rendered, true);
      const state = transition ? "morphing" : "idle";
      if (canvas.dataset.transition !== state) canvas.dataset.transition = state;
    };
    const tick = (now: number) => {
      if (!allowed()) return;
      const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
      previous = now;
      if (transition) {
        elapsed += delta;
        if (elapsed >= duration) transition = null;
      } else {
        time += delta * preset.speed * 0.45;
      }
      draw();
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      previous = 0;
      if (!motionEnabled()) transition = null;
      draw();
      if (allowed()) frame = requestAnimationFrame(tick);
    };
    const changeFeature = (event: Event) => {
      const next = (event as CustomEvent<string>).detail;
      if (!modes[next] || next === activeFeature) return;
      activeFeature = next;
      setFeature(next);
      preset = resolvePreset(modes[next].state, 64);
      // Snapshot the currently rendered particles, including an interrupted morph.
      // Hold the destination's phase during travel, then resume its idle motion.
      const destination = geometry();
      transition = canAnimate() ? createOrbTransition(rendered, destination, size) : null;
      elapsed = 0;
      sync();
    };
    const resize = new ResizeObserver(() => {
      const nextSize = canvas.getBoundingClientRect().width;
      const nextPixels = Math.round(nextSize * Math.min(devicePixelRatio || 1, 1.5));
      if (!nextSize || (canvas.width === nextPixels && Math.abs(size - nextSize) < .5)) return;
      size = nextSize;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      transition = null;
      sync();
    });
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    resize.observe(canvas);
    observer.observe(canvas);
    window.addEventListener("optimus:orb", changeFeature);
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("optimus:motion", sync);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      observer.disconnect();
      window.removeEventListener("optimus:orb", changeFeature);
      reduced.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("optimus:motion", sync);
    };
  }, []);

  return (
    <div className="foundation-orb" data-orb-state={mode.state}>
      <div className="foundation-orb-stage">
        <canvas ref={canvasRef} aria-hidden="true" />
        <span className="foundation-orb-core" aria-hidden="true">
          <span className="brand-mark" />
        </span>
      </div>
      <p>{mode.label}</p>
    </div>
  );
}
