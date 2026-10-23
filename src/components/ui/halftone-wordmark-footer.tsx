import * as React from "react";

// Original halftone engine supplied by the user: coverage-sized dots, spring
// repulsion, displacement color and click shock rings. Only the container,
// palette and motion/visibility lifecycle are adapted to the existing footer.
export function hwfHex(hex: string) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((hex || "").trim());
  if (!m) return null;
  const h =
    m[1].length === 3
      ? m[1]
          .split("")
          .map((c) => c + c)
          .join("")
      : m[1];
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** Dot radius for a cell coverage in [0, 1]: area-true, so tone stays even. */
export function hwfRadius(coverage: number, gap: number) {
  const c = coverage < 0 ? 0 : coverage > 1 ? 1 : coverage;
  return Math.sqrt(c) * gap * 0.56;
}

/**
 * One step of a dot's spring back to home, plus the push from a pointer at
 * (px, py) within radius r. Returns [x, y, vx, vy]. Away from the pointer a
 * displaced dot always heads home and comes to rest.
 */
export function hwfStep(
  x: number,
  y: number,
  vx: number,
  vy: number,
  hx: number,
  hy: number,
  px: number,
  py: number,
  r: number,
) {
  const dx = x - px;
  const dy = y - py;
  const d2 = dx * dx + dy * dy;
  if (r > 0 && d2 < r * r) {
    const d = Math.sqrt(d2) + 0.001;
    const f = (1 - d / r) * 2.6;
    vx += (dx / d) * f;
    vy += (dy / d) * f;
  }
  vx = (vx + (hx - x) * 0.05) * 0.84;
  vy = (vy + (hy - y) * 0.05) * 0.84;
  return [x + vx, y + vy, vx, vy];
}

/** How warm a dot is drawn: 0 at home, 1 once it is `span` px or more away. */
export function hwfWarmth(
  x: number,
  y: number,
  hx: number,
  hy: number,
  span: number,
) {
  const d = Math.hypot(x - hx, y - hy);
  return span > 0 ? Math.min(1, d / span) : 0;
}

/** Font size that sets `measured` (width at 100px) to fill `width` exactly. */
export function hwfFitSize(measured: number, width: number) {
  return measured > 0 ? (width / measured) * 100 : 0;
}

