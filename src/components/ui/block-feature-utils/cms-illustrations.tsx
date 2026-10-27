import { useState, type KeyboardEvent } from "react";
import {
  ArrowRight,
  Braces,
  FileText,
  Globe2,
  Layers3,
  Server,
  ShieldCheck,
} from "lucide-react";

export function OpenCoreGrid() {
  return (
    <div className="core-grid-illustration" aria-hidden="true">
      <div className="core-grid-cells">
        {Array.from({ length: 15 }, (_, index) => (
          <div key={index} className={index === 7 ? "core-grid-active" : ""}>
            {index === 7 ? (
              <Braces size={31} />
            ) : index === 2 || index === 12 ? (
              <span className="grid-node" />
            ) : null}
          </div>
        ))}
      </div>
      <span className="illustration-note">YOUR CODEBASE. YOURS FOREVER.</span>
    </div>
  );
}

const samples = [
  {
    name: "Home",
    title: "A home for your next big idea.",
    description: "A considered space for the stories you want to tell.",
  },
  {
    name: "Journal",
    title: "Ideas worth putting into words.",
    description: "Notes, perspectives, and a little room to explore.",
  },
  {
    name: "About",
    title: "The story behind the work.",
    description: "Introduce the people and purpose behind your website.",
  },
];
export function ContentWorkspace() {
  const [active, setActive] = useState(0);
  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % 3;
    else if (event.key === "ArrowLeft") next = (index + 2) % 3;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = 2;
    else return;
    event.preventDefault();
    setActive(next);
    event.currentTarget.parentElement
      ?.querySelectorAll<HTMLButtonElement>("button")
      [next]?.focus();
  }
  return (
    <div className="mini-workspace">
      <div className="mini-workspace-bar">
        <span className="mini-window-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>Sample content</span>
        <FileText size={13} aria-hidden="true" />
      </div>
      <div
        className="mini-document-tabs"
        role="tablist"
        aria-label="Explore illustrative content"
      >
        {samples.map((sample, index) => (
          <button
            key={sample.name}
            id={`mini-document-${index}`}
            role="tab"
            aria-selected={index === active}
            aria-controls="mini-document-panel"
            tabIndex={index === active ? 0 : -1}
            onClick={() => setActive(index)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {sample.name}
          </button>
        ))}
      </div>
      <div
        className="mini-document-panel"
        id="mini-document-panel"
        role="tabpanel"
        aria-labelledby={`mini-document-${active}`}
      >
        <span className="mini-document-eyebrow">YOUR NEXT CHAPTER</span>
        <strong>{samples[active].title}</strong>
        <p>{samples[active].description}</p>
      </div>
      <div className="mini-workspace-foot">
        <span className="mini-status-dot" />
        Illustrative workspace · try the tabs
      </div>
    </div>
  );
}

export function HostingOrbit() {
  return (
    <div className="hosting-orbit" aria-hidden="true">
      <svg viewBox="0 0 320 180" className="hosting-orbit-lines">
        <ellipse cx="160" cy="95" rx="126" ry="48" />
        <ellipse
          cx="160"
          cy="95"
          rx="126"
          ry="48"
          transform="rotate(-25 160 95)"
        />
      </svg>
      <div className="hosting-orbit-center">
        <Server size={34} strokeWidth={1.5} />
      </div>
      <span className="orbit-node orbit-node-content">
        <FileText size={20} />
      </span>
      <span className="orbit-node orbit-node-web">
        <Globe2 size={20} />
      </span>
      <span className="hosting-included">CMS + managed hosting</span>
    </div>
  );
}

export function SecurityLayers() {
  return (
    <div className="security-layers" aria-hidden="true">
      <div className="security-plane plane-back" />
      <div className="security-plane plane-middle" />
      <div className="security-plane plane-front">
        <ShieldCheck size={40} strokeWidth={1.4} />
      </div>
      <span className="security-label">CONSIDERED FROM THE START</span>
    </div>
  );
}

export function MigrationBelt() {
  return (
    <div className="migration-belt" aria-hidden="true">
      <svg viewBox="0 0 340 170">
        <path d="M 10 106 C 84 106 104 60 170 60 S 256 106 330 106" />
        <path
          className="migration-belt-track"
          d="M 10 106 C 84 106 104 60 170 60 S 256 106 330 106"
        />
      </svg>
      <span className="migration-source">W</span>
      <span className="migration-document">
        <FileText size={28} />
      </span>
      <span className="migration-destination">
        <span className="brand-mark" />
      </span>
      <span className="migration-free">WordPress data migration · Free</span>
    </div>
  );
}

export function PerformanceMotion() {
  return (
    <div className="performance-motion" aria-hidden="true">
      <span className="performance-orbit orbit-outer" />
      <span className="performance-orbit orbit-inner" />
      <span className="performance-trail trail-one" />
      <span className="performance-trail trail-two" />
      <span className="performance-object">
        <Layers3 size={30} strokeWidth={1.4} />
        <ArrowRight size={22} />
      </span>
      <span className="performance-note">
        FEWER DISTRACTIONS. MORE DIRECTION.
      </span>
    </div>
  );
}
