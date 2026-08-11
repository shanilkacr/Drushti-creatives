"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import PillButton from "@/components/PillButton";
import type { TeamMember } from "@/lib/content/types";

const EASE = [0.22, 1, 0.36, 1] as const;

// Brand palette used for each card's frame fill, cycled across members.
// Blue/sky are excluded here since the section background is now blue —
// using them for the frames too would blend in instead of standing out.
const FRAME_COLORS = ["bg-sky", "bg-yellow", "bg-green"] as const;

type TeamCardMember = TeamMember & { frameColor: (typeof FRAME_COLORS)[number] };

function withFrameColors(members: TeamMember[]): TeamCardMember[] {
  return members.map((member, index) => ({
    ...member,
    frameColor: FRAME_COLORS[index % FRAME_COLORS.length],
  }));
}

function LinkedInIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-label="LinkedIn">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

function TeamCard({
  member,
  className = "",
}: {
  member: TeamCardMember;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);

  // Pointer-driven wobble: the photo tilts/shifts inside its frame following
  // the cursor, smoothed with springs (traced from the reference).
  const px = useMotionValue(0); // -0.5 .. 0.5
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 90, damping: 12, mass: 0.5 });
  const sy = useSpring(py, { stiffness: 90, damping: 12, mass: 0.5 });

  const imgX = useTransform(sx, (v) => v * 18);
  const imgY = useTransform(sy, (v) => v * 18);
  const rotate = useTransform(sx, (v) => v * 5);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || prefersReducedMotion) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      px.set((e.clientX - rect.left) / rect.width - 0.5);
      py.set((e.clientY - rect.top) / rect.height - 0.5);
    };
    const onLeave = () => {
      px.set(0);
      py.set(0);
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [prefersReducedMotion, px, py]);

  return (
    <div ref={cardRef} className={`relative w-full max-w-48 sm:w-56 ${className}`}>
      {/* The ENTIRE card wobbles as one unit — photo, blurred glow, and
          the name/role/LinkedIn text block below it. Mouse listeners stay
          on the outer, untransformed cardRef div above — if they lived on
          this moving element instead, its own motion would keep shifting
          the getBoundingClientRect() used to calculate the pointer offset,
          feeding back into itself. */}
      <motion.div
        style={
          prefersReducedMotion
            ? undefined
            : { x: imgX, y: imgY, rotate }
        }
        className={`relative overflow-hidden rounded-2xl p-3 ${member.frameColor}`}
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl">
          <Image src={member.photo} alt={member.name} fill className="object-cover" />
        </div>

        {/* Name / role / LinkedIn — inside the blurred frame */}
        <div className="relative flex items-start justify-between gap-3 pt-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-white">{member.name}</p>
            <p className="mt-0.5 text-xs text-white/50">{member.designation}</p>
          </div>
          <span className="pt-0.5 text-white/40">
            <LinkedInIcon />
          </span>
        </div>
      </motion.div>
    </div>
  );
}

/** Team section, split by breakpoint:
 *  - below md: heading + CTA sit at the top of the section in normal flow
 *    (no pinning). Below them, members sit in a 2-column grid — pairs
 *    side by side, with a trailing odd member centered alone on its own
 *    row — each fading/sliding in as it scrolls into view.
 *  - md and up: the original pinned dark screen with a centered heading +
 *    CTA, while two columns of member cards float up past it, driven by
 *    scroll (unchanged).
 */
export default function TeamSection({ members }: { members: TeamMember[] }) {
  const team = withFrameColors(members);
  const leftColumn = team.filter((_, index) => index % 2 === 0);
  const rightColumn = team.filter((_, index) => index % 2 === 1);

  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Travel ranges: columns start already on-screen (matching the reference
  // position at load) and stream further up past the pinned heading as the
  // user scrolls — right column stays staggered behind the left so cards arrive
  // at different times instead of in lockstep. Start values sit below the
  // fixed header (~10vh) so cards never slide under it.
  const leftY = useTransform(scrollYProgress, [0, 1], ["14vh", "-90vh"]);
  const rightY = useTransform(scrollYProgress, [0, 1], ["22vh", "-50vh"]);

  // Whether this member's row has a partner — the last member in an odd-
  // sized team has none, so it gets centered and spans both grid columns.
  const isLastOdd = (index: number) => team.length % 2 === 1 && index === team.length - 1;

  return (
    <section ref={sectionRef} className="relative bg-blue">
      {/* Below md: heading at top, members in a 2-up grid */}
      <div className="px-6 py-24 sm:py-32 md:hidden">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
          <h1 className="max-w-xs font-heading text-heading-hero-half leading-heading-display tracking-tight text-white">
            We build the voice your vision deserves.
          </h1>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
          >
            <PillButton href="#contact" variant="onColor">
              Meet team
            </PillButton>
          </motion.div>
        </div>

        <div className="mx-auto mt-16 grid max-w-sm grid-cols-2 place-items-center gap-x-4 gap-y-10">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              className={isLastOdd(index) ? "col-span-2" : undefined}
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 48 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, ease: EASE, delay: (index % 2) * 0.1 }}
            >
              <TeamCard member={member} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* md and up: original pinned scroll-parallax layout, unchanged */}
      <div className="relative hidden h-[150vh] md:block">
        <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
          {/* Pinned center content */}
          <div className="relative z-20 flex flex-col items-center gap-6 px-6 text-center">
            <h1 className="max-w-md font-heading text-heading-hero-half leading-heading-display tracking-tight text-white lg:max-w-3xl xl:max-w-4xl">
              We build the voice your vision deserves.
            </h1>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
            >
              <PillButton href="#contact" variant="onColor">
                Meet team
              </PillButton>
            </motion.div>
          </div>

          {prefersReducedMotion ? (
            /* Static fallback: simple grid under the heading */
            <div className="absolute inset-x-0 bottom-8 z-20 flex flex-wrap justify-center gap-6 px-6">
              {team.slice(0, 3).map((member) => (
                <TeamCard key={member.name} member={member} />
              ))}
            </div>
          ) : (
            <>
              {/* Cards float up past the pinned heading, in front of it */}
              <motion.div
                style={{ y: leftY }}
                className="absolute left-[3%] top-0 z-10 flex flex-col gap-[26vh] md:left-[4%] xl:left-[6%]"
              >
                {leftColumn.map((member) => (
                  <TeamCard key={member.name} member={member} />
                ))}
              </motion.div>
              <motion.div
                style={{ y: rightY }}
                className="absolute right-[3%] top-0 z-10 flex flex-col gap-[26vh] md:right-[4%] xl:right-[6%]"
              >
                {rightColumn.map((member) => (
                  <TeamCard key={member.name} member={member} />
                ))}
              </motion.div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
