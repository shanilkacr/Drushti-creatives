"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import type { FloatingImageConfig } from "@/types/floatingImage";
import { useAnimationFrame } from "@/hooks/useAnimationFrame";
import { EASE } from "@/lib/motion";

type FloatingImageProps = FloatingImageConfig & {
  visible?: boolean;
  /** Stops the idle float rAF loop (e.g. once the hero has scrolled out of
   *  view) without unmounting — every floating image otherwise keeps writing
   *  a transform every single frame for as long as the page is open, which
   *  competes with scroll on weaker/Android devices for no visible benefit
   *  once it's off-screen. */
  paused?: boolean;
  animateEntrance?: "full" | "fade" | "none";
  entranceDelay?: number;
  onLoadingComplete?: () => void;
};

export function FloatingImage({
  src,
  alt,
  speed,
  phase,
  amplitude,
  priority,
  href,
  sizes,
  className,
  linkClassName,
  visible = true,
  paused = false,
  animateEntrance = "none",
  entranceDelay = 0,
  onLoadingComplete,
}: FloatingImageProps) {
  const floatRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [revealed, setRevealed] = useState(() => animateEntrance === "none" && visible);

  useEffect(() => {
    if (!visible) return;
    if (animateEntrance === "none" || loaded) {
      setRevealed(true);
    }
  }, [visible, loaded, animateEntrance]);

  useAnimationFrame((time) => {
    if (!visible || paused) return;
    const el = floatRef.current;
    if (!el) return;
    const t = time / 1000;
    const floatY = Math.sin((t / speed) * Math.PI * 2 + phase) * amplitude;
    el.style.transform = `translate3d(0px, ${floatY.toFixed(2)}px, 0)`;
  });

  const initial =
    animateEntrance === "full"
      ? { opacity: 0, scale: 0.94 }
      : animateEntrance === "fade"
        ? { opacity: 0 }
        : false;

  const animate =
    animateEntrance === "full"
      ? { opacity: 1, scale: 1 }
      : animateEntrance === "fade"
        ? { opacity: 1 }
        : undefined;

  function handleLoadingComplete() {
    setLoaded(true);
    onLoadingComplete?.();
  }

  return (
    <div
      ref={floatRef}
      className={`absolute inset-0${visible ? "" : " invisible pointer-events-none"}${className ? ` ${className}` : ""}`}
      style={{ willChange: visible ? "transform" : undefined }}
      aria-hidden={!visible}
    >
      <motion.div
        className="h-full w-full"
        initial={initial}
        animate={revealed ? animate : initial}
        transition={{ duration: 0.55, ease: EASE, delay: entranceDelay }}
      >
        <a
          href={href ?? "#work"}
          tabIndex={visible ? undefined : -1}
          className={`block h-full w-full cursor-pointer overflow-hidden rounded-2xl transform-gpu transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.08]${
            linkClassName ? ` ${linkClassName}` : ""
          }`}
        >
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes={sizes ?? "(max-width: 640px) 34vw, 20vw"}
            priority={priority}
            fetchPriority={priority ? "high" : undefined}
            onLoadingComplete={handleLoadingComplete}
          />
        </a>
      </motion.div>
    </div>
  );
}
