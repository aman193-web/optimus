import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { icon, mountIcons } from "./icons.js";
import { setupSmoothScroll, scrollToPosition } from "./smooth-scroll.js";
import { chapterAt, chapterPosition, createStickyStage } from "./scroll-chapters.js";
import "./motion-budget.js";
import "./snappy-cursor.js";
import "./card-effects.js";
import "./hero-light.js";
import "./theme.js";
import "./waitlist.js";
import "./ownership.js";
import "./modern-websites.js";
import "./mobile.css";

gsap.registerPlugin(ScrollTrigger);
const disposeSmoothScroll = setupSmoothScroll();
// Coalesce layout changes and let ScrollTrigger refresh safely after scrolling.
let refreshFrame = 0;
function requestScrollRefresh() {
  if (refreshFrame) return;
  refreshFrame = requestAnimationFrame(() => {
    refreshFrame = 0;
    ScrollTrigger.refresh(true);
  });
}
mountIcons();
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let motionPaused = false;
let motionContext;
const motionAllowed = () => !reducedMotion.matches && !motionPaused;
let keyboardInteraction = false;
const modalityLifecycle = new AbortController();
document.addEventListener(
  "keydown",
  () => {
    keyboardInteraction = true;
    document.documentElement.dataset.input = "keyboard";
  },
  { capture: true, signal: modalityLifecycle.signal },
);
document.addEventListener(
  "pointerdown",
  () => {
    keyboardInteraction = false;
    document.documentElement.dataset.input = "pointer";
  },
  { capture: true, signal: modalityLifecycle.signal },
);
const interactionMotionAllowed = () => motionAllowed() && !keyboardInteraction;
const initialParams = new URLSearchParams(location.search);

function updateParam(name, value) {
  const url = new URL(location.href);
  if (value === null) url.searchParams.delete(name);
  else url.searchParams.set(name, value);
  history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}
function announce(message) {
  const status = $("#demo-status");
  status.textContent = message;
  status.classList.add("visible");
  clearTimeout(announce.timeout);
  announce.timeout = setTimeout(() => status.classList.remove("visible"), 2600);
}

// Mobile navigation: native links, Escape, outside click, responsive cleanup.
const header = $(".site-header");
const menuButton = $(".menu-toggle");
const mobileNav = $("#mobile-nav");
function closeMenu(restoreFocus = false) {
  gsap.killTweensOf(mobileNav);
  gsap.set(mobileNav, { clearProps: "opacity,transform" });
  mobileNav.hidden = true;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");
  if (restoreFocus) menuButton.focus();
}
menuButton.addEventListener("click", () => {
  const open = mobileNav.hidden;
  gsap.killTweensOf(mobileNav);
  mobileNav.hidden = !open;
  if (open && interactionMotionAllowed()) {
    gsap.fromTo(
      mobileNav,
      { opacity: 0, y: -8 },
      {
        opacity: 1,
        y: 0,
        duration: 0.22,
        ease: "power2.out",
        clearProps: "opacity,transform",
      },
    );
  } else gsap.set(mobileNav, { clearProps: "opacity,transform" });
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation",
  );
});
$$("a", mobileNav).forEach((link) =>
  link.addEventListener("click", () => closeMenu()),
);
document.addEventListener("click", (event) => {
  if (!header.contains(event.target) && !mobileNav.hidden) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !mobileNav.hidden) closeMenu(true);
});
matchMedia("(min-width:901px)").addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});
let scrollTicking = false;
let scrollFrame = 0;
let maxScroll = 0;
let headerScrolled = header.classList.contains("scrolled");
const progressBar = $(".scroll-progress");
function updateScrollState() {
  const position = scrollY;
  const nextScrolled = position > 35;
  if (headerScrolled !== nextScrolled) {
    headerScrolled = nextScrolled;
    header.classList.toggle("scrolled", nextScrolled);
  }
  progressBar.style.transform = `scaleX(${maxScroll > 0 ? Math.min(1, Math.max(0, position / maxScroll)) : 0})`;
  scrollTicking = false;
}
function measureScrollRange() {
  // Layout reads happen only after document/viewport dimensions change.
  maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
  updateScrollState();
}
const scrollRangeObserver = new ResizeObserver(measureScrollRange);
scrollRangeObserver.observe(document.body);
ScrollTrigger.addEventListener("refresh", measureScrollRange);
addEventListener("resize", measureScrollRange, { passive: true, signal: modalityLifecycle.signal });
addEventListener("scroll", () => {
  if (!scrollTicking) {
    scrollFrame = requestAnimationFrame(updateScrollState);
    scrollTicking = true;
  }
}, { passive: true, signal: modalityLifecycle.signal });
measureScrollRange();

