import type { Dot, OrbFrame } from "thinking-orbs/engine";

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => {
  const t = clamp(value);
  return t * t * t * (t * (t * 6 - 15) + 10);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const invisible = (dot: Dot): Dot => ({ ...dot, a: 0, r: 0 });

/** Pair spatial neighbors once, then move the same particles into the next shape.
 * Extra particles converge and dissolve, or emerge from an existing neighbor.
 * Exact endpoint frames keep the library's idle animation continuous. */
export function createOrbTransition(from: OrbFrame, to: OrbFrame, size: number) {
  const pairs: { from: Dot; to: Dot; delay: number }[] = [];
  const available = new Set(to.dots.map((_, index) => index));
  const closest = (dot: Dot, dots: Dot[], indices?: Set<number>) => {
    let best = -1;
    let distance = Infinity;
    for (const index of indices || dots.keys()) {
      const target = dots[index];
      const d = (dot.x - target.x) ** 2 + (dot.y - target.y) ** 2;
      if (d < distance) { best = index; distance = d; }
    }
    return best;
  };
  const add = (a: Dot, b: Dot) => {
    const angle = Math.atan2(a.y - size / 2, a.x - size / 2);
    pairs.push({ from: a, to: b, delay: ((angle + Math.PI) / (Math.PI * 2)) * 0.12 });
  };
  for (const dot of from.dots) {
    const index = closest(dot, to.dots, available.size ? available : undefined);
    const target = to.dots[index] || dot;
    add(dot, available.has(index) ? target : invisible(target));
    available.delete(index);
  }
  for (const index of available) {
    const target = to.dots[index];
    add(invisible(from.dots[closest(target, from.dots)] || target), target);
  }

  return (progress: number): OrbFrame => {
    if (progress <= 0) return from;
    if (progress >= 1) return to;
    const dots = pairs.map(({ from: a, to: b, delay }) => {
      const t = smooth((progress - delay) / (1 - delay));
      const dx = b.x - a.x, dy = b.y - a.y;
      const distance = Math.hypot(dx, dy) || 1;
      const arc = Math.sin(Math.PI * t) * Math.min(size * 0.045, distance * 0.18);
      return {
        x: mix(a.x, b.x, t) - dy / distance * arc,
        y: mix(a.y, b.y, t) + dx / distance * arc,
        z: mix(a.z, b.z, t),
        r: mix(a.r, b.r, t),
        white: mix(a.white, b.white, t),
        a: mix(a.a ?? 1, b.a ?? 1, t),
      };
    }).sort((a, b) => a.z - b.z);
    return {
      dots,
      lines: [
        ...from.lines.map(line => ({ ...line, a: (line.a ?? 1) * (1 - smooth(progress / 0.3)) })),
        ...to.lines.map(line => ({ ...line, a: (line.a ?? 1) * smooth((progress - 0.72) / 0.28) })),
      ],
    };
  };
}
