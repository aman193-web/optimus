import { useEffect, useRef, useState } from "react";
import { TypingAnimation } from "@/components/ui/typing-animation";

const phrases = [
  "Without the chaos.",
  "Built for speed.",
  "Secure at the core.",
  "Yours to own.",
];

function isMotionAllowed() {
  return (
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    document.getElementById("motion-toggle")?.getAttribute("aria-pressed") !==
      "true"
  );
}

export function HeroTyping() {
  const [motionAllowed, setMotionAllowed] = useState(isMotionAllowed);
  const [visible, setVisible] = useState(true);
  const [pageVisible, setPageVisible] = useState(!document.hidden);
  const sizerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setMotionAllowed(isMotionAllowed());
    const syncVisibility = () => setPageVisible(!document.hidden);
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );
    if (sizerRef.current) observer.observe(sizerRef.current);
    preference.addEventListener("change", syncMotion);
    window.addEventListener("optimus:motion", syncMotion);
    document.addEventListener("visibilitychange", syncVisibility);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", syncMotion);
      window.removeEventListener("optimus:motion", syncMotion);
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, []);

  return (
    <>
      {/* One reserved grid cell keeps both headline dimensions constant. */}
      <span ref={sizerRef} className="hero-typing-sizer">
        {phrases[0]}
        <span className="typing-animation-cursor">|</span>
      </span>
      {motionAllowed ? (
        <TypingAnimation
          className="hero-typing-text"
          words={phrases}
          typeSpeed={62}
          deleteSpeed={32}
          pauseDelay={3200}
          showCursor
          blinkCursor
          startWithFullText
          paused={!visible || !pageVisible}
          loop
        />
      ) : (
        <span className="hero-typing-text">
          {phrases[0]}
          <span className="typing-animation-cursor">|</span>
        </span>
      )}
    </>
  );
}
