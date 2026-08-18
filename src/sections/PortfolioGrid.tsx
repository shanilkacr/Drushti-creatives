"use client";

import { useEffect, useMemo, useState } from "react";
import PortfolioCard from "@/components/PortfolioCard";
import Tag from "@/components/Tag";
import { SERVICE_CATEGORY_TO_ID, type Project } from "@/lib/content/types";

const ALL_FILTER = "All";

function getUniqueTags(projects: Project[]): string[] {
  const tags = new Set<string>();
  for (const project of projects) {
    for (const tag of project.tags) {
      tags.add(tag);
    }
  }
  return Array.from(tags).sort();
}

function filterByService(projects: Project[], serviceFilterId: string | null): Project[] {
  if (!serviceFilterId) return projects;
  return projects.filter(
    (project) => SERVICE_CATEGORY_TO_ID[project.serviceCategory] === serviceFilterId,
  );
}

export default function PortfolioGrid({
  projects,
  serviceFilterId = null,
}: {
  projects: Project[];
  serviceFilterId?: string | null;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState(ALL_FILTER);

  const serviceFilteredProjects = useMemo(
    () => filterByService(projects, serviceFilterId),
    [projects, serviceFilterId],
  );

  // Reset tag filter when the hero service selection changes.
  useEffect(() => {
    setActiveFilter(ALL_FILTER);
  }, [serviceFilterId]);

  const filters = useMemo(
    () => [ALL_FILTER, ...getUniqueTags(serviceFilteredProjects)],
    [serviceFilteredProjects],
  );

  const filteredProjects = useMemo(() => {
    if (activeFilter === ALL_FILTER) return serviceFilteredProjects;
    return serviceFilteredProjects.filter((project) => project.tags.includes(activeFilter));
  }, [activeFilter, serviceFilteredProjects]);

  return (
    <>
      <section className="bg-cream">
        <div className="p-2">
          {/* Filter bar is desktop/tablet only — on mobile it just ate space
              above the cards without adding much value at that width. */}
          <div className="sticky top-[var(--services-sticky-offset,5rem)] z-20 -mx-2 hidden bg-cream px-2 py-5 sm:block">
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <Tag
                    key={filter}
                    size="lg"
                    onClick={() => setActiveFilter(filter)}
                    className={isActive ? "bg-ink text-white" : undefined}
                  >
                    {filter === ALL_FILTER ? "Show all" : filter}
                  </Tag>
                );
              })}
            </div>
          </div>

          <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project, index) => (
              <PortfolioCard
                key={project.slug}
                name={project.name}
                client={project.client}
                image={project.featuredImageCard ?? project.featuredImage}
                href={project.href}
                isHovered={hovered === index}
                isDimmed={hovered !== null && hovered !== index}
                onHover={() => setHovered(index)}
                onLeave={() => setHovered(null)}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
