import { createRoot } from "react-dom/client";
import Feature from "@/components/ui/block-feature";
import { HeroTyping } from "@/components/hero-typing";
import { FoundationOrb } from "@/components/foundation-orb";
import HalftoneWordmarkFooter from "@/components/ui/halftone-wordmark-footer";
import "./feature-styles.css";

const islands = [
  { id: "footer-wordmark-root", component: <HalftoneWordmarkFooter /> },
  { id: "cms-feature-root", component: <Feature /> },
  { id: "hero-typing-root", component: <HeroTyping /> },
  { id: "foundation-orb-root", component: <FoundationOrb /> },
];
for (const { id, component } of islands) {
  const container = document.getElementById(id);
  if (container) {
    const root = createRoot(container);
    root.render(component);
    if (import.meta.hot) import.meta.hot.dispose(() => root.unmount());
  }
}