function wireTabs(tabs, activate, orientation = "horizontal") {
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activate(tab));
    tab.addEventListener("keydown", (event) => {
      const direction =
        typeof orientation === "function" ? orientation() : orientation;
      const nextKey = direction === "vertical" ? "ArrowDown" : "ArrowRight";
      const prevKey = direction === "vertical" ? "ArrowUp" : "ArrowLeft";
      let next;
      if (event.key === nextKey) next = (index + 1) % tabs.length;
      if (event.key === prevKey) next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      activate(tabs[next]);
      tabs[next].focus();
    });
  });
}
function selectTab(tabs, selected) {
  tabs.forEach((tab) => {
    const active = tab === selected;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
}

// Interactive publishing concept. Edits exist only in memory in this tab.
const samples = {
  home: {
    name: "Home",
    category: "IDEAS, GIVEN SPACE.",
    title: "Good ideas deserve a great home.",
    description:
      "A considered space for stories, perspectives, and the things we’re building next. Welcome to a clearer way forward.",
  },
  journal: {
    name: "Journal",
    category: "NOTES FROM THE STUDIO.",
    title: "A little less noise. A little more meaning.",
    description:
      "Thoughts on making things that matter. A collection of ideas, observations, and unfinished possibilities from our studio.",
  },
  about: {
    name: "About",
    category: "INDEPENDENT BY DESIGN.",
    title: "Small studio. Wide-open possibilities.",
    description:
      "We believe thoughtful work starts with a clear head. We’re an independent studio creating space for better ideas, one project at a time.",
  },
};
const documentTabs = $$('.document-tabs [role="tab"]');
const drafts = structuredClone(samples);
let activeDocument = "home";
function syncPreview() {
  const title = $("#demo-title").value.trim() || "Your next great idea.";
  const description =
    $("#demo-description").value.trim() ||
    "A little space for the story you want to tell.";
  $("#preview-title").textContent = title;
  $("#preview-description").textContent = description;
  $("#search-title").textContent = title;
  $("#search-description").textContent = description;
  $("#search-source").textContent = title;
  $("#growth-page-description").textContent = description;
  if (document.activeElement !== $("#growth-headline"))
    $("#growth-headline").value = $("#demo-title").value;
  if (document.activeElement !== $("#growth-summary"))
    $("#growth-summary").value = $("#demo-description").value;
  drafts[activeDocument].title = $("#demo-title").value;
  drafts[activeDocument].description = $("#demo-description").value;
}
function activateDocument(tab, writeUrl = true) {
  activeDocument = tab.dataset.document;
  const sample = drafts[activeDocument];
  selectTab(documentTabs, tab);
  $("#content-editor").setAttribute("aria-labelledby", tab.id);
  $("#document-name").textContent = sample.name;
  $("#preview-category").textContent = sample.category;
  $("#demo-title").value = sample.title;
  $("#demo-description").value = sample.description;
  syncPreview();
  if (writeUrl) updateParam("document", activeDocument);
  if (writeUrl && interactionMotionAllowed())
    gsap.fromTo(
      ".content-editor,.website-preview",
      { opacity: 0.5, y: 5 },
      {
        opacity: 1,
        y: 0,
        duration: 0.22,
        overwrite: true,
        clearProps: "transform,opacity",
      },
    );
}
wireTabs(documentTabs, activateDocument);
["#demo-title", "#demo-description"].forEach((selector) =>
  $(selector).addEventListener("input", syncPreview),
);
if (Object.hasOwn(samples, initialParams.get("document")))
  activateDocument(
    $(`[data-document="${initialParams.get("document")}"]`),
    false,
  );
function setView(view, writeUrl = true) {
  if (!["edit", "preview"].includes(view)) return;
  $(".editor-and-preview").dataset.view = view;
  $$(".view-switch button").forEach((button) =>
    button.setAttribute("aria-pressed", String(button.dataset.view === view)),
  );
  if (writeUrl) updateParam("view", view);
  requestScrollRefresh();
}
$$(".view-switch button").forEach((button) =>
  button.addEventListener("click", () => setView(button.dataset.view)),
);
if (initialParams.has("view")) setView(initialParams.get("view"), false);
function setDevice(device, writeUrl = true) {
  if (!["mobile", "desktop"].includes(device)) return;
  $(".website-preview").dataset.device = device;
  $$(".device-switch button").forEach((button) =>
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.device === device),
    ),
  );
  if (writeUrl) updateParam("device", device);
}
$$(".device-switch button").forEach((button) =>
  button.addEventListener("click", () => setDevice(button.dataset.device)),
);
if (initialParams.has("device")) setDevice(initialParams.get("device"), false);
$("#reset-demo").addEventListener("click", () => {
  Object.assign(drafts[activeDocument], samples[activeDocument]);
  activateDocument($(`[data-document="${activeDocument}"]`));
  announce("Sample content restored. Your preview is ready to explore.");
});

