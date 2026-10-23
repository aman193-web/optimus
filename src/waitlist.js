import { gsap } from "gsap";
const dialog = document.querySelector('#waitlist-dialog');
const modal = dialog.querySelector('.waitlist-modal');
const form = dialog.querySelector('form');
const email = form.elements.email;
const error = dialog.querySelector('.waitlist-error');
const result = dialog.querySelector('.waitlist-result');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const lifecycle = new AbortController();
const listen = (el, event, fn) => el.addEventListener(event, fn, { signal:lifecycle.signal });
const motion = () => !reduced.matches && document.documentElement.dataset.motion !== 'paused';
let trigger;
function clearError() { email.removeAttribute('aria-invalid'); error.textContent = ''; }
function close() { dialog.close(); }
document.querySelectorAll('[data-open-waitlist]').forEach(button => listen(button, 'click', () => {
  trigger = button;
  form.reset(); clearError(); form.hidden = false; result.hidden = true;
  dialog.showModal(); document.body.classList.add('dialog-open');
  dialog.querySelector('.waitlist-close').focus({preventScroll:true});
  if (motion()) gsap.fromTo(modal,{ y:16, opacity:0, scale:.98 },{ y:0, opacity:1, scale:1, duration:.4, ease:'power3.out', overwrite:true, clearProps:'transform,opacity' });
}));
listen(dialog.querySelector('.waitlist-close'),'click',close);
listen(dialog.querySelector('[data-waitlist-done]'),'click',close);
listen(dialog,'click',event => {
  if(event.target !== dialog) return;
  const r = dialog.getBoundingClientRect();
  if(event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) close();
});
listen(dialog,'close',() => {
  document.body.classList.remove('dialog-open');
  gsap.killTweensOf([modal,result]);
  form.reset(); clearError();
  trigger?.focus({preventScroll:true});
});
listen(email,'input',clearError);
listen(form,'submit',event => {
  event.preventDefault();
  email.value = email.value.trim();
  if(!email.validity.valid) {
    email.setAttribute('aria-invalid','true');
    error.textContent = email.validity.valueMissing ? 'Please enter your email address.' : 'Enter a valid email address, like you@example.com.';
    email.focus(); return;
  }
  // No destination is configured. This is deliberately a local form preview:
  // no fetch, analytics payload, browser storage, or false signup confirmation.
  form.hidden = true; result.hidden = false; form.reset();
  result.focus({preventScroll:true});
  if(motion()) gsap.fromTo(result,{y:10,opacity:0},{y:0,opacity:1,duration:.35,ease:'power3.out',clearProps:'transform,opacity'});
});
listen(window,'optimus:motion',() => {
  if(!motion()) { gsap.killTweensOf([modal,result]); gsap.set([modal,result],{clearProps:'transform,opacity'}); }
});
if(import.meta.hot) import.meta.hot.dispose(() => { if(dialog.open) close(); lifecycle.abort(); gsap.killTweensOf([modal,result]); });