export default function HalftoneWordmarkFooter() {
  const wordmark = "optimus",
    dotGap = 6,
    radius = 80,
    crop = 0.17,
    grain = 0.5,
    interactive = true;
  const fontFamily =
    '"Inter Tight", "Inter Variable", "Inter", "Helvetica Neue", Arial, system-ui, sans-serif';
  const fontWeight = 800;
  const colors = { background: "#052f23", ink: "#d0ffc2", warm: "#efff00" };
  const rootRef = React.useRef(null as HTMLDivElement | null);
  const canvasRef = React.useRef(null as HTMLCanvasElement | null);
  const opts = React.useRef({
    colors,
    dotGap,
    radius,
    crop,
    grain,
    interactive,
    fontFamily,
    fontWeight,
    wordmark,
  });
  opts.current = {
    colors,
    dotGap,
    radius,
    crop,
    grain,
    interactive,
    fontFamily,
    fontWeight,
    wordmark,
  };
  const key = [
    wordmark,
    dotGap,
    crop,
    grain,
    fontFamily,
    fontWeight,
    colors.background,
    colors.ink,
    colors.warm,
  ].join("|");

  React.useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced =
      motionQuery.matches ||
      document.querySelector("#motion-toggle")?.getAttribute("aria-pressed") ===
        "true";
    let w = 0;
    let h = 0;
    let dpr = 1;
    let px = -1e5;
    let py = -1e5;
    let raf = 0;
    let visible = false;
    let awake = true;
    let ring = { x: 0, y: 0, t: -1 };
    // Flat arrays: x, y, vx, vy, hx, hy, r per dot.
    let dots = new Float32Array(0);
    let count = 0;
    let grainTile = null as HTMLCanvasElement | null;
    const ink = hwfHex(opts.current.colors.ink) || [233, 228, 218];
    const warm = hwfHex(opts.current.colors.warm) || [233, 118, 43];
    const palette = Array.from({length:17}, (_, index) => {
      const k = index / 16;
      return `rgb(${Math.round(ink[0] + (warm[0]-ink[0])*k)},${Math.round(ink[1] + (warm[1]-ink[1])*k)},${Math.round(ink[2] + (warm[2]-ink[2])*k)})`;
    });
    const scrolling = () => document.documentElement.dataset.scrolling === "true";

    const layout = () => {
      const o = opts.current;
      const rect = root.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);

      // Set the word once, at a size that fills the width, on a 1x mask.
      const mask = document.createElement("canvas");
      mask.width = w;
      mask.height = h;
      const m = mask.getContext("2d", { willReadFrequently: true });
      if (!m) return;
      const face = o.fontWeight + " 100px " + o.fontFamily;
      m.font = face;
      const word = o.wordmark || " ";
      const fit = hwfFitSize(m.measureText(word).width, w * 0.96);
      m.font = o.fontWeight + " " + fit + "px " + o.fontFamily;
      const box = m.measureText(word);
      const cap = box.actualBoundingBoxAscent || fit * 0.72;
      const c = Math.max(0, Math.min(0.6, o.crop));
      m.fillStyle = "#000";
      m.textBaseline = "alphabetic";
      m.fillText(
        word,
        (w - box.width) / 2,
        (h + cap - (box.actualBoundingBoxDescent || fit * 0.2)) / 2 + cap * c,
      );
      const img = m.getImageData(0, 0, w, h).data;

      const gap = Math.max(3, o.dotGap);
      const cols = Math.ceil(w / gap);
      const rows = Math.ceil(h / gap);
      const tmp = [];
      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          // Coverage: average alpha over a 3×3 sample of the cell.
          let sum = 0;
          for (let sy = 0; sy < 3; sy++) {
            for (let sx = 0; sx < 3; sx++) {
              const x = Math.min(
                w - 1,
                Math.floor(gx * gap + ((sx + 0.5) * gap) / 3),
              );
              const y = Math.min(
                h - 1,
                Math.floor(gy * gap + ((sy + 0.5) * gap) / 3),
              );
              sum += img[(y * w + x) * 4 + 3];
            }
          }
          const cov = sum / (9 * 255);
          if (cov < 0.06) continue;
          const hx = gx * gap + gap / 2;
          const hy = gy * gap + gap / 2;
          tmp.push(hx, hy, 0, 0, hx, hy, hwfRadius(cov, gap));
        }
      }
      dots = new Float32Array(tmp);
      count = tmp.length / 7;

      // A fixed tile of print grain, drawn once and laid over every frame.
      grainTile = document.createElement("canvas");
      grainTile.width = 256;
      grainTile.height = 256;
      const g = grainTile.getContext("2d");
      if (g) {
        const id = g.createImageData(256, 256);
        for (let i = 0; i < id.data.length; i += 4) {
          const v = Math.random() * 255;
          id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
          id.data[i + 3] = Math.random() < 0.5 ? 0 : 255;
        }
        g.putImageData(id, 0, 0);
      }
      awake = true;
    };

    const draw = (now: number) => {
      const o = opts.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = o.colors.background;
      ctx.fillRect(0, 0, w, h);

      const r = o.interactive && !reduced ? Math.max(0, o.radius) : 0;
      const ringAge = ring.t < 0 ? 1e9 : now - ring.t;
      const ringR = ringAge * 0.9;
      let moving = false;
      // Batch thousands of dots by shade instead of issuing one fill per dot.
      const paths = Array.from({length:17}, () => new Path2D());
      for (let i = 0; i < count; i++) {
        const j = i * 7;
        let x = dots[j];
        let y = dots[j + 1];
        let vx = dots[j + 2];
        let vy = dots[j + 3];
        const hx = dots[j + 4];
        const hy = dots[j + 5];
        if (!reduced) {
          if (ringAge < 900) {
            const dx = hx - ring.x;
            const dy = hy - ring.y;
            const d = Math.sqrt(dx * dx + dy * dy) + 0.001;
            const band = 1 - Math.min(1, Math.abs(d - ringR) / 26);
            if (band > 0) {
              const f = band * 3.2 * (1 - ringAge / 900);
              vx += (dx / d) * f;
              vy += (dy / d) * f;
            }
          }
          const s = hwfStep(x, y, vx, vy, hx, hy, px, py, r);
          x = s[0];
          y = s[1];
          vx = s[2];
          vy = s[3];
          if (
            Math.abs(vx) + Math.abs(vy) > 0.02 ||
            Math.abs(x - hx) + Math.abs(y - hy) > 0.05
          )
            moving = true;
          else {
            x = hx;
            y = hy;
            vx = 0;
            vy = 0;
          }
          dots[j] = x;
          dots[j + 1] = y;
          dots[j + 2] = vx;
          dots[j + 3] = vy;
        }
        const k = hwfWarmth(x, y, hx, hy, 28);
        const path = paths[Math.min(16, Math.max(0, Math.round(k * 16)))];
        path.moveTo(x + dots[j + 6], y);
        path.arc(x, y, dots[j + 6], 0, 6.2832);
      }
      paths.forEach((path, index) => {
        ctx.fillStyle = index ? palette[index] : o.colors.ink;
        ctx.fill(path);
      });

      if (grainTile && o.grain > 0) {
        ctx.globalAlpha = Math.min(1, o.grain) * 0.09;
        ctx.globalCompositeOperation = "overlay";
        const pattern = ctx.createPattern(grainTile, "repeat");
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, w, h);
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      }
      // Sleep once everything is home and nothing is pushing.
      awake = !reduced && (moving || ringAge < 900 || px > -1e4);
    };

    const loop = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      draw(now);
      if (awake) raf = requestAnimationFrame(loop);
    };
    const wake = () => {
      awake = true;
      if (!raf && visible && !document.hidden)
        raf = requestAnimationFrame(loop);
    };

    const toLocal = (e: PointerEv) => {
      const b = canvas.getBoundingClientRect();
      return [e.clientX - b.left, e.clientY - b.top];
    };
    const onMove = (e: PointerEv) => {
      if (!opts.current.interactive || reduced || scrolling() || e.pointerType === "touch")
        return;
      const p = toLocal(e);
      px = p[0];
      py = p[1];
      wake();
    };
    const onLeave = () => {
      px = -1e5;
      py = -1e5;
      wake();
    };
    const onDown = (e: PointerEv) => {
      if (!opts.current.interactive || reduced) return;
      if ((e.target as HTMLElement).closest("a,button")) return;
      const p = toLocal(e);
      ring = { x: p[0], y: p[1], t: performance.now() };
      wake();
    };

    layout();
    draw(performance.now());
    wake();

    const syncMotion = () => {
      reduced =
        motionQuery.matches ||
        document
          .querySelector("#motion-toggle")
          ?.getAttribute("aria-pressed") === "true";
      px = py = -1e5;
      ring.t = -1;
      for (let i = 0; i < count; i++) {
        const j = i * 7;
        dots[j] = dots[j + 4];
        dots[j + 1] = dots[j + 5];
        dots[j + 2] = dots[j + 3] = 0;
      }
      cancelAnimationFrame(raf);
      raf = 0;
      draw(performance.now());
      wake();
    };
    window.addEventListener("optimus:motion", syncMotion);
    const syncScroll = () => {
      if (scrolling()) {
        // Let displaced particles settle naturally instead of freezing mid-flight.
        px = py = -1e5;
        wake();
      }
    };
    window.addEventListener("optimus:scrollstate", syncScroll);
    motionQuery.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", syncMotion);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("pointerdown", onDown);
    const ro = new ResizeObserver(() => {
      layout();
      wake();
    });
    ro.observe(root);
    const io = new IntersectionObserver((entries) => {
      visible = entries[0] ? entries[0].isIntersecting : true;
      if (visible) wake();
    });
    io.observe(root);
    // A web font that lands late re-sets the word in its real face.
    let alive = true;
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (!alive) return;
        layout();
        wake();
      });
    }

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("optimus:motion", syncMotion);
      window.removeEventListener("optimus:scrollstate", syncScroll);
      motionQuery.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", syncMotion);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("pointerdown", onDown);
    };
  }, [key]);

  return (
    <div className="halftone-wordmark" ref={rootRef}>
      <canvas ref={canvasRef} aria-hidden="true" />
      <span className="sr-only">optimus</span>
    </div>
  );
}
type PointerEv = PointerEvent;