// The content journey uses the same local draft as the hero's CMS concept.
const growthTabs = $$("[data-growth]");
function selectGrowth(tab, focus = false) {
  selectTab(growthTabs, tab);
  $$(".growth-panel").forEach((panel) => {
    panel.hidden = panel.id !== tab.getAttribute("aria-controls");
  });
  $("#growth-step-count").textContent = `0${growthTabs.indexOf(tab) + 1} / 03`;
  if (focus) tab.focus({ preventScroll: true });
  if (interactionMotionAllowed())
    gsap.fromTo(
      `#${tab.getAttribute("aria-controls")}`,
      { opacity: 0.35, y: 8 },
      {
        opacity: 1,
        y: 0,
        duration: 0.22,
        ease: "power2.out",
        clearProps: "transform,opacity",
        overwrite: true,
      },
    );
}
const growthMobile = matchMedia("(max-width: 640px)");
const growthJourney = $(".growth-journey");
const growthNote = $(".growth-note");
function syncGrowthLayout() {
  if (growthMobile.matches) {
    $(".growth-studio").prepend(growthJourney);
    $(".growth-grid").append(growthNote);
  } else {
    $(".growth-copy").append(growthJourney, growthNote);
  }
  growthJourney.setAttribute("aria-orientation", growthMobile.matches ? "horizontal" : "vertical");
  requestScrollRefresh();
}
syncGrowthLayout();
growthMobile.addEventListener("change", syncGrowthLayout, { signal: modalityLifecycle.signal });
wireTabs(growthTabs, selectGrowth, () => growthMobile.matches ? "horizontal" : "vertical");
$$("[data-growth-next]").forEach((button) =>
  button.addEventListener("click", () => {
    // Keep focus in the same visual position on mobile when its current button hides.
    const tab = $(`[data-growth="${button.dataset.growthNext}"]`);
    selectGrowth(tab);
    $(`#${tab.getAttribute("aria-controls")} .growth-next`).focus({
      preventScroll: true,
    });
  }),
);
$("#growth-headline").addEventListener("input", (event) => {
  $("#demo-title").value = event.target.value;
  syncPreview();
});
$("#growth-summary").addEventListener("input", (event) => {
  $("#demo-description").value = event.target.value;
  syncPreview();
});

