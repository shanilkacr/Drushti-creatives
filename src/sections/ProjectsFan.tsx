"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import Container from "@/components/Container";
import { Burst } from "@/components/HeroShapes";
import PillButton from "@/components/PillButton";
import { EASE } from "@/lib/motion";
import type { Project } from "@/lib/content/types";

/** Continuously sliding row of project cards — same marquee mechanic as the
 *  client-logo strip in OurClients (duplicated list + CSS `animate-marquee`),
 *  just with bigger card slots and a pause-on-hover. */
function ProjectsMarquee({ projects }: { projects: Project[] }) {
  const [paused, setPaused] = useState(false);

  return (
    <div
      className="overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={`flex w-max items-center gap-6 animate-marquee ${
          paused ? "animate-marquee-paused" : ""
        }`}
        style={{ animationDuration: "40s" }}
      >
        {[...projects, ...projects].map((project, i) => {
          const image = project.featuredImageCard ?? project.featuredImage;
          return (
            <div
              key={`${project.slug}-${i}`}
              className="relative aspect-[4/3] w-[280px] shrink-0 overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-ink/10 sm:w-[380px]"
            >
              <Image
                src={image}
                alt={project.name}
                fill
                sizes="(max-width: 640px) 280px, 380px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-ink/10" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Home page: featured projects as a continuously sliding strip, with a
 *  "View our work" button below linking through to the full portfolio. */
export default function ProjectsFan({ projects }: { projects: Project[] }) {
  const cards = projects.slice(0, 9);
  if (cards.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-cream py-20 sm:py-28">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-6 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.32em] text-ink sm:mb-10"
        >
          <Burst className="h-4 w-4 text-orange" />
          Projects
        </motion.div>
      </Container>

      <ProjectsMarquee projects={cards} />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
        className="mt-10 flex justify-center sm:mt-14"
      >
        <PillButton href="/portfolio">View our work</PillButton>
      </motion.div>
    </section>
  );
}
