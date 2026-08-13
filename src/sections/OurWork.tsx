"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import Container from "@/components/Container";
import PortfolioCard from "@/components/PortfolioCard";

export type WorkItem = {
  name: string;
  client: string;
  image: string;
  tags: string[];
  href: string;
};

// Scroll distance (px) before cards fully expand — mobile completes sooner.
const UNSTACK_DISTANCE = { mobile: 220, desktop: 420 } as const;
const MOBILE_MQ = "(max-width: 639px)";

type Offset = { dx: number; dy: number; rotate: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function useStackScrollConfig() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const unstackDistance = isMobile ? UNSTACK_DISTANCE.mobile : UNSTACK_DISTANCE.desktop;
  return { isMobile, unstackDistance };
}

/** Fan spread scales with card width so the stack looks tight at any breakpoint. */
function buildFanOffsets(count: number, cardWidth: number): Offset[] {
  if (count === 0) return [];
  if (count === 1) return [{ dx: 0, dy: 0, rotate: 0 }];

  const center = (count - 1) / 2;
  const maxSpread = clamp(cardWidth * 0.85, 72, 200);
  const maxRotate = 12;

  return Array.from({ length: count }, (_, i) => {
    const t = center === 0 ? 0 : (i - center) / center;
    return {
      dx: t * maxSpread * 0.5,
      rotate: t * maxRotate,
      dy: Math.abs(t) * clamp(cardWidth * 0.04, 6, 14),
    };
  });
}

function stackZIndex(index: number, count: number, isHovered?: boolean) {
  // First card in the list sits on top of the pile.
  const baseZ = count - index;
  return isHovered ? baseZ + 50 : baseZ;
}

function StackCard({
  index,
  count,
  offset,
  fan,
  progress,
  compactStagger,
  isHovered,
  children,
}: {
  index: number;
  count: number;
  offset: Offset | null;
  fan: Offset;
  progress: MotionValue<number>;
  compactStagger?: boolean;
  isHovered?: boolean;
  children: React.ReactNode;
}) {
  const dx = (offset?.dx ?? 0) + fan.dx;
  const dy = (offset?.dy ?? 0) + fan.dy;

  const step = compactStagger ? 0.025 : 0.04;
  const cap = compactStagger ? 0.15 : 0.25;
  const start = Math.min(index * step, cap);

  const x = useTransform(progress, [start, 1], [dx, 0]);
  const y = useTransform(progress, [start, 1], [dy, 0]);
  const rotate = useTransform(progress, [start, 1], [fan.rotate, 0]);
  const scale = useTransform(progress, [start, 1], [0.92, 1]);

  return (
    <motion.div
      style={{ x, y, rotate, scale, zIndex: stackZIndex(index, count, isHovered) }}
      className="relative"
    >
      {children}
    </motion.div>
  );
}

export default function OurWork({
  serviceId,
  items,
  header,
}: {
  serviceId: string;
  items: WorkItem[];
  header: React.ReactNode;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [offsets, setOffsets] = useState<Offset[] | null>(null);
  const [cardWidth, setCardWidth] = useState(0);
  const { isMobile, unstackDistance } = useStackScrollConfig();

  const hasItems = items.length > 0;

  const fanOffsets = useMemo(
    () => buildFanOffsets(items.length, cardWidth),
    [items.length, cardWidth],
  );

  // Measure grid card positions and card width — re-run on resize / column changes.
  useEffect(() => {
    if (!hasItems) return;

    const measure = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;

      const firstCard = cardRefs.current.find(Boolean);
      if (firstCard) {
        setCardWidth(firstCard.getBoundingClientRect().width);
      }

      const anchorRect = anchor.getBoundingClientRect();
      const targetX = anchorRect.left + anchorRect.width / 2;
      const targetY = anchorRect.top + anchorRect.height / 2;

      const next: Offset[] = cardRefs.current.map((el) => {
        if (!el) return { dx: 0, dy: 0, rotate: 0 };
        const r = el.getBoundingClientRect();
        const cardCenterX = r.left + r.width / 2;
        const cardCenterY = r.top + r.height / 2;
        return { dx: targetX - cardCenterX, dy: targetY - cardCenterY, rotate: 0 };
      });
      setOffsets(next);
    };

    measure();
    window.addEventListener("resize", measure);

    const grid = gridRef.current;
    const ro = grid ? new ResizeObserver(measure) : null;
    if (grid && ro) ro.observe(grid);

    return () => {
      window.removeEventListener("resize", measure);
      ro?.disconnect();
    };
  }, [hasItems, items.length, serviceId]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    // Fixed pixel track — not tied to full section height (which is much
    // taller on mobile's single-column grid).
    offset: ["start start", `${unstackDistance}px start`],
  });

  const progress = useTransform(scrollYProgress, (v) => clamp(v, 0, 1));

  const layoutReady = offsets !== null && cardWidth > 0;

  return (
    <section
      ref={sectionRef}
      className="relative w-screen max-w-[100vw] ml-[calc(50%-50vw)] bg-cream pt-28 md:pt-36 pb-16 md:pb-24 overflow-hidden"
    >
      <Container>
        {/* Centered Header & Stack Anchor */}
        <div className="mb-16 flex flex-col items-center justify-center text-center md:mb-20">
          {header}

          {/* Invisible anchor where fanned stack forms before unstacking */}
          {hasItems && (
            <div
              ref={anchorRef}
              className="pointer-events-none mt-10 h-[200px] w-40 opacity-0 sm:mt-12 sm:h-[280px] sm:w-48 md:mt-14 md:h-[340px] md:w-64"
              aria-hidden
            />
          )}
        </div>

        {hasItems && (
          <div
            ref={gridRef}
            className={`relative grid gap-3 transition-opacity duration-150 sm:grid-cols-2 md:gap-4 lg:grid-cols-3 ${
              layoutReady ? "opacity-100" : "opacity-0"
            }`}
          >
            {items.map((project, index) => (
              <div
                key={`${serviceId}-${project.name}`}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
              >
                <StackCard
                  index={index}
                  count={items.length}
                  offset={offsets ? offsets[index] : null}
                  fan={fanOffsets[index] ?? { dx: 0, dy: 0, rotate: 0 }}
                  progress={progress}
                  compactStagger={isMobile}
                  isHovered={hovered === index}
                >
                  <PortfolioCard
                    name={project.name}
                    client={project.client}
                    image={project.image}
                    href={project.href}
                    isHovered={hovered === index}
                    isDimmed={hovered !== null && hovered !== index}
                    onHover={() => setHovered(index)}
                    onLeave={() => setHovered(null)}
                    borderless
                  />
                </StackCard>
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