// Scroll-led comparison; manual controls always remain available.
const comparisonCopy = {
  traditional: {
    index: "THE BUILD-UP",
    title: "More moving parts. More to maintain.",
    description:
      "Separate tools mean separate updates, compatibility checks, and hosting decisions.",
  },
  optimus: {
    index: "THE RESET",
    title: "A foundation that fits together.",
    description:
      "Your Open Code CMS and managed hosting, together. Your codebase stays 100% yours.",
  },
};
let stackTransition;
function setStack(mode, writeUrl = true, animate = writeUrl) {
  if (!Object.hasOwn(comparisonCopy, mode)) return;
  const stage = $(".comparison-stage");
  const previous = stage.dataset.mode;
  const copy = comparisonCopy[mode];
  const outgoing = previous === "optimus" ? $(".unified-stack") : $(".traditional-stack");
  const incoming = mode === "optimus" ? $(".unified-stack") : $(".traditional-stack");
  const caption = $(".comparison-caption");
  stackTransition?.kill();
  const commit = () => {
    stage.dataset.mode = mode;
    $(".traditional-stack").hidden = mode !== "traditional";
    $(".optimus-stack").hidden = mode !== "optimus";
    $("#comparison-title").textContent = copy.title;
    $("#comparison-description").textContent = copy.description;
    $(".comparison-index").textContent = copy.index;
    gsap.set(".traditional-stack, .unified-stack, .comparison-caption", {
      clearProps: "transform,opacity",
    });
  };
  $$(".segmented-control button").forEach((button) =>
    button.setAttribute("aria-pressed", String(button.dataset.stack === mode)),
  );
  if (writeUrl) updateParam("stack", mode);
  if (!animate || !interactionMotionAllowed() || previous === mode) {
    commit();
    return;
  }
  // Keep the stage dimensions stable; let the old composition leave before
  // introducing the new one. Interruptions resume from the current visual state.
  stackTransition = gsap.timeline();
  stackTransition
    .to(outgoing, { y: -8, scale: .985, opacity: 0, duration: .18, ease: "power2.out" }, 0)
    .to(caption, { y: -5, opacity: 0, duration: .14, ease: "power2.out" }, 0)
    .add(commit)
    .fromTo(incoming,
      { y: 18, scale: .985, opacity: 0 },
      { y: 0, scale: 1, opacity: 1, duration: .6, ease: "power3.out", clearProps: "transform,opacity" })
    .fromTo(caption,
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: .42, ease: "power3.out", clearProps: "transform,opacity" }, "<.06");
}

$$(".segmented-control button").forEach((button) =>
  button.addEventListener("click", () => setStack(button.dataset.stack)),
);
// Every fresh visit introduces the problem first; tabs can still be selected directly.
setStack("traditional", false, false);

const featureData = {
  performance: {
    name: "Performance",
    index: "01 / 04",
    icon: "bolt",
    focus: "all",
    title: "Less overhead.\nMore possibility.",
    description:
      "A performance-focused CMS and managed hosting. A simpler foundation for your content.",
    link: "Explore the Plan",
    href: "#pricing",
  },
  security: {
    name: "Security",
    index: "02 / 04",
    icon: "shield",
    focus: "core",
    title: "Kept up to date.\nLooked after.",
    description:
      "We keep your managed CMS up to date with ongoing updates and security maintenance. More time for your content, less upkeep for you.",
    link: "See What’s Included",
    href: "#pricing",
  },
  growth: {
    name: "Growth",
    index: "03 / 04",
    icon: "globe",
    focus: "content",
    title: "Make room for\nyour next idea.",
    description:
      "Give your content, discoverability, and ongoing marketing work a clearer home.",
    link: "Explore Content & Growth",
    href: "#growth",
  },
  open: {
    name: "Open Code",
    index: "04 / 04",
    icon: "code",
    focus: "core",
    title: "Your code.\nYour possibilities.",
    description:
      "100% ownership, at all times. Modify, move, reuse and resell your code. One restriction: no directly competing service.",
    link: "Explore your Open Code rights",
    href: "#open-code",
  },
};
const featureTabs = $$('.foundation-tabs [role="tab"]');
const featureKeys = Object.keys(featureData);
let activeFeature = "performance";
let foundationScroll;
function activateFeature(tab, writeUrl = true, animate = writeUrl) {
  activeFeature = tab.dataset.feature;
  const feature = featureData[activeFeature];
  const index = featureKeys.indexOf(activeFeature);
  selectTab(featureTabs, tab);
  $("#feature-panel").setAttribute("aria-labelledby", tab.id);
  $("#feature-visual-number").textContent = feature.index;
  $("#foundation-progress").textContent = String(index + 1).padStart(2, "0");
  $("#feature-title").textContent = feature.title;
  $("#feature-description").textContent = feature.description;
  $("#feature-icon").innerHTML = icon(feature.icon);
  $("#feature-link").innerHTML = `${feature.link} ${icon("arrow")}`;
  $("#feature-link").href = feature.href;
  $(".foundation-visual").dataset.focus = feature.focus;
  $("#foundation-orb-root").dataset.feature = activeFeature;
  window.dispatchEvent(
    new CustomEvent("optimus:orb", { detail: activeFeature }),
  );
  const next = featureData[featureKeys[(index + 1) % featureKeys.length]];
  $("#next-feature").innerHTML = `Next: ${next.name} ${icon("arrow")}`;
  if (writeUrl) {
    updateParam("feature", activeFeature);
    foundationScroll?.select(index);
  }
  if (animate && interactionMotionAllowed()) {
    gsap.fromTo(
      ".foundation-copy",
      { y: 12, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.48,
        ease: "power3.out",
        overwrite: true,
        clearProps: "transform,opacity",
      },
    );
  }
}
const foundationDesktop = matchMedia("(min-width: 1100px)");
const syncFoundationOrientation = () =>
  $(".foundation-tabs").setAttribute(
    "aria-orientation",
    foundationDesktop.matches ? "vertical" : "horizontal",
  );
