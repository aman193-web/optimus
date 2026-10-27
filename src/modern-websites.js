import { gsap } from "gsap";

const section = document.querySelector('#modern-websites');
const tabs = [...section.querySelectorAll('[data-mws]')];
const panel = section.querySelector('#mws-panel');
const figure = section.querySelector('.mws-figure');
const artLabel = section.querySelector('#mws-art-label');
const scenes = [...section.querySelectorAll('[data-mws-scene]')];
const link = panel.querySelector('a');
const lifecycle = new AbortController();
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const chapters = {
  content: {
    title: 'A home for what you have to say.',
    description: 'A focused CMS for your pages, stories, and ideas. Keep your attention on the content that makes your website yours.',
    label: 'Your content, connected.', link: 'Explore the essentials', href: '#features',
  },
  foundation: {
    title: 'Less to manage behind the scenes.',
    description: 'Managed hosting, ongoing CMS updates and security maintenance, together. We look after the system, so you can focus on your content.',
    label: 'One considered foundation.', link: 'Look inside the foundation', href: '#foundation',
  },
  freedom: {
    title: 'The whole codebase. Always yours.',
    description: 'Own, modify, move, reuse, and resell your code. One restriction: no service that directly competes with OptimusCMS.',
    label: 'Open Code. Complete ownership.', link: 'Explore your Open Code rights', href: '#open-code',
  },
};
const animated = [panel, artLabel];
const motionAllowed = () => !reducedMotion.matches && document.documentElement.dataset.motion !== 'paused';

function select(tab, animate = true) {
  if (tab.getAttribute('aria-selected') === 'true') return;
  const key = tab.dataset.mws;
  const chapter = chapters[key];
  tabs.forEach(item => {
    item.setAttribute('aria-selected', String(item === tab));
    item.tabIndex = item === tab ? 0 : -1;
  });
  panel.setAttribute('aria-labelledby', tab.id);
  panel.querySelector('h3').textContent = chapter.title;
  panel.querySelector('p').textContent = chapter.description;
  link.firstChild.textContent = `${chapter.link} `;
  link.setAttribute('href', chapter.href);
  artLabel.textContent = chapter.label;
  figure.dataset.focus = key;
  scenes.forEach(scene => {
    const active = scene.dataset.mwsScene === key;
    scene.classList.toggle('is-current', active);
    scene.setAttribute('aria-hidden', String(!active));
  });
  gsap.killTweensOf(animated);
  if (animate && motionAllowed()) {
    gsap.fromTo(animated, { opacity: .4, y: 6 }, {
      opacity: 1, y: 0, duration: .26, ease: 'power3.out',
      overwrite: true, clearProps: 'transform,opacity',
    });
  } else gsap.set(animated, { clearProps: 'transform,opacity' });
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => select(tab), { signal: lifecycle.signal });
  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
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
