"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { BackgroundLayer } from "@/components/BackgroundLayer";
import { ForegroundLayer } from "@/components/ForegroundLayer";
import { useHeroLoadPhase } from "@/hooks/useHeroLoadPhase";
import type { FloatingImageConfig } from "@/types/floatingImage";

type HeroProps = {
  floatingImages: FloatingImageConfig[];
  children?: ReactNode;
};

export default function Hero({ floatingImages, children }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { phase, completeFocusSequence } = useHeroLoadPhase();

  // The hero's parallax canvas and every floating image each run their own
  // requestAnimationFrame loop for as long as they're mounted — with a
  // dozen-odd images that's a lot of continuous per-frame transform writes
  // competing with scroll on weaker devices (this is what made scrolling
  // feel stuck/non-smooth on Android). None of it is visible once the user
  // has scrolled well past the hero, so pause it there via IntersectionObserver
  // rather than gating on scroll position math.
  const [isNearViewport, setIsNearViewport] = useState(true);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsNearViewport(entry.isIntersecting),
      { rootMargin: "50% 0px 50% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-dvh flex-col overflow-hidden bg-blue"
    >
      <BackgroundLayer
        containerRef={sectionRef}
        floatingImages={floatingImages}
        loadPhase={phase}
        onFocusSequenceComplete={completeFocusSequence}
        active={isNearViewport}
      />
      <div className="h-[calc(0.9rem+3rem+0.9rem+1px)] shrink-0" aria-hidden />
      <div className="pointer-events-none relative z-10 flex flex-1 flex-col">
        <div className="flex-[0.9]" aria-hidden />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center gap-6 px-6 text-center sm:px-8 lg:px-12">
          {children}
          <ForegroundLayer />
        </div>
        <div className="flex-[1.1]" aria-hidden />
      </div>
    </section>
  );
}