syncFoundationOrientation();
foundationDesktop.addEventListener("change", syncFoundationOrientation, {
  signal: modalityLifecycle.signal,
});
wireTabs(featureTabs, activateFeature, () =>
  foundationDesktop.matches ? "vertical" : "horizontal",
);
$("#next-feature").addEventListener("click", () =>
  activateFeature(
    featureTabs[(featureKeys.indexOf(activeFeature) + 1) % featureTabs.length],
  ),
);
const initialFeature = initialParams.get("feature");
activateFeature(
  Object.hasOwn(featureData, initialFeature)
    ? $(`[data-feature="${initialFeature}"]`)
    : featureTabs[0],
  false,
);

// The React feature cards select this shared foundation explorer.
window.addEventListener("optimus:feature", (event) => {
  if (
    typeof event.detail === "string" &&
    Object.hasOwn(featureData, event.detail)
  ) {
    activateFeature($(`[data-feature="${event.detail}"]`));
  }
});
window.addEventListener("optimus:layout", () => ScrollTrigger.refresh());

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});
function updatePrice(writeUrl = true) {
  const month = Number($("#month-range").value);
  const free = month === 0;
  const intro = !free && month <= 6;
  const price = free ? 0 : intro ? 25.5 : 49;
  const label = free ? "First 7 days" : month === 1 ? "Month 1 · after day 7" : `Month ${month}`;
  $("#month-output").textContent = label;
  $("#month-range").setAttribute(
    "aria-valuetext",
    `${label}: ${free ? "free" : `${currency.format(price)} per month`}`,
  );
  $("#calculator-period").textContent = free ? "YOUR FREE START" : intro
    ? "INTRODUCTORY PRICE"
    : "STANDARD MONTHLY PRICE";
  $("#calculator-price").textContent = free ? "$0" : currency.format(price);
  $("#calculator-unit").textContent = free ? "/first 7 days" : "/month";
  $("#calculator-explanation").textContent = free
    ? "Your first 7 days are completely free. Managed hosting included."
    : intro ? "$25.50/month after your free first week, through month 6."
    : "$49/month after 6 months. Your codebase remains 100% yours.";
  $$('[data-price-stage]').forEach(button => {
    button.setAttribute("aria-pressed", String(Number(button.dataset.priceStage) === (free ? 0 : intro ? 1 : 7)));
  });
  if (writeUrl) updateParam("month", String(month));
}
$("#month-range").addEventListener("input", () => updatePrice());
$$('[data-price-stage]').forEach(button => button.addEventListener("click", () => {
  $("#month-range").value = button.dataset.priceStage;
  updatePrice();
}));
const initialMonth = Number(initialParams.get("month"));
if (Number.isInteger(initialMonth) && initialMonth >= 0 && initialMonth <= 12)
  $("#month-range").value = initialMonth;
updatePrice(false);

