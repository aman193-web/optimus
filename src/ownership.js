import { gsap } from "gsap";

const tabs = [...document.querySelectorAll('[data-ownership]')];
const panel = document.querySelector('#ownership-panel');
const title = document.querySelector('#ownership-title');
const description = document.querySelector('#ownership-description');
const assurance = document.querySelector('#ownership-assurance');
const artValue = document.querySelector('#ownership-art-value');
const artLabel = document.querySelector('#ownership-art-label');
const stamp = document.querySelector('#ownership-stamp');
const lifecycle = new AbortController();
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const rights = {
  own: {
    caption: 'OWNERSHIP, WITHOUT AN EXPIRY DATE',
    title: 'Yours today.\nYours for good.',
    description: 'You get 100% ownership of the codebase, at all times. Your code stays yours forever, whether you stay with OptimusCMS or take it elsewhere.',
    assurance: '100% codebase ownership. Always.',
    value: '100%', label: 'owned by you', stamp: 'YOURS. FOREVER.',
  },
  modify: {
    caption: 'ROOM TO MAKE IT YOUR OWN',
    title: 'Your vision.\nYour version.',
    description: 'Change the design, adapt the functionality, or build something completely your own. Modify and customize your codebase however you want.',
    assurance: 'Freedom to change every part of your code.',
    value: '{ you }', label: 'make it your own', stamp: 'BUILT YOUR WAY.',
  },
  move: {
    caption: 'A FOUNDATION THAT MOVES WITH YOU',
    title: 'Stay by choice.\nMove with freedom.',
    description: 'Managed hosting is included for convenience. Your codebase is portable: take it wherever you want, whenever you want. Your ownership goes with it.',
    assurance: 'Your codebase. Your choice of home.',
    value: 'anywhere', label: 'take your code with you', stamp: 'FREE TO MOVE.',
  },
  reuse: {
    caption: 'MORE POSSIBILITIES FOR WHAT YOU BUILD',
    title: 'Build it once.\nMake it go further.',
    description: 'Reuse your code in another project, customize it for a client, or resell what you build. Your work can become the starting point for what comes next.',
    assurance: 'Reuse, customize and resell your code.',
    value: 'yours +', label: 'build what comes next', stamp: 'REUSE. RESELL.',
  },
};
const animated = panel.querySelectorAll('.ownership-copy, .ownership-codecard, .ownership-stamp');
const motionAllowed = () => !reducedMotion.matches && document.documentElement.dataset.motion !== 'paused';
function select(tab, animate = true) {
  if (tab.getAttribute('aria-selected') === 'true') return;
  const key = tab.dataset.ownership;
  const right = rights[key];
  tabs.forEach(item => {
    item.setAttribute('aria-selected', String(item === tab));
    item.tabIndex = item === tab ? 0 : -1;
  });
  panel.setAttribute('aria-labelledby', tab.id);
  panel.dataset.right = key;
  panel.querySelector('.ownership-caption').textContent = right.caption;
  title.textContent = right.title;
  description.textContent = right.description;
  assurance.textContent = right.assurance;
  artValue.textContent = right.value;
  artLabel.textContent = right.label;
  stamp.textContent = right.stamp;
  gsap.killTweensOf(animated);
  if (animate && motionAllowed()) {
    gsap.fromTo(animated, { y: 8, opacity: .35 }, { y: 0, opacity: 1, duration: .28, stagger: .025, ease: 'power3.out', overwrite: true, clearProps: 'transform,opacity' });
  } else gsap.set(animated, { clearProps: 'transform,opacity' });
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => select(tab), { signal: lifecycle.signal });
  tab.addEventListener('keydown', event => {
    const key = event.key;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) return;
    event.preventDefault();
    const next = key === 'Home' ? 0 : key === 'End' ? tabs.length - 1 : (index + (key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    tabs[next].focus({ preventScroll: true });
    select(tabs[next], false);
  }, { signal: lifecycle.signal });
});
function settle() {
  if (!motionAllowed()) {
    gsap.killTweensOf(animated);
    gsap.set(animated, { clearProps: 'transform,opacity' });
  }
}
window.addEventListener('optimus:motion', settle, { signal: lifecycle.signal });
reducedMotion.addEventListener('change', settle, { signal: lifecycle.signal });
if (import.meta.hot) import.meta.hot.dispose(() => { lifecycle.abort(); gsap.killTweensOf(animated); });
