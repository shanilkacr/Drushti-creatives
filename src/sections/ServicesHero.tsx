"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import clsx from "clsx";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from "motion/react";

type ServiceItem = {
  id: string;
  label: string;
  src: string;
};

// Tailwind class on the spacer — keep in sync with h-[14rem] below.
const SCROLL_BUDGET_CLASS = "h-[12rem]";

// Paths are root-relative to /public — public/art/halfcircle.png -> "/art/halfcircle.png"
// ids match subservices.tsx's BANDS ids (and /services/[id] routes) — this
// is what lets a hero tag select/filter the matching band below.
const SERVICES: ServiceItem[] = [
  {
    id: "marketing",
    label: "Social Media & Digital Marketing",
    src: "/art/halfcircle.png",
  },
  {
    id: "brand",
    label: "Logo Design & Graphic Design",
    src: "/art/element1.png",
  },
  {
    id: "graphic",
    label: "Content Development",
    src: "/art/element2.png",
  },
  {
    id: "web",
    label: "Website & UI Designing",
    src: "/art/circle.png",
  },
];

// Framer's `style={{ opacity: motionValue }}` binding doesn't reliably push
// updates to the DOM in this project's setup (see ServicesHero.tsx). Subscribe
// manually and write el.style.opacity ourselves to sidestep it.
function useOpacity(value: MotionValue<number>) {
  const ref = useRef<HTMLDivElement>(null);
  useMotionValueEvent(value, "change", (v) => {
    if (ref.current) ref.current.style.opacity = String(v);
  });
  return ref;
}

function ServiceIcon({
  service,
  reveal,
  selected,
  onSelect,
}: {
  service: ServiceItem;
  reveal: MotionValue<number>;
  selected: boolean;
  onSelect?: (id: string) => void;
}) {
  const pillOpacityRef = useOpacity(reveal);
  const labelOpacityRef = useOpacity(reveal);
  // Expand to a generous ceiling so each tag grows to its natural text width.
  const labelWidth = useTransform(reveal, [0, 1], [0, 2400]);
  const labelGap = useTransform(reveal, [0, 1], [0, 6]);
  const iconScale = useTransform(reveal, [0, 1], [6, 1]);

  return (
    <motion.button
      type="button"
      onClick={() => onSelect?.(service.id)}
      aria-pressed={selected}
      className="group relative flex shrink-0 cursor-pointer items-center overflow-visible rounded-full outline-none transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue"
    >
      <div
        ref={pillOpacityRef}
        style={{ opacity: reveal.get() }}
        aria-hidden
        className={clsx(
          "absolute inset-0 rounded-full border-2 transition-colors duration-200",
          selected
            ? "border-white bg-white"
            : "border-white/40 bg-transparent group-hover:border-white group-hover:bg-white/15 group-active:bg-white/25",
        )}
      />
      <div className="relative flex items-center px-3 py-1.5 sm:px-4 sm:py-2">
        <motion.div style={{ scale: iconScale }} className="origin-center shrink-0">
          <Image
            src={service.src}
            alt=""
            width={200}
            height={200}
            className="h-8 w-8 sm:h-10 sm:w-10"
          />
        </motion.div>
        <motion.span
          ref={labelOpacityRef}
          style={{
            opacity: reveal.get(),
            maxWidth: labelWidth,
            marginLeft: labelGap,
          }}
          className={clsx(
            "inline-block overflow-hidden whitespace-nowrap text-base uppercase tracking-wide transition-colors duration-200 sm:text-lg",
            selected ? "text-blue" : "text-white",
          )}
        >
          {service.label}
        </motion.span>
      </div>
    </motion.button>
  );
}

type ServicesHeroProps = {
  heading?: string;
  paragraph?: string;
  /** Content scrolled beneath the sticky icon bar (e.g. PortfolioGrid). */
  children?: ReactNode;
  /** Selected service id (matches subservices.tsx's BANDS ids). Omit on
   *  pages (e.g. Portfolio) that don't filter anything below the hero. */
  selectedId?: string | null;
  /** Called with the clicked tag's id, or null when re-clicking the
   *  already-selected tag to clear the filter. Omit to render inert tags. */
  onSelectService?: (id: string | null) => void;
};

export default function ServicesIntro({
  heading = "Clear solutions for your brand's growth.",
  paragraph = "We handle everything from strategy to execution — branding, digital marketing, web, video, and graphic design — so your brand stays consistent, professional, and always moving forward.",
  children,
  selectedId = null,
  onSelectService,
}: ServicesHeroProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stickyBarRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const [pinStart, setPinStart] = useState(0);
  const [pinScrollLength, setPinScrollLength] = useState(224);
  const [stickyBarHeight, setStickyBarHeight] = useState(0);

  useEffect(() => {
    if (!sectionRef.current || !spacerRef.current) return;
    const measure = () => {
      setPinStart(sectionRef.current!.offsetTop);
      setPinScrollLength(Math.max(1, spacerRef.current!.offsetHeight));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(sectionRef.current);
    ro.observe(spacerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [children]);

  useEffect(() => {
    if (!stickyBarRef.current) return;
    const measure = () => setStickyBarHeight(stickyBarRef.current!.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stickyBarRef.current);
    return () => ro.disconnect();
  }, []);

  const { scrollY } = useScroll();
  const scrollYProgress = useTransform(scrollY, (v) => {
    const p = (v - pinStart) / pinScrollLength;
    return Math.min(1, Math.max(0, p));
  });

  // Hold at the oversized icon state until 5% scroll, then morph through to 100%.
  const reveal = useTransform(scrollYProgress, [0, 2], [0, 2], { clamp: true });

  const iconColumnGap = useTransform(reveal, [0, 2], [50, 2]);
  const iconRowGap = 4;

  return (
    <div
      ref={sectionRef}
      className="relative w-screen max-w-[100vw] ml-[calc(50%-50vw)]"
      style={
        {
          "--services-sticky-offset": `${stickyBarHeight}px`,
        } as React.CSSProperties
      }
    >
      <div className="w-full bg-blue px-6 pb-6 pt-[18vh] sm:px-8 sm:pb-8 sm:pt-[20vh]">
        <div className="flex w-full flex-col items-center text-center">
          <h1 className="font-heading text-[clamp(2.4rem,10.5vw,3.4rem)] sm:text-heading-hero-half font-bold leading-[0.85] tracking-tight text-white">
            {heading}
          </h1>

          <p className="mx-auto mb-8 mt-6 max-w-xs text-sm leading-relaxed text-white/70 sm:mb-10 sm:mt-8 sm:max-w-xl sm:text-base">
            {paragraph}
          </p>
        </div>
      </div>

      {/* Pins flush to the viewport top; releases when children finish scrolling. */}
      <div ref={stickyBarRef} className="sticky top-0 z-30 w-full bg-blue py-4 sm:py-5">
        <motion.div
          style={{ columnGap: iconColumnGap, rowGap: iconRowGap }}
          className="flex w-full max-w-none flex-wrap items-center justify-center"
        >
          {SERVICES.map((service) => (
            <ServiceIcon
              key={service.id}
              service={service}
              reveal={reveal}
              selected={selectedId === service.id}
              onSelect={(id) => onSelectService?.(selectedId === id ? null : id)}
            />
          ))}
        </motion.div>
      </div>

      {/* Scroll track for the icon squeeze animation (progress 0→1) */}
      <div
        ref={spacerRef}
        aria-hidden
        className={`w-full ${SCROLL_BUDGET_CLASS} bg-blue`}
      />

      {children}
    </div>
  );
}