// Retain native details semantics while animating both directions. Each toggle
// starts at the rendered height, so rapid clicks reverse without a jump.
const initialQuestion = Number(initialParams.get("question"));
$$(".faq-list details").forEach((detail, index) => {
  const summary = $("summary", detail);
  const answer = $(":scope > div", detail);
  let expanded = initialQuestion === index + 1;
  let animating = false;
  detail.open = expanded;
  detail.classList.toggle("is-expanded", expanded);

  const settle = () => {
    gsap.killTweensOf([detail, answer]);
    detail.open = expanded;
    animating = false;
    gsap.set(detail, { clearProps: "height,overflow" });
    gsap.set(answer, { clearProps: "opacity,transform" });
    requestScrollRefresh();
  };

  summary.addEventListener("click", (event) => {
    event.preventDefault();
    const height = detail.getBoundingClientRect().height;
    const wasOpen = detail.open;
    expanded = !expanded;
    detail.classList.toggle("is-expanded", expanded);
    if (expanded) updateParam("question", String(index + 1));
    else if (new URLSearchParams(location.search).get("question") === String(index + 1))
      updateParam("question", null);

    if (!interactionMotionAllowed() || event.detail === 0) {
      settle();
      return;
    }
    gsap.killTweensOf([detail, answer]);
    animating = true;
    detail.open = true;
    const border = parseFloat(getComputedStyle(detail).borderBottomWidth) || 0;
    const collapsedHeight = summary.getBoundingClientRect().height + border;
    const targetHeight = collapsedHeight + (expanded ? answer.offsetHeight : 0);
    gsap.set(detail, { height, overflow: "hidden" });
    if (!wasOpen) gsap.set(answer, { opacity: 0, y: -5 });
    gsap.to(answer, {
      opacity: expanded ? 1 : 0,
      y: expanded ? 0 : -5,
      duration: expanded ? 0.25 : 0.18,
      ease: "power2.out",
    });
    gsap.to(detail, {
      height: targetHeight,
      duration: expanded ? 0.38 : 0.28,
      ease: "power3.out",
      onComplete: settle,
    });
  }, { signal: modalityLifecycle.signal });
  window.addEventListener("optimus:motion", () => {
    if (animating) settle();
  }, { signal: modalityLifecycle.signal });
  window.addEventListener("resize", () => {
    if (animating) settle();
  }, { signal: modalityLifecycle.signal });
});

