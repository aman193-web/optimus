// A small dead band keeps trackpad settling near a boundary from reversing a
// particle morph. Deliberate movement in either direction still wins immediately.
export function chapterAt(progress, current, count, deadBand = .012) {
  const next = Math.min(count - 1, Math.max(0, Math.floor(progress * count)));
  if (current < 0 || next === current) return next;
  if (next > current && progress < (current + 1) / count + deadBand) return current;
  if (next < current && progress > current / count - deadBand) return current;
  return next;
}

export function chapterPosition(index, count) {
  // Land early in the selected chapter, leaving time to watch its morph and idle.
  return (Math.max(0, Math.min(count - 1, index)) + .2) / count;
}

// Native sticky positioning avoids switching between fixed and transformed
// coordinates at pin boundaries. ScrollTrigger only observes the scroll range.
export function createStickyStage(element, top, distance, onResize) {
  const wrapper = document.createElement("div");
  wrapper.className = "scroll-stage";
  wrapper.style.marginTop = getComputedStyle(element).marginTop;
  element.before(wrapper);
  wrapper.append(element);
  element.classList.add("scroll-stage-content");
  const measure = () => {
    wrapper.style.setProperty("--stage-top", `${top()}px`);
    wrapper.style.height = `${element.offsetHeight + distance()}px`;
  };
  measure();
  let width = element.offsetWidth, height = element.offsetHeight;
  const observer = new ResizeObserver(() => {
    const nextWidth = element.offsetWidth, nextHeight = element.offsetHeight;
    if (nextWidth === width && nextHeight === height) return;
    width = nextWidth;
    height = nextHeight;
    measure();
    onResize?.();
  });
  observer.observe(element);
  return {
    wrapper,
    measure,
    destroy() {
      observer.disconnect();
      wrapper.replaceWith(element);
      element.classList.remove("scroll-stage-content");
    },
  };
}
