"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "motion/react";
import Container from "@/components/Container";
import { Burst } from "@/components/HeroShapes";
import PillButton from "@/components/PillButton";
import Tag from "@/components/Tag";
import { EASE } from "@/lib/motion";
import type { Project } from "@/lib/content/types";
import {
  FEATURED_WORK_LOGO_MAX_HEIGHT,
  FEATURED_WORK_LOGO_MAX_WIDTH,
} from "@/data/clientLogos";

/** Pinned scroll section driven by CMS portfolio entries flagged featuredOnHomepage. */
export default function FeaturedWork({ projects }: { projects: Project[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const count = Math.max(projects.length, 1);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  const rawIndex = useTransform(scrollYProgress, [0, 1], [0, Math.max(projects.length - 1, 0)]);

  useMotionValueEvent(rawIndex, "change", (v) => {
    if (projects.length === 0) return;
    const rounded = Math.min(projects.length - 1, Math.max(0, Math.round(v)));
    setActive((prev) => (prev === rounded ? prev : rounded));
  });

  const scrollToProject = (i: number) => {
    const el = wrapperRef.current;
    if (!el || projects.length <= 1) return;
    const rect = el.getBoundingClientRect();
    const sectionTop = rect.top + window.scrollY;
    const range = el.offsetHeight - window.innerHeight;
    const target = sectionTop + (i / (projects.length - 1)) * range;
    const lenis = (window as unknown as { __lenis?: { scrollTo: (t: number) => void } }).__lenis;
    if (lenis) {
      lenis.scrollTo(target);
    } else {
      window.scrollTo({ top: target, behavior: "smooth" });
    }
  };

  if (projects.length === 0) return null;

  // More scroll dwell on mobile so content has time to be read
  const perProjectVh = isMobile ? 80 : 55;

  return (
    <section
      id="work"
      ref={wrapperRef}
      className="relative bg-white"
      style={{ height: `${count * perProjectVh}vh` }}
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden pt-28 pb-10 sm:py-20">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.32em] text-ink sm:mb-6"
          >
            <Burst className="h-4 w-4 text-orange" />
            Featured work
          </motion.div>

          <div>
            {projects.map((project, i) => {
              const isActive = i === active;
              const logoSrc = project.clientLogoFocus || project.clientLogoSquare;
              return (
                <div key={project.slug} className="border-b border-ink/10 py-2 first:pt-0 sm:py-3">
                  <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <div className="grid min-w-0 flex-1 grid-cols-1 gap-x-4 sm:grid-cols-[auto_1fr]">
                      <span
                        className={`hidden text-[2.5rem] leading-none text-ink/40 transition-transform duration-300 sm:inline-block sm:self-center ${isActive ? "-rotate-90" : ""}`}
                        aria-hidden
                      >
                        ↓
                      </span>

                      <button
                        type="button"
                        onClick={() => scrollToProject(i)}
                        className="text-left sm:col-start-2"
                      >
                        <span
                          className={`font-heading text-heading-xl leading-heading tracking-tight transition-colors duration-300 sm:text-heading-3xl ${isActive ? "text-ink" : "text-ink/25"}`}
                        >
                          {project.name}
                        </span>
                      </button>
                    </div>

                    {/* Tags: hidden on very small screens to save space, shown from sm up */}
                    <span className="hidden flex-wrap items-center gap-2 sm:flex sm:shrink-0 sm:justify-end">
                      {project.tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </span>
                  </div>

                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="overflow-hidden"
                      >
                        {/* Mobile: image first, then text. Desktop: text left, image right */}
                        <div className="mt-3 flex flex-col gap-4 sm:mt-4 sm:grid sm:grid-cols-[3fr_2fr] sm:items-start sm:gap-6">
                          {/* Image — shown first on mobile (order-1), second on desktop (sm:order-2) */}
                          <div className="order-1 flex min-w-0 w-full sm:order-2">
                            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-ink/10 bg-white sm:rounded-3xl">
                              <Image
                                src={project.featuredImage}
                                alt={project.name}
                                fill
                                className="object-cover object-top"
                              />
                            </div>
                          </div>

                          {/* Text content — shown second on mobile (order-2), first on desktop (sm:order-1) */}
                          <div className="order-2 grid min-w-0 grid-cols-1 gap-x-4 sm:order-1 sm:grid-cols-[auto_1fr]">
                            <span className="invisible hidden text-[2.5rem] leading-none sm:inline-block" aria-hidden>
                              ↓
                            </span>
                            <div className="min-w-0 sm:col-start-2">
                              {logoSrc && (
                                <div className="mb-2 block w-fit">
                                  <Image
                                    src={logoSrc}
                                    alt={project.client}
                                    width={148}
                                    height={48}
                                    className="block h-auto w-auto object-contain object-left"
                                    style={{
                                      maxHeight: FEATURED_WORK_LOGO_MAX_HEIGHT,
                                      maxWidth: isMobile ? 100 : FEATURED_WORK_LOGO_MAX_WIDTH,
                                    }}
                                  />
                                </div>
                              )}
                              <p className="text-xs text-ink/70 sm:text-sm">{project.challenge}</p>

                              <ul className="mt-3 space-y-1.5 sm:mt-4 sm:space-y-2">
                                {project.results.map((result, ri) => (
                                  <li
                                    key={ri}
                                    className="flex items-baseline gap-2 text-xs text-ink/70 sm:gap-3 sm:text-sm"
                                  >
                                    {result.metric && (
                                      <span className="font-heading text-heading-lg leading-heading text-ink sm:text-heading-2xl">
                                        {result.metric}
                                      </span>
                                    )}
                                    <span className="min-w-0 flex-1">{result.text}</span>
                                  </li>
                                ))}
                              </ul>

                              <PillButton href={project.href} className="mt-3 px-5 py-2 text-xs sm:mt-4 sm:px-6 sm:py-2.5 sm:text-sm">
                                View more
                              </PillButton>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Container>
      </div>
    </section>
  );
}