// Honest local action until a real signup or enquiry endpoint is supplied.
const dialog = $("#project-dialog");
const form = $("#project-form");
let dialogTrigger;
function updateBrief() {
  const type = $("#project-type").value;
  $("#migration-options").hidden = type === "new";
  if (type === "new") $("#design-migration").checked = false;
  $("#brief-migration-note").textContent =
    type === "wordpress"
      ? "WordPress data migration is free. Design migration is quoted separately."
      : type === "other"
        ? "Migration from another platform needs a separate scope review."
        : "A fresh foundation for your new website.";
  $("#form-status").textContent = "";
}
$$("[data-open-brief]").forEach((button) =>
  button.addEventListener("click", () => {
    dialogTrigger = button;
    $("#project-type").value = button.dataset.openBrief;
    updateBrief();
    if (button.dataset.briefDesign === "true")
      $("#design-migration").checked = true;
    closeMenu();
    dialog.showModal();
    document.body.classList.add("dialog-open");
    $(".dialog-close").focus({ preventScroll: true });
  }),
);
$(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  )
    dialog.close();
});
dialog.addEventListener("close", () => {
  document.body.classList.remove("dialog-open");
  dialogTrigger?.focus({ preventScroll: true });
});
$("#project-type").addEventListener("change", updateBrief);
$("#project-name").addEventListener("input", () => {
  $("#name-error").textContent = "";
  $("#project-name").removeAttribute("aria-invalid");
  $("#project-name").setCustomValidity("");
  $("#form-status").textContent = "";
});
$("#project-name").addEventListener("invalid", () => {
  $("#name-error").textContent = "Enter a project name to create your brief.";
  $("#project-name").setAttribute("aria-invalid", "true");
});
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = $("#project-name").value.trim();
  if (!name) {
    $("#name-error").textContent = "Enter a project name to create your brief.";
    $("#project-name").setAttribute("aria-invalid", "true");
    $("#project-name").focus();
    return;
  }
  const data = new FormData(form);
  const type = data.get("projectType");
  const labels = {
    new: "New website",
    wordpress: "Moving from WordPress",
    other: "Moving from another platform",
  };
  const brief = [
    "OPTIMUSCMS — YOUR PROJECT BRIEF",
    "",
    `Project: ${name}`,
    `Starting point: ${labels[type]}`,
    "",
    "YOUR MANAGED PLAN",
    "First 7 days: completely free.",
    "$25.50/month after the free period, through month six.",
    "$49/month from month seven onward.",
    "Managed hosting, ongoing CMS updates and security maintenance included.",
    "100% ownership of your codebase, at all times and forever.",
    "Modify, move, reuse, customize and resell your code.",
    "Only restriction: do not use OptimusCMS or its derivatives to build or operate a service that directly competes with OptimusCMS.",
    "",
    "YOUR MIGRATION",
    type === "wordpress"
      ? "WordPress data migration: Free."
      : type === "other"
        ? "Data migration: Scope and pricing need review for this platform."
        : "Data migration: Not requested.",
    data.get("designMigration")
      ? "Design migration: Separate quote requested."
      : "Design migration: Not requested; quoted separately if needed.",
    "",
    "NEXT STEP",
    "Share this brief with the OptimusCMS team to discuss your project and confirm scope.",
    "",
    "This is a local planning brief. No details have been sent,",
    "no account has been created, and no subscription has started.",
  ].join("\n");
  const url = URL.createObjectURL(
    new Blob([brief], { type: "text/plain;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "optimuscms-project-brief.txt";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $("#form-status").textContent =
    "Your brief is ready. Check your downloads for optimuscms-project-brief.txt.";
});

// Native scrolling reveals the problem before the solution. Pin only when the
// whole comparison fits comfortably; narrow/short screens keep normal flow.
function setupComparisonScroll() {
  const card = $(".stack-comparison");
  const pinned = innerWidth >= 900 && card.offsetHeight + 148 < innerHeight;
  card.classList.add("scroll-story");
  const distance = () => Math.max(900, innerHeight);
  const stage = pinned ? createStickyStage(card, () => 96, distance, requestScrollRefresh) : null;
  let chapter = -1;
  const trigger = ScrollTrigger.create({
    trigger: stage?.wrapper || card,
    start: pinned ? "top 96px" : "top 75%",
    end: pinned ? () => `+=${distance()}` : "bottom 75%",
    onRefreshInit: () => stage?.measure(),
    onUpdate: (self) => {
      const boundary = pinned ? .58 : .52;
      const next = self.progress > boundary + (chapter === 1 ? -.025 : .025) ? 1 : 0;
      if (next !== chapter) {
        chapter = next;
        setStack(next ? "optimus" : "traditional", false, self.isActive);
      }
    },
  });
  return () => {
    trigger.kill();
    stackTransition?.progress(1);
    stage?.destroy();
    card.classList.remove("scroll-story");
  };
}

// The portal rises over a stationary headline, then returns to normal flow.
function setupHeroStack() {
  const intro = $(".hero-intro");
  const portal = $(".workspace-perspective");
  const desktop = innerWidth >= 900 && innerHeight >= 760;
  const navHeight = () => $(".site-header").offsetHeight;
  $(".hero").classList.add("hero-scroll-stage");
  if (desktop) {
    ScrollTrigger.create({
      trigger: intro,
      start: () => `top ${navHeight()}px`,
      endTrigger: portal,
      end: () => `top ${navHeight() + 20}px`,
      pin: intro,
      pinSpacing: false,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        // Use the pin's cached geometry instead of forcing two layout reads
        // after ScrollTrigger has written transforms on every scroll frame.
        const covered = self.scroll() > self.start + 80;
        if (intro.inert !== covered) intro.inert = covered;
      },
    });
  }
  if (desktop)
    gsap.fromTo(
      intro,
      { opacity: 1 },
      {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: portal,
          start: "top 82%",
          end: "top 36%",
          scrub: true,
          invalidateOnRefresh: true,
        },
      },
    );
  gsap.fromTo(
    portal,
    { scale: desktop ? 0.9 : 0.97 },
    {
      scale: 1,
      ease: "none",
      scrollTrigger: {
        trigger: portal,
        start: "top 96%",
        end: () => `top ${navHeight() + 20}px`,
        scrub: true,
        invalidateOnRefresh: true,
      },
    },
  );
  return () => {
    intro.inert = false;
    $(".hero").classList.remove("hero-scroll-stage");
  };
}

// Four chapters share a stable stage while the user scrolls through them.
function setupFoundationScroll() {
  const explorer = $("#foundation > .container");
  const navHeight = () => $(".site-header").offsetHeight + 20;
  if (innerWidth < 1100) return;
  explorer.classList.add("foundation-scroll-story");
  if (explorer.offsetHeight + navHeight() + 24 >= innerHeight) {
    explorer.classList.remove("foundation-scroll-story");
    return;
  }
  const top = () => {
    const header = $(".site-header").offsetHeight;
    return Math.max(navHeight(), header + (innerHeight - explorer.offsetHeight - header) / 2);
  };
  // About one screen per orb: time to form the shape, then appreciate its motion.
  const distance = () => Math.max(680, innerHeight * .85) * featureKeys.length;
  const stage = createStickyStage(explorer, top, distance, requestScrollRefresh);
  let chapter = -1;
  const trigger = ScrollTrigger.create({
    trigger: stage.wrapper,
    start: () => `top ${top()}px`,
    end: () => `+=${distance()}`,
    onRefreshInit: stage.measure,
    onUpdate: (self) => {
      const next = chapterAt(self.progress, chapter, featureKeys.length);
      if (chapter !== next) {
        chapter = next;
        activateFeature(featureTabs[next], false, self.isActive);
      }
    },
  });
  const controller = {
    select(index) {
      const bounds = explorer.getBoundingClientRect();
      // A link elsewhere can select a feature without unexpectedly moving the page.
      if (bounds.bottom <= navHeight() || bounds.top >= innerHeight) return;
      chapter = index;
      scrollToPosition(trigger.start + (trigger.end - trigger.start) * chapterPosition(index, featureKeys.length));
    },
  };
  foundationScroll = controller;
  return () => {
    if (foundationScroll === controller) foundationScroll = undefined;
    trigger.kill();
    stage.destroy();
    explorer.classList.remove("foundation-scroll-story");
  };
}

