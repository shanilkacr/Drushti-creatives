"use client";

import { useState, useEffect, useRef, type FormEvent, type ReactElement, type SVGProps } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, AnimatePresence } from "framer-motion";
import PillButton from "@/components/PillButton";

const EASE = [0.22, 1, 0.36, 1] as const;

function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1 11L11 1M11 1H3.5M11 1V8.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Floating line-illustration icons for the hero ────────────
   Same stroke-only, white icon treatment used on the Services hero,
   themed to "getting in touch" instead of services. */

function iconProps(props: SVGProps<SVGSVGElement>) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

const IconMail = (p: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps(p)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m4 6.5 8 6 8-6" />
  </svg>
);
const IconPhone = (p: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps(p)}>
    <path d="M6.5 3h3l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5l1.5-2 4 1.5v3c0 1-1 2-2 2-8 0-14.5-6.5-14.5-14.5 0-1 1-2 2-2Z" />
  </svg>
);
const IconChatDots = (p: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps(p)}>
    <path d="M4 4h16v12H8l-4 4V4Z" />
    <circle cx="9" cy="10" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="12" cy="10" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="15" cy="10" r="0.8" fill="currentColor" stroke="none" />
  </svg>
);
const IconPin = (p: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps(p)}>
    <path d="M12 21s-6.5-5.6-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.4-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.2" />
  </svg>
);
const IconSend = (p: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps(p)}>
    <path d="M21 3 3 10.5l7 2.5 2.5 7L21 3Z" />
    <path d="M10 13 21 3" />
  </svg>
);
const IconAt = (p: SVGProps<SVGSVGElement>) => (
  <svg {...iconProps(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-4 7.5" />
  </svg>
);

// Desktop positions assume the wide hero (heading sits in a narrow central
// column, plenty of side room). On mobile the heading + subtext stack up
// and take over roughly the 30–65% vertical band edge-to-edge, so the
// `mobileTop`/`mobileLeft` overrides below instead push all six icons into
// a top row and a bottom row — clear of the typography on any phone.
// Mobile arranges the three top icons along an upward arch (center pulled
// closest to the top edge, outer two dropping away from it) and the three
// bottom icons along a mirrored, downward arch — a "smile" top, "frown"
// bottom — rather than two flat rows, while staying clear of the nav bar
// above and the heading/subtext in between.
const FLOATING_ICONS = [
  // Left Side
  { Icon: IconMail, top: "15%", left: "18%", mobileTop: "26%", mobileLeft: "18%", size: 42, duration: 9, depth: 26, label: "Send Email", href: "mailto:collabs@drushticreatives.com", color: "#E0B624", btnVariant: "dark" },
  { Icon: IconSend, top: "45%", left: "12%", mobileTop: "26%", mobileLeft: "82%", size: 34, duration: 7.5, depth: 34, label: "Send Message", href: "#form", color: "#257FC2", btnVariant: "light" },
  { Icon: IconPhone, top: "75%", left: "15%", mobileTop: "84%", mobileLeft: "80%", size: 40, duration: 8.5, depth: 22, label: "Call Us", href: "tel:+94768519161", color: "#77C26B", btnVariant: "light" },
  // Right Side
  { Icon: IconChatDots, top: "15%", left: "82%", mobileTop: "20%", mobileLeft: "50%", size: 50, duration: 10.5, depth: -30, label: "Chat Now", href: "https://wa.link/62g3lq", color: "#77C26B", btnVariant: "light" },
  { Icon: IconAt, top: "45%", left: "88%", mobileTop: "84%", mobileLeft: "20%", size: 36, duration: 9.5, depth: -28, label: "Send Email", href: "mailto:collabs@drushticreatives.com", color: "#DC5C26", btnVariant: "light" },
  { Icon: IconPin, top: "75%", left: "85%", mobileTop: "94%", mobileLeft: "50%", size: 38, duration: 11, depth: -20, label: "View Map", href: "https://share.google/f3G6G1pm4Yp41hSnT", color: "#257FC2", btnVariant: "light" },
] as const;

function FloatingIcon({
  Icon,
  top,
  left,
  mobileTop,
  mobileLeft,
  size,
  duration,
  depth,
  pointerX,
  pointerY,
  delay,
  label,
  href,
  color,
  btnVariant,
}: {
  Icon: (p: SVGProps<SVGSVGElement>) => ReactElement;
  top: string;
  left: string;
  mobileTop: string;
  mobileLeft: string;
  size: number;
  duration: number;
  depth: number;
  pointerX: ReturnType<typeof useSpring>;
  pointerY: ReturnType<typeof useSpring>;
  delay: number;
  label: string;
  href: string;
  color: string;
  btnVariant: "light" | "dark";
}) {
  const [hovered, setHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const ix = useTransform(pointerX, (v) => v * depth);
  const iy = useTransform(pointerY, (v) => v * depth);

  // Below `lg` there's no hover to expand into, and the desktop box/icon
  // sizes (up to 120px, circles up to 74px) are too big to spread six of
  // these across a phone-width hero without clipping/overlap — so mobile
  // gets its own smaller, fixed square size and a smaller icon circle.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const boxSize = isMobile ? 68 : hovered ? 220 : 120;
  const circleSize = isMobile ? 42 : size + 24;
  const iconSize = isMobile ? 20 : size;

  const targetTop = isMobile ? mobileTop : top;
  const targetLeft = isMobile ? mobileLeft : left;

  // Clamp the (percentage) position so the box — centered on `left`/`top`
  // via the -translate-1/2 below — never runs past the section's edges,
  // regardless of viewport width or which size tier `boxSize` is in.
  const halfBox = boxSize / 2;
  const clampedLeft = `clamp(${halfBox}px, ${targetLeft}, calc(100% - ${halfBox}px))`;
  const clampedTop = `clamp(${halfBox}px, ${targetTop}, calc(100% - ${halfBox}px))`;

  return (
    // Plain (non-motion) wrapper does the centering translate — Framer Motion
    // writes its own `transform` inline style onto anything it animates
    // (here: scale, on the motion.div below), which would silently clobber
    // Tailwind's `-translate-x/y-1/2` utility classes if they lived on the
    // same element, since an inline style always wins over the stylesheet.
    <div className="absolute -translate-x-1/2 -translate-y-1/2 z-50" style={{ top: clampedTop, left: clampedLeft }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay, ease: EASE }}
        className="pointer-events-auto cursor-pointer z-20"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
      <motion.div style={prefersReducedMotion ? undefined : { x: ix, y: iy }} className="h-full w-full">
        <motion.div
          animate={{ width: boxSize, height: boxSize }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          style={{ backgroundColor: color }}
          className="flex flex-col items-center justify-center rounded-[1.25rem] p-2 select-none transition-colors sm:rounded-[2rem] sm:p-4"
        >
          {/* The tappable circle is its own link (rather than making the
              whole expanding box an <a>) so it never nests inside the
              hover-revealed PillButton's own <a> below. */}
          <motion.a
            href={href}
            aria-label={label}
            animate={prefersReducedMotion || hovered ? undefined : { y: [0, -6, 0] }}
            transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: circleSize, height: circleSize, backgroundColor: color }}
            className="flex items-center justify-center rounded-full border border-white text-white shrink-0"
          >
            <div style={{ width: iconSize, height: iconSize }}>
              <Icon className="h-full w-full" />
            </div>
          </motion.a>

          <AnimatePresence>
            {hovered && !isMobile && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="mt-4 flex shrink-0"
              >
                <PillButton
                  href={href}
                  variant={btnVariant}
                  className="!px-4 !py-2 !text-[9px] tracking-wider"
                >
                  {label}
                </PillButton>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
      </motion.div>
    </div>
  );
}

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sent">("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const heroRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 100, damping: 20, mass: 0.4 });
  const sy = useSpring(py, { stiffness: 100, damping: 20, mass: 0.4 });

  const handlePointer = (e: React.MouseEvent) => {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sent");
  }

  return (
    <main className="w-full bg-[#F4EFEA]">
      {/* ── HERO SECTION ───────────────────────────────────────── */}
      <section
        ref={heroRef}
        onMouseMove={handlePointer}
        className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-blue px-6 text-center pt-32 sm:pt-24"
      >
        {FLOATING_ICONS.map(({ Icon, top, left, mobileTop, mobileLeft, size, duration, depth, label, href, color, btnVariant }, i) => (
          <FloatingIcon
            key={i}
            Icon={Icon}
            top={top}
            left={left}
            mobileTop={mobileTop}
            mobileLeft={mobileLeft}
            size={size}
            duration={duration}
            depth={depth}
            pointerX={sx}
            pointerY={sy}
            delay={0.3 + i * 0.06}
            label={label}
            href={href}
            color={color}
            btnVariant={btnVariant}
          />
        ))}

        <div className="relative z-10 flex flex-col items-center gap-6 max-w-5xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="font-heading text-[clamp(2.4rem,10.5vw,3.4rem)] sm:text-[clamp(2.5rem,7.5vw,7.5rem)] font-normal leading-[0.95] text-white tracking-tight"
          >
            Want to connect?
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
            className="flex flex-col items-center gap-2 text-white/60"
          >
            <p className="font-body text-xs sm:text-sm uppercase tracking-wider">
              Feel free to email us or use
            </p>
            <div className="flex items-center gap-2 font-body text-xs sm:text-sm uppercase tracking-wider">
              <span>the form below</span>
              <motion.a
                href="#form"
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex items-center justify-center w-6 h-6 bg-white text-blue rounded hover:bg-orange hover:text-white transition-colors duration-300 mx-1"
                aria-label="Scroll to contact form"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 1V9M5 9L1.5 5.5M5 9L8.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.a>
              <span>with any questions</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FORM SECTION ───────────────────────────────────────── */}
      <section id="form" className="bg-[#F4EFEA] text-[#1A1A1A] py-24 lg:py-36 px-6 md:px-12 lg:px-20 xl:px-32 flex flex-col justify-center scroll-mt-20">
        <div className="mx-auto w-full max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            {/* Left Column: Heading */}
            <div className="flex flex-col select-none">
              <h2 className="font-heading text-display-lg font-bold leading-[0.95] tracking-tighter uppercase text-[#1A1A1A] flex flex-col gap-2">
                <span>Let&apos;s Tie</span>
                <span className="flex items-center gap-3 md:gap-5">
                  Ideas
                  <motion.svg
                    viewBox="0 0 100 100"
                    className="w-[0.9em] h-[0.9em] text-[#DC5C26] fill-current flex-shrink-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  >
                    <g transform="translate(50,50)">
                      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                        <rect
                          key={angle}
                          x="-6"
                          y="-45"
                          width="12"
                          height="38"
                          rx="6"
                          transform={`rotate(${angle})`}
                        />
                      ))}
                      <circle cx="0" cy="0" r="10" />
                    </g>
                  </motion.svg>
                </span>
                <span>Together</span>
              </h2>
            </div>

            {/* Right Column: Form */}
            <div className="w-full">
              {status === "sent" ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-[#1A1A1A]/20 rounded-lg p-8 md:p-12 text-center bg-[#EFEAE3]"
                >
                  <h3 className="font-heading text-2xl font-bold uppercase tracking-tight mb-4 text-[#1A1A1A]">
                    Thank You!
                  </h3>
                  <p className="font-body text-sm text-[#1A1A1A]/70 max-w-md mx-auto leading-relaxed">
                    We&apos;ve received your message and will get back to you shortly. Let&apos;s build something great.
                  </p>
                  <button
                    onClick={() => {
                      setFormData({ name: "", email: "", phone: "", message: "" });
                      setStatus("idle");
                    }}
                    className="mt-8 font-heading text-xs font-bold uppercase tracking-wider underline underline-offset-4 hover:opacity-75 transition-opacity"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 md:gap-8">

                  {/* Name field */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="font-heading text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]/80">
                      Name & Surname*
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      placeholder="Enter your name and surname"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full font-body bg-[#EFEAE3] border border-[#1A1A1A]/20 rounded-lg px-5 py-4 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 outline-none focus:border-[#1A1A1A]/60 focus:bg-[#EAE5DE] transition-all"
                    />
                  </div>

                  {/* Email field */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="font-heading text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]/80">
                      Email*
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      placeholder="Enter your Email address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full font-body bg-[#EFEAE3] rounded-lg px-5 py-4 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 outline-none focus:border-[#1A1A1A]/60 focus:bg-[#EAE5DE] transition-all"
                    />
                  </div>

                  {/* Phone field */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="phone" className="font-heading text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]/80">
                      Phone*
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      required
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full font-body bg-[#EFEAE3] border border-[#1A1A1A]/20 rounded-lg px-5 py-4 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 outline-none focus:border-[#1A1A1A]/60 focus:bg-[#EAE5DE] transition-all"
                    />
                  </div>

                  {/* Message field */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="message" className="font-heading text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]/80">
                      Message*
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={4}
                      placeholder="Enter your message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full font-body bg-[#EFEAE3] border border-[#1A1A1A]/20 rounded-lg px-5 py-4 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 outline-none focus:border-[#1A1A1A]/60 focus:bg-[#EAE5DE] transition-all resize-none"
                    />
                  </div>

                  {/* Submit button (Matching PillButton design and animations) */}
                  <div className="pt-2">
                    <motion.button
                      type="submit"
                      initial="rest"
                      whileHover="hover"
                      animate="rest"
                      variants={{
                        rest: {
                          backgroundColor: "rgb(26, 26, 26)",
                          color: "rgb(255, 255, 255)",
                          borderColor: "rgb(26, 26, 26)",
                        },
                        hover: {
                          backgroundColor: "rgb(40, 79, 159)",
                          color: "rgb(255, 255, 255)",
                          borderColor: "rgb(40, 79, 159)",
                        },
                      }}
                      transition={{ duration: 0.55, ease: EASE }}
                      className="font-heading inline-flex items-center rounded-lg px-7 py-3.5 text-xs leading-5 !uppercase border border-transparent"
                    >
                      <span className="relative h-5 overflow-hidden">
                        <motion.span
                          className="flex flex-col"
                          variants={{ rest: { y: "0%" }, hover: { y: "-50%" } }}
                          transition={{ duration: 0.4, ease: EASE }}
                        >
                          <span className="flex h-5 items-center gap-2 leading-5">
                            SEND
                            <ArrowIcon />
                          </span>
                          <span className="flex h-5 items-center gap-2 leading-5">
                            SEND
                            <ArrowIcon />
                          </span>
                        </motion.span>
                      </span>
                    </motion.button>
                  </div>

                </form>
              )}
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
