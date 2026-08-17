"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import Container from "@/components/Container";
import { Burst, Circle, HalfCircle } from "@/components/HeroShapes";
import Tag from "@/components/Tag";

import { EASE } from "@/lib/motion";

const SERVICE_ICON_SIZE = 500;

const CATEGORIES = [
  {
    name: "Social Media & Digital Marketing",
    description: "We help you reach the right people and turn them into customers. We handle everything from creating your daily posts to managing your ad campaigns, ensuring every dollar you spend helps your business grow.",
    tags: [
      "Social Media Management",
      "Paid Ad Campaigns",
      "Audience Targeting & Analytics",
      "Performance Reporting",
    ],
    Shape: Circle,
    color: "text-sky",
    image: "/performance-growth-icon.png",
  },
  {
    name: "Logo Design & Graphic Design",
    description: "We create a professional look that fits your business perfectly. From your logo to your brand colors, we make sure you look consistent everywhere.",
    tags: [
      "Logo Design", "Brand Identity & Guidelines",
      "Social Media Post Designs",
      "Marketing Collateral & Brochures",
      "Digital & Print Banners",
      "Infographics & Presentation Design",
    ],
    Shape: Circle,
    color: "text-yellow",
    image: "/logo-design.png",
  },
  {
    name: "Content Development",
    description: "We find the right words to explain what you do. We write clear, simple, and honest messages that help your audience trust your brand.",
    tags: [
      "Copywriting & Messaging Strategy",
      "Social Media Content Creation",
      "Video Production & Editing",
      "Social Media Reels & Editing",
      "Blog & Article Writing",
    ],
    Shape: Burst,
    color: "text-orange",
    image: "/creative-solutions-icon.png",
  },

  {
    name: "Website & UI Design",
    description: "We design and build fast, responsive, and user-friendly websites tailored to your brand to turn visitors into customers.",
    tags: [
      "Custom Website Development",
      "UI/UX Design & Prototyping",
      "Landing Page Optimization",
      "Website Maintenance & Support",
    ],
    Shape: HalfCircle,
    color: "text-green",
    image: "/digital-presence-icon.png",
  },
];

/** Services section: an accordion of categories (one expanded with subline +
 *  tags at a time) beside the active category's own Hero shape, colored to
 *  match — the expanded title picks up that same color.
 *
 *  Scroll behavior:
 *  - This section is "pinned" so the viewport stays visually stable while the
 *    scroll position maps to the active category.
 *  - We snap between categories by rounding the computed index.
 *  - Reduced-motion users keep the click-to-select accordion behavior. */
export default function Services() {
  const [active, setActive] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const wrapperRef = useRef<HTMLElement | null>(null);
  const ActiveShape = CATEGORIES[active].Shape;
  const activeCategory = CATEGORIES[active];

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  // Map 0 -> 1 progress into a category index from 0 -> 2.
  const rawIndex = useTransform(scrollYProgress, [0, 1], [0, CATEGORIES.length - 1]);

  useMotionValueEvent(rawIndex, "change", (v) => {
    if (prefersReducedMotion) return;
    const rounded = Math.min(CATEGORIES.length - 1, Math.max(0, Math.round(v)));
    setActive((prev) => (prev === rounded ? prev : rounded));
  });

  return (
    <section
      ref={(node) => {
        wrapperRef.current = node;
      }}
      className="relative bg-white"
      // Controls "how fast" we move through categories:
      // smaller height => less scroll distance => faster snapping. Kept
      // generous so each category has room to sit still and be read before
      // the next scroll moves on, rather than flicking past in a hurry.
      style={{ height: `${CATEGORIES.length * 95}vh` }}
    >
      <div className="sticky top-0 flex min-h-screen flex-col justify-center overflow-hidden py-16 sm:py-20">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.32em] text-ink sm:mb-10"
          >
            <Burst className="h-4 w-4 text-orange" />
            Services
          </motion.div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-start lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="order-2 min-w-0 lg:order-1"
            >
              {CATEGORIES.map((cat, i) => {
                const isActive = i === active;
                return (
                  <div key={cat.name} className="border-b border-ink/10 py-5 first:pt-0 sm:py-6">
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      aria-expanded={isActive}
                      className={`text-left font-heading text-heading-xl leading-heading tracking-tight transition-colors duration-300 sm:text-heading-2xl lg:text-heading-3xl ${isActive ? cat.color : "text-ink/25 hover:text-ink/50"
                        }`}
                    >
                      {cat.name}
                    </button>

                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: EASE }}
                          className="overflow-hidden"
                        >
                          <p className="mt-4 max-w-xl text-sm text-ink/70 sm:text-base">{cat.description}</p>
                          <div className="mt-5 flex flex-wrap gap-2">
                            {cat.tags.map((tag) => (
                              <Tag
                                key={tag}
                                className="!h-7 !px-2.5 !text-[10px] sm:!h-9 sm:!px-3 sm:!text-xs"
                              >
                                {tag}
                              </Tag>
                            ))}
                          </div>

                          {/* Below lg: the category's own image sits inside its
                              card, after the tags — the shared image column
                              (further down) only kicks in at lg. */}
                          {"image" in cat && cat.image ? (
                            <div className="mx-auto mt-6 flex size-40 items-center justify-center sm:size-56 lg:hidden">
                              <Image
                                src={cat.image}
                                alt={cat.name}
                                width={SERVICE_ICON_SIZE}
                                height={SERVICE_ICON_SIZE}
                                sizes="(max-width: 640px) 160px, 224px"
                                className={`h-full w-full object-contain ${cat.color}`}
                              />
                            </div>
                          ) : null}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="order-1 mx-auto hidden items-center justify-center lg:order-2 lg:flex lg:size-[500px]"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.7, rotate: 8 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className={`flex h-full w-full items-center justify-center ${activeCategory.color}`}
                >
                  {"image" in activeCategory && activeCategory.image ? (
                    <Image
                      src={activeCategory.image}
                      alt={activeCategory.name}
                      width={SERVICE_ICON_SIZE}
                      height={SERVICE_ICON_SIZE}
                      sizes="500px"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <ActiveShape className="h-full w-full" />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </Container>
      </div>
    </section>
  );
}