// Timed entrances respect the shared motion preference.
function setupMotion() {
  document.documentElement.dataset.motion = motionAllowed()
    ? "enabled"
    : "paused";
  window.dispatchEvent(new Event("optimus:motion"));
  motionContext?.revert();
  motionContext = gsap.matchMedia();
  if (!motionAllowed()) {
    stackTransition?.progress(1).kill();
    return;
  }
  motionContext.add("(prefers-reduced-motion: no-preference)", () => {
    if (scrollY < 100) {
      const intro = gsap.timeline({
        defaults: { duration: 0.7, ease: "power3.out" },
      });
      intro
        .from(".hero-eyebrow", { y: 10, opacity: 0 })
        .from(".hero-line", { y: 16, opacity: 0, stagger: 0.08, clearProps: "transform,opacity" }, "-=.5")
        .from(
          ".hero-description,.hero-actions,.hero-price",
          { y: 13, opacity: 0, stagger: 0.08 },
          "-=.45",
        );
    }
    const heroMedia = gsap.matchMedia();
    heroMedia.add(
      {
        all: "(min-width: 0px)",
        desktop: "(min-width: 900px) and (min-height: 760px)",
      },
      setupHeroStack,
    );
    const comparisonMedia = gsap.matchMedia();
    comparisonMedia.add(
      {
        all: "(min-width: 0px)",
        wide: "(min-width: 900px)",
        tall: "(min-height: 760px)",
      },
      setupComparisonScroll,
    );
    const foundationMedia = gsap.matchMedia();
    foundationMedia.add(
      {
        all: "(min-width: 0px)",
        wide: "(min-width: 1100px)",
        tall: "(min-height: 760px)",
      },
      setupFoundationScroll,
    );
    // Reveal each question independently; disclosure height remains owned by its click animation.
    $$(".faq-list details").forEach((row) => {
      if (row.getBoundingClientRect().top < innerHeight) return;
      gsap.from(row, {
        y: 20, opacity: 0, duration: 0.55, ease: "power2.out",
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: row, start: "top 92%", once: true },
      });
    });
    $$(".reveal").forEach((element) => {
      if (element.getBoundingClientRect().top < innerHeight) return;
      gsap.from(element, {
        y: 24,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: element, start: "top 94%", once: true },
      });
    });
    return () => {
      comparisonMedia.revert();
      heroMedia.revert();
      foundationMedia.revert();
    };
  });
}
$("#motion-toggle").addEventListener("click", () => {
  motionPaused = !motionPaused;
  $("#motion-toggle").setAttribute("aria-pressed", String(motionPaused));
  $("#motion-toggle").innerHTML =
    `${motionPaused ? "Resume Motion" : "Pause Motion"} <span aria-hidden="true">${motionPaused ? "▶" : "Ⅱ"}</span>`;
  setupMotion();
  requestScrollRefresh();
});
reducedMotion.addEventListener("change", setupMotion);
setupMotion();
document.fonts.ready.then(() => {
  requestScrollRefresh();
});
$("#year").textContent = String(new Date().getFullYear());
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    disposeSmoothScroll();
    stackTransition?.kill();
    motionContext?.revert();
    cancelAnimationFrame(refreshFrame);
    cancelAnimationFrame(scrollFrame);
    scrollRangeObserver.disconnect();
    ScrollTrigger.removeEventListener("refresh", measureScrollRange);
    modalityLifecycle.abort();
  });
