import HeroLive from "@/components/Hero";
import { HeroHeadline } from "@/components/HeroHeadline";
import { HeroImagePreloads } from "@/components/HeroImagePreloads";
import Services from "@/sections/Services";
import FeaturedWork from "@/sections/FeaturedWork";
import ProjectsFan from "@/sections/ProjectsFan";
import ClientAboutCurtain from "@/sections/ClientAboutCurtain";
import WorkProcess from "@/sections/WorkProcess";
import Testimonials from "@/sections/Testimonials";
import {
  getFeaturedHomepageProjects,
  getHeroFeaturedProjects,
} from "@/lib/content/portfolio";
import { getClients } from "@/lib/content/clients";
import { getMarqueeClientLogos } from "@/lib/content/client-utils";
import { buildFloatingImageConfigs, getInitialFocusImageSrcs } from "@/lib/content/floatingImages";

export const revalidate = 60;

export default async function Home() {
  const [featuredProjects, heroProjects, clients] = await Promise.all([
    getFeaturedHomepageProjects(),
    getHeroFeaturedProjects(),
    getClients(),
  ]);
  const floatingImages = buildFloatingImageConfigs(heroProjects);
  const initialFocusImageSrcs = getInitialFocusImageSrcs(floatingImages);
  const clientLogos = getMarqueeClientLogos(clients);

  return (
    <main>
      {initialFocusImageSrcs.length > 0 ? (
        <HeroImagePreloads srcs={initialFocusImageSrcs} />
      ) : null}
      <HeroLive floatingImages={floatingImages}>
        <HeroHeadline />
      </HeroLive>
      <ProjectsFan projects={featuredProjects} />
      <ClientAboutCurtain clientLogos={clientLogos} />
      <Services />
      <WorkProcess />
      <FeaturedWork projects={featuredProjects} />
      <Testimonials clients={clients} />
    </main>
  );
}
