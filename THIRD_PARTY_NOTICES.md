# Third-party notices and design references

## Magic UI

The expanding hover treatment in `src/style.css` adapts the Magic UI Hover Button pattern for a vanilla HTML/CSS/JavaScript project.

`src/components/ui/typing-animation.tsx` is installed from the official `@magicui/typing-animation` shadcn registry. Local optional `paused` and `startWithFullText` props preserve the component's original API while supporting page visibility, reduced motion, and an immediately readable hero.

- Project: https://github.com/magicuidesign/magicui
- Hover Button: https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/hover-button.tsx
- Typing Animation: https://magicui.design/docs/components/typing-animation
- License: MIT, copyright Magic UI. Full notice: `public/licenses/magic-ui.txt` (included in the production build).

The typing component is vendored source, with the `motion` package installed as its dependency.

## GSAP

GSAP and ScrollTrigger are installed through the official `gsap` npm package. The package's standard license and source copyright notices remain applicable; see https://gsap.com/standard-license/. Official usage guidance: https://github.com/greensock/gsap-skills.

## Reference material

- Vercel Web Design Guidelines skill: https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines
- Vercel Web Interface Guidelines: https://github.com/vercel-labs/web-interface-guidelines
- 21st.dev community: https://21st.dev/community/components (interaction/composition reference; no component source copied).

## Fonts

Locally hosted font files retain their accompanying licenses in `public/fonts/`.

## Lenis

Desktop wheel smoothing uses Lenis by darkroom.engineering, installed from the official npm package and integrated with GSAP's ticker. Source: https://github.com/darkroomengineering/lenis. MIT license; full notice included in `public/licenses/lenis.txt`.

## User-supplied React component

The six-card layout in `src/components/ui/block-feature.tsx` adapts the `block-feature.tsx` snippet supplied in this conversation. CMS copy and helper illustrations were created for Optimus. React, Tailwind CSS, Lucide, clsx, and tailwind-merge retain their package licenses.

## Libraries.dev — Thinking Orbs

The foundation illustrations use the public `MODE_DRAWS` engine and presets from `thinking-orbs` (Jakub Antalik), adapted to a responsive canvas and the site's shared motion controls. Source: https://github.com/Jakubantalik/Libraries.dev/tree/main/packages/thinking-orbs. MIT license; full notice included in `public/licenses/thinking-orbs.txt`.

## Inter Tight

Inter Tight, weight 800, is self-hosted for the footer wordmark. Obtained from Google Fonts; distributed under the SIL Open Font License 1.1. See `public/fonts/Inter-Tight-LICENSE.txt`.
