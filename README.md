# OptimusCMS landing page

A responsive CMS landing page built with semantic HTML, custom CSS, vanilla JavaScript, GSAP, and React/TypeScript islands, served by Vite.

## Run

```sh
npm install
npm run dev
```

## Production

```sh
npm run build
npm run preview
```

Deploy the generated `dist/` directory to a static host.

## Design and behavior

- Forest green, pale sage, and yellow accents, with locally hosted DM Sans. Light and dark themes include an animated hero gradient, a pointer-revealed grid, and translucent navigation.
- Open Code leads the hero headline, with a quiet 7-day free offer beneath the actions. The Modern Website System (MWS, also Modern Websites) section combines a generated architectural image with keyboard-accessible content, foundation, and freedom tabs.
- The Open Code rights explorer uses four matching generated illustrations with a short crossfade on selection. The interactive footer wordmark reads “Optimus”; the product name elsewhere remains OptimusCMS.
- Spacious hero with Magic UI's typing animation: four CMS-oriented phrases, 3.2-second reading pauses, a baseline-aligned cursor with a soft fade during pauses, and a reserved text area to prevent layout shifts. The animated line is slightly larger and semibold, with a smaller size increase on mobile. The first phrase is visible immediately. A static heading remains available to assistive technology.
- Original architectural artwork and an interactive CMS concept: editable sample pages, a synchronized website preview, desktop/mobile preview controls, and reset.
- A mint/teal plugin-stack comparison, a six-card CMS feature section adapted from the supplied React component, a concise dark foundation section with contextual Libraries.dev orbs, migration disclosures, and a subscription timeline.
- GSAP entrance sequences, interaction transitions, and pointer-driven card glow/tilt. The CMS preview enlarges as it scrolls over the hero. Lenis smooths desktop wheel input on the GSAP clock; touch scrolling stays native. Pause Motion and reduced-motion preferences disable smoothing.
- A lightweight custom cursor uses a short glide, neon hover feedback, and precise click positioning. It sleeps when settled and falls back to native cursors for forms, dialogs, keyboard navigation, and reduced motion.
- The headline pauses off-screen and in background tabs; reduced-motion preferences and the shared motion toggle display static text. React, Motion, and GSAP are split into reusable production chunks.
- Responsive navigation, native FAQ disclosures, and a native modal dialog with focus restoration and inline form validation.
- Sample selection, view, device, comparison, feature, month, and expanded FAQ state are shareable via URL parameters. Edited sample copy stays in memory in the current tab and is never transmitted.
- Every page load starts in light mode; visitors can switch to dark mode.
- Open Code positioning: 100% codebase ownership, freedom to modify, portability, reuse and resale, with one restriction against building or operating a directly competing service using OptimusCMS or its derivatives.
- Pricing: first 7 days free, then $25.50/month through month six, then $49/month from month seven. Managed hosting and free WordPress data migration are included; design migration is quoted separately.
- Product mockups are explicitly illustrative, and do not specify unconfirmed product capabilities.

## Conversion integration

The primary “Join the waitlist” action opens a local form preview. No signup destination or backend is configured; submissions are not transmitted or stored. Connect a verified endpoint before accepting real signups. Separate project-planning actions generate a local text brief without sending data or creating an account or subscription.

## Project structure

- `index.html`: content, semantic sections, product concepts, and brief dialog.
- `src/style.css`: design tokens, responsive layouts, illustrations, and motion.
- `src/editorial.css`: the centered hero, teal comparison, connected-core section, and oversized footer.
- `src/components/ui/block-feature.tsx`: supplied React feature layout adapted to OptimusCMS.
- `src/components/ui/block-feature-utils/cms-illustrations.tsx`: original CMS illustrations and content tabs.
- `src/feature-entry.tsx`: mounts the feature and headline React islands.
- `src/components/foundation-orb.tsx`: responsive Libraries.dev canvas orbs with shared motion controls.
- `src/components/hero-typing.tsx`: headline phrases, visibility, and motion preferences.
- `src/components/ui/typing-animation.tsx`: installed Magic UI component with optional pause and initially complete text support.
- `src/feature-styles.css`: Tailwind utilities and feature component styling.
- `src/main.js`: interactive demos, URL state, GSAP motion, and local brief download.
- `src/card-effects.js`: pointer-only card glow/tilt with motion preferences and lifecycle cleanup.
- `src/smooth-scroll.js`: Lenis/GSAP integration, anchor navigation, native fallbacks, and dialog scroll locking.
- `src/snappy-cursor.js` and `src/snappy-cursor.css`: lightweight custom pointer and interaction feedback.
- `src/waitlist.js` and `src/waitlist.css`: local-only waitlist form preview.
- `src/hero-light.js`, `src/hero-stage.css`, and `src/theme.css`: hero lighting, pointer grid, and theme styling.
- `src/ownership.js` and `src/ownership.css`: accessible Open Code rights explorer with the original code card, orbit rings and stamps, pricing stage styling, and responsive brand refinements.
- `src/modern-websites.js` and `src/modern-websites.css`: MWS section with three responsive product concept scenes, accessible tabs, and bordered hero ownership/trial chips.
- `public/images/mws-editorial-cover-*.webp`: generated editorial cover artwork inside the Content concept scene, in 600px and 1200px versions. Design notes and prompt are documented in `docs/mws-product-scenes.md`. Earlier `mws-content`, `mws-foundation`, and `mws-freedom` sculpture assets are retained but unused.
- `public/images/modern-website-system*.webp` and `public/images/open-code-*.webp`: retained earlier illustration iterations; no longer shown in the MWS section. Original prompts remain in `docs/mws-image-prompt.md` and `docs/open-code-image-prompts.md`.
- `src/icons.js`: original SVG icons.
- `public/fonts/`: self-hosted fonts and their licenses.
- `public/favicon.svg`: OptimusCMS mark.
- `THIRD_PARTY_NOTICES.md`: component references and licenses.

## Design references

The revision follows Vercel Web Interface Guidelines and the official GSAP core, timeline, and ScrollTrigger skills. Magic UI's typing animation is installed through its shadcn registry; its hover-button pattern is adapted to the existing CSS. The supplied feature component and headline run as React islands. 21st.dev informed the interaction direction. Attribution is documented in `THIRD_PARTY_NOTICES.md`.

## React component setup

The project now includes React, TypeScript, Tailwind CSS via its Vite plugin, Lucide icons, and a shadcn-compatible `components.json`. The `@` alias resolves to `src/`, so reusable UI lives in `src/components/ui` and utilities in `src/lib`. This makes the supplied component imports work without moving the existing site into a different framework. Tailwind preflight is omitted to preserve the existing page styles.

The source snippet did not include its helper SVG components. Original CMS illustrations replace the framework and Figma assets. The `cn` helper uses `clsx` and `tailwind-merge`. No external stock images are needed.

Run `npm run typecheck` to validate TypeScript. `npm run build` includes this check.
