"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, type MotionValue } from "motion/react";
import Container from "@/components/Container";
import { Burst } from "@/components/HeroShapes";

import { EASE } from "@/lib/motion";

/** Even 9-petal flower, local to this badge only — not the shared
 *  ScallopBadge (which stays untouched for the Hero/CTA buttons). */

function ClientMarquee({ logos }: { logos: string[] }) {
  const [paused, setPaused] = useState(false);

  return (
    <div
      className="overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={`flex w-max items-center gap-6 animate-marquee ${paused ? "animate-marquee-paused" : ""
          }`}
      >
        {[...logos, ...logos].map((src, i) => (
          // Fixed slot per logo so portrait, landscape, and square marks
          // normalize to a similar visual footprint in the marquee.
          <div
            key={i}
            className="relative h-24 w-40 shrink-0 sm:h-28 sm:w-44"
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="176px"
              className="object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

type OurClientsProps = {
  /** Scroll-driven opacity (1 → 0) passed from ClientAboutCurtain. */
  contentFadeOpacity?: MotionValue<number>;
  clientLogos: string[];
};

export default function OurClients({ contentFadeOpacity, clientLogos }: OurClientsProps) {
  return (
    <section className="sticky top-0 z-0 flex min-h-[80dvh] flex-col justify-center bg-white py-28">
      <Container>
        <motion.div
          style={contentFadeOpacity ? { opacity: contentFadeOpacity } : undefined}
        >
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mb-10 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.32em] text-ink"
          >
            <Burst className="h-4 w-4 text-orange" />
            Our clients
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="relative max-w-3xl"
          >
            <h2 className="max-w-3xl font-heading text-heading-4xl leading-heading text-ink sm:text-heading-5xl lg:text-heading-6xl">
              We believe every great business deserves a voice as strong as its vision.
            </h2>
            <p className="mt-6 text-ink/65">More than a service provider, we are your strategic partner. We combine creativity, strategy, and digital
              expertise to help your business stand out. We strip away the noise to find the heart of your message, crafting visuals and narratives that don’t just look good. They actually move people.</p>
          </motion.div>

          <div className="mt-20">
            <ClientMarquee logos={clientLogos} />
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
