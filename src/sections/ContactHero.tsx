"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const GREETINGS = ["Hello", "Ayubowan", "Howzit", "Bonjour", "Namaste", "Hola"];

export default function ContactHero() {
  const [index, setIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % GREETINGS.length);
    }, 1800);
    return () => clearInterval(id);
  }, [prefersReducedMotion]);

  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden bg-[#0B1424] px-6 text-center text-white">
      <h1 className="flex flex-wrap items-baseline justify-center gap-x-5 font-heading text-heading-hero-half font-extrabold tracking-tight">
        <span className="text-white">Say</span>
        <span className="relative inline-flex h-[1.15em] min-w-[6ch] items-center justify-start overflow-hidden align-baseline">
          <AnimatePresence mode="wait">
            <motion.span
              key={GREETINGS[index]}
              initial={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 24, filter: "blur(8px)" }
              }
              animate={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 1, y: 0, filter: "blur(0px)" }
              }
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: -24, filter: "blur(8px)" }
              }
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="whitespace-nowrap font-serif italic text-[#DC5C26]"
            >
              {GREETINGS[index]}
            </motion.span>
          </AnimatePresence>
        </span>
      </h1>

      <p className="mt-6 max-w-md text-base text-white/50 sm:text-lg">
        Tell us about your project — we usually reply within one business day.
      </p>

      <OrbitDecoration className="mt-14" reducedMotion={!!prefersReducedMotion} />
    </section>
  );
}

function OrbitDecoration({
  className = "",
  reducedMotion,
}: {
  className?: string;
  reducedMotion: boolean;
}) {
  return (
    <div className={`relative h-32 w-32 ${className}`} aria-hidden="true">
      <motion.svg
        viewBox="0 0 160 160"
        className="absolute inset-0 h-full w-full"
        animate={reducedMotion ? undefined : { rotate: 360 }}
        transition={
          reducedMotion
            ? undefined
            : { duration: 14, repeat: Infinity, ease: "linear" }
        }
      >
        <ellipse
          cx="70"
          cy="80"
          rx="45"
          ry="65"
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.5"
          transform="rotate(-20 70 80)"
        />
      </motion.svg>
      <motion.svg
        viewBox="0 0 160 160"
        className="absolute inset-0 h-full w-full"
        animate={reducedMotion ? undefined : { rotate: -360 }}
        transition={
          reducedMotion
            ? undefined
            : { duration: 18, repeat: Infinity, ease: "linear" }
        }
      >
        <ellipse
          cx="95"
          cy="70"
          rx="42"
          ry="30"
          fill="none"
          stroke="rgba(220,92,38,0.6)"
          strokeWidth="1.5"
          transform="rotate(15 95 70)"
        />
      </motion.svg>
    </div>
  );
}
