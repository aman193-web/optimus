import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  OpenCoreGrid,
  ContentWorkspace,
  HostingOrbit,
  SecurityLayers,
  MigrationBelt,
  PerformanceMotion,
} from "@/components/ui/block-feature-utils/cms-illustrations";

type FoundationTopic = "performance" | "security" | "growth" | "open";
function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "cms-feature-card relative flex min-w-0 flex-col overflow-hidden rounded-[20px] border border-solid border-[#d9e8e0] bg-white",
        className,
      )}
    >
      {children}
    </article>
  );
}
function Title({ children }: { children: ReactNode }) {
  return <h3 className="cms-card-title">{children}</h3>;
}
function FeatureLink({
  children,
  topic,
  href = "#foundation",
}: {
  children: ReactNode;
  topic?: FoundationTopic;
  href?: string;
}) {
  return (
    <a
      className="cms-card-link"
      href={href}
      onClick={() => {
        if (topic)
          window.dispatchEvent(
            new CustomEvent("optimus:feature", { detail: topic }),
          );
      }}
    >
      {children}
      <ArrowUpRight size={17} aria-hidden="true" />
    </a>
  );
}
export default function Feature() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    window.dispatchEvent(new Event("optimus:layout"));
    const element = root.current;
    if (!element) return;
    const syncVisibility = () => {
      element.dataset.pageVisible = String(!document.hidden);
    };
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    const revealed = new WeakSet<Element>();
    const cards = [
      ...element.querySelectorAll<HTMLElement>(".cms-feature-card"),
    ];
    const settle = () => {
      gsap.killTweensOf(cards);
      gsap.set(cards, { clearProps: "transform,opacity,visibility" });
    };
    window.addEventListener("optimus:motion", settle);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          (entry.target as HTMLElement).dataset.inView = String(
            entry.isIntersecting,
          );
          if (entry.isIntersecting && !revealed.has(entry.target)) {
            revealed.add(entry.target);
            if (
              !matchMedia("(prefers-reduced-motion: reduce)").matches &&
              document.documentElement.dataset.motion === "enabled"
            ) {
              const columns =
                innerWidth >= 1024 ? 3 : innerWidth >= 768 ? 2 : 1;
              const index = cards.indexOf(entry.target as HTMLElement);
              gsap.fromTo(
                entry.target,
                { y: 18, autoAlpha: 0 },
                {
                  y: 0,
                  autoAlpha: 1,
                  duration: 0.5,
                  delay: (index % columns) * 0.07,
                  ease: "power2.out",
                  clearProps: "transform,opacity,visibility",
                },
              );
            }
          }
        });
      },
      { threshold: 0.15 },
    );
    element
      .querySelectorAll(".cms-feature-card")
      .forEach((card) => observer.observe(card));
    return () => {
      observer.disconnect();
      settle();
      window.removeEventListener("optimus:motion", settle);
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, []);
  return (
    <div ref={root} className="cms-feature-rows cms-feature-grid">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <Card className="open-core-card">
          <div className="cms-card-heading">
            <span className="cms-card-kicker">OPEN CODE</span>
            <Title>
              100% your code.
              <br />
              Yours for good.
            </Title>
          </div>
          <OpenCoreGrid />
          <FeatureLink href="#open-code">Explore your ownership rights</FeatureLink>
        </Card>
        <Card className="content-workspace-card">
          <div className="cms-card-heading">
            <span className="cms-card-kicker">A SIMPLER CMS</span>
            <Title>
              Your content,
              <br />
              front and center.
            </Title>
          </div>
          <ContentWorkspace />
        </Card>
        <Card className="hosting-card">
          <HostingOrbit />
          <div className="cms-card-heading">
            <span className="cms-card-kicker">MANAGED HOSTING</span>
            <Title>
              A home for your website.
              <br />
              Hosting included.
            </Title>
          </div>
          <FeatureLink href="#pricing">See the managed plan</FeatureLink>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <Card className="security-card">
          <div className="cms-card-heading">
            <span className="cms-card-kicker">SECURITY</span>
            <Title>
              Security, considered.
              <br />
              From the foundation up.
            </Title>
          </div>
          <SecurityLayers />
          <FeatureLink topic="security">Inside the architecture</FeatureLink>
        </Card>
        <Card className="performance-card">
          <div className="cms-card-heading">
            <span className="cms-card-kicker">PERFORMANCE</span>
            <Title>
              A lighter starting point.
              <br />A clearer way forward.
            </Title>
          </div>
          <PerformanceMotion />
          <FeatureLink topic="performance">
            A performance-focused approach
          </FeatureLink>
        </Card>
        <Card className="migration-card">
          <MigrationBelt />
          <div className="cms-card-heading">
            <span className="cms-card-kicker">WORDPRESS MIGRATION</span>
            <Title>
              A new chapter.
              <br />
              Bring your content.
            </Title>
          </div>
          <FeatureLink href="#migration">
            Free data migration details
          </FeatureLink>
        </Card>
      </div>
    </div>
  );
}
