"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import Container from "@/components/Container";

import { EASE } from "@/lib/motion";
import { TESTIMONIALS } from "@/data/testimonials";
import type { Client } from "@/lib/content/types";
import { resolveClientLogoSquare } from "@/lib/content/client-utils";


// Cards are min(420px, 85vw) wide so they never exceed the phone viewport;
// the slide step is measured from the first card at runtime.
const CARD_WIDTH = "min(420px, 85vw)";
const CARD_GAP = 24;
const FALLBACK_STEP = 420 + CARD_GAP;
const LOGO_FRAME = "h-[5.6rem] w-[5.6rem] sm:h-[6.4rem] sm:w-[6.4rem]";
/** Inner bounds so portrait, landscape, and square marks read at similar visual weight. */
const LOGO_INNER = "h-[3.75rem] w-[3.75rem] sm:h-[4.25rem] sm:w-[4.25rem]";

function CompanyLogo({
  company,
  clients,
  className,
}: {
  company: string;
  clients: Client[];
  className?: string;
}) {
  const src = resolveClientLogoSquare(clients, company);

  if (!src) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-3 text-center ${className ?? LOGO_FRAME}`}
      >
        <motion.p
          initial={false}
          animate={{ color: "rgb(var(--ink))" }}
          transition={{ duration: 0.5, ease: EASE }}
          className="font-heading text-xs leading-tight tracking-wide sm:text-sm"
        >
          {company}
        </motion.p>
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-white ${className ?? LOGO_FRAME}`}
    >
      <div className={`relative ${LOGO_INNER}`}>
        <Image src={src} alt={company} fill sizes="68px" className="object-contain" />
      </div>
    </div>
  );
}

function LinkedInIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-label="LinkedIn">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

/** Testimonials carousel traced from the reference: static left column with
 *  Clutch rating; click-driven card track on the right that clips at the
 *  screen edge; circular prev/next buttons beneath the cards. */
export default function Testimonials({ clients }: { clients: Client[] }) {
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(FALLBACK_STEP);
  const trackRef = useRef<HTMLDivElement>(null);
  const maxIndex = TESTIMONIALS.length - 1;

  useEffect(() => {
    const measure = () => {
      const first = trackRef.current?.children[0] as HTMLElement | undefined;
      if (first) setStep(first.offsetWidth + CARD_GAP);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <section className="relative overflow-hidden bg-light-blue py-10 sm:py-20 lg:py-32">
      <Container>
        <div className="flex flex-col gap-6 sm:gap-12 lg:flex-row lg:gap-16">
          {/* Left column — heading, promise, Clutch rating */}
          <div className="shrink-0 lg:w-[340px]">
            <div className="flex flex-col items-start lg:sticky lg:top-32">
              <h2 className="mb-3 font-heading text-heading-4xl leading-heading text-white sm:mb-6 sm:text-heading-5xl">
                Kind words from
                <br />
                our clients
              </h2>
              <p className="mb-6 max-w-sm text-sm text-white/80 sm:mb-12 sm:text-base">
                We aren&apos;t just execution partners—we are strategic collaborators. If you&apos;re not convinced, check out our verified
                testimonials from around the world about working with us.
              </p>


            </div>
          </div>

          {/* Right column — card track clipping at the screen's right edge */}
          <div className="min-w-0 flex-1">
            <div className="overflow-hidden lg:[margin-right:calc(50%-50vw)]">
              <motion.div
                ref={trackRef}
                className="flex gap-6"
                animate={{ x: -index * step }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                {TESTIMONIALS.map((t, i) => {
                  const isActive = i === index;

                  return (
                    <motion.div
                      key={t.id}
                      initial={false}
                      animate={{
                        backgroundColor: isActive
                          ? "rgba(255, 255, 255, 0.9)"
                          : "rgba(255, 255, 255, 0.15)",
                      }}
                      transition={{ duration: 0.5, ease: EASE }}
                      style={{
                        width: CARD_WIDTH,
                        minWidth: CARD_WIDTH,
                        borderRadius: "1.5rem",
                        overflow: "hidden",
                      }}
                      className="flex min-h-[260px] flex-col justify-between p-6 sm:min-h-[440px] sm:p-12"
                    >
                      <motion.p
                        initial={false}
                        animate={{
                          color: isActive ? "rgba(var(--ink) / 0.8)" : "rgba(255, 255, 255, 0.9)",
                        }}
                        transition={{ duration: 0.5, ease: EASE }}
                        className="text-sm leading-snug sm:text-base sm:leading-relaxed"
                      >
                        {t.text}
                      </motion.p>

                      <div className="mt-4 flex items-center gap-4 sm:mt-8 sm:gap-6">
                        <CompanyLogo company={t.company} clients={clients} />

                        <div className="min-w-0 flex-1">
                          <motion.p
                            initial={false}
                            animate={{ color: isActive ? "rgb(var(--ink))" : "#ffffff" }}
                            transition={{ duration: 0.5, ease: EASE }}
                            className="flex items-center gap-2 font-bold"
                          >
                            {t.name}
                            <LinkedInIcon />
                          </motion.p>
                          <motion.p
                            initial={false}
                            animate={{
                              color: isActive ? "rgba(var(--ink) / 0.5)" : "rgba(255, 255, 255, 0.7)",
                            }}
                            transition={{ duration: 0.5, ease: EASE }}
                            className="mt-1 text-sm"
                          >
                            {t.role} at {t.company}
                          </motion.p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>

            {/* Prev / next under the cards */}
            <div className="mt-4 flex gap-3 sm:mt-10">
              <button
                onClick={() => setIndex((prev) => Math.max(prev - 1, 0))}
                disabled={index === 0}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition-all hover:scale-105 hover:bg-white/25 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
                aria-label="Previous testimonial"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setIndex((prev) => Math.min(prev + 1, maxIndex))}
                disabled={index === maxIndex}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-light-blue transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
                aria-label="Next testimonial"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
