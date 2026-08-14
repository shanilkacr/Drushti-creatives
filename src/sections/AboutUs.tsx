"use client";

import { useRef, type RefObject } from "react";
import { motion, useScroll, useTransform, useMotionTemplate } from "motion/react";
import PillButton from "@/components/PillButton";
import { ABOUT_SCROLL_VH, SHAPE_CLOSED_AT } from "@/config/clientCurtain";

const TITLE_APPEAR_START = Math.max(0, SHAPE_CLOSED_AT - 0.18);
const SHAPE_MID_AT = SHAPE_CLOSED_AT * 0.5;
const BUTTON_APPEAR_START = SHAPE_CLOSED_AT;
const BUTTON_APPEAR_END = SHAPE_CLOSED_AT + 0.1;

type AboutUsProps = {
  scrollRef?: RefObject<HTMLElement | null>;
};

export default function AboutUs({ scrollRef }: AboutUsProps) {
  const fallbackRef = useRef<HTMLElement>(null);
  const containerRef = scrollRef ?? fallbackRef;

  const { scrollYProgress } = useScroll({
    target: containerRef as RefObject<HTMLElement>,
    offset: ["start start", "end end"],
  });

  // Top shape control points
  const topCenterY = useTransform(scrollYProgress, [0, SHAPE_MID_AT, SHAPE_CLOSED_AT], [0, 50, 50]);
  const topEdgeY = useTransform(scrollYProgress, [0, SHAPE_MID_AT, SHAPE_CLOSED_AT], [0, 15, 50]);

  // Bottom shape control points
  const bottomCenterY = useTransform(scrollYProgress, [0, SHAPE_MID_AT, SHAPE_CLOSED_AT], [100, 50, 50]);
  const bottomEdgeY = useTransform(scrollYProgress, [0, SHAPE_MID_AT, SHAPE_CLOSED_AT], [100, 85, 50]);

  const topPath = useMotionTemplate`M 0 0 L 100 0 L 100 ${topEdgeY} Q 50 ${topCenterY} 0 ${topEdgeY} Z`;
  const bottomPath = useMotionTemplate`M 0 100 L 100 100 L 100 ${bottomEdgeY} Q 50 ${bottomCenterY} 0 ${bottomEdgeY} Z`;

  const titleOpacity = useTransform(
    scrollYProgress,
    [0, TITLE_APPEAR_START, SHAPE_CLOSED_AT],
    [0, 0, 1],
  );

  const titleScale = useTransform(
    scrollYProgress,
    [0, TITLE_APPEAR_START, SHAPE_CLOSED_AT],
    [0.9, 0.9, 1],
  );

  const buttonOpacity = useTransform(
    scrollYProgress,
    [BUTTON_APPEAR_START, BUTTON_APPEAR_END],
    [0, 1],
  );

  const buttonY = useTransform(
    scrollYProgress,
    [BUTTON_APPEAR_START, BUTTON_APPEAR_END],
    [16, 0],
  );

  return (
    <section
      ref={containerRef as RefObject<HTMLElement>}
      className="relative z-10"
      style={{ height: `${ABOUT_SCROLL_VH}vh` }}
    >
      <div className="sticky top-0 flex h-screen w-full flex-col overflow-hidden">

        <motion.div
          style={{ opacity: titleOpacity }}
          className="absolute inset-0 z-0 bg-white pointer-events-none"
        />

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 pointer-events-none z-0 w-full h-full text-orange"
        >
          <motion.path d={topPath} fill="currentColor" />
          <motion.path d={bottomPath} fill="currentColor" />
        </svg>

        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-8 px-4">
            <motion.h2
              style={{
                opacity: titleOpacity,
                scale: titleScale,
              }}
              className="pointer-events-none text-center font-heading text-[clamp(2.4rem,10.5vw,3.4rem)] sm:text-heading-hero-half leading-[0.88] tracking-tighter text-white"
            >
              More strategy.<br />More connection.<br />
            </motion.h2>

            <motion.div
              style={{ opacity: buttonOpacity, y: buttonY }}
              className="pointer-events-auto"
            >
              <PillButton href="/about" variant="light">
                About Us
              </PillButton>
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
}
