import type { Client, Project, ServiceCategory, TeamMember } from "@/lib/content/types";
import { projectHref } from "@/lib/content/types";
import { getPayload } from "payload";
import config from "@payload-config";
import type { Portfolio, Client as PayloadClient, Media as PayloadMedia, Team as PayloadTeam } from "@/payload-types";

type MediaDoc = PayloadMedia;
type ClientDoc = PayloadClient;
type TeamDoc = PayloadTeam;
type PortfolioDoc = Portfolio;

function resolveMediaUrl(media: number | MediaDoc | null | undefined): string {
  if (!media || typeof media === "number") return "";
  return media.url ?? "";
}

function resolveMediaCardUrl(media: number | MediaDoc | null | undefined): string {
  if (!media || typeof media === "number") return "";
  return media.sizes?.card?.url ?? media.sizes?.large?.url ?? media.url ?? "";
}

function mapClientDoc(doc: ClientDoc): Client {
  return {
    slug: doc.slug,
    name: doc.name,
    logoSquare: resolveMediaUrl(doc.logoSquare),
    logoFocus: resolveMediaUrl(doc.logoFocus),
  };
}

function mapTeamDoc(doc: TeamDoc): TeamMember {
  return {
    name: doc.name,
    designation: doc.designation,
    photo: resolveMediaUrl(doc.photo),
    sortOrder: doc.sortOrder ?? 0,
  };
}

function mapPortfolioDoc(doc: PortfolioDoc): Project {
  const clientDoc = doc.client && typeof doc.client !== "number" ? (doc.client as ClientDoc) : null;
  const clientName = clientDoc?.name ?? "";
  const clientSlug = clientDoc?.slug ?? "";

  const tags = (doc.tags ?? [])
    .map((tag) => (typeof tag === "number" ? null : tag?.name))
    .filter((tag): tag is string => Boolean(tag));

  const images = (doc.images ?? [])
    .map((row) => resolveMediaUrl(row.image))
    .filter(Boolean);

  const strategy =
    doc.strategy?.intro || (doc.strategy?.points?.length ?? 0) > 0
      ? {
          intro: doc.strategy?.intro ?? "",
          points: (doc.strategy?.points ?? []).map((point) => ({
            title: point.title ?? "",
            text: point.text ?? "",
          })),
        }
      : undefined;

  return {
    slug: doc.slug,
    name: doc.name,
    client: clientName,
    clientSlug,
    clientLogoSquare: resolveMediaUrl(clientDoc?.logoSquare),
    clientLogoFocus: resolveMediaUrl(clientDoc?.logoFocus),
    description: doc.description ?? "",
    tags,
    serviceCategory: (doc.serviceCategory ?? "Social Media & Digital Marketing") as ServiceCategory,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    featuredImage: resolveMediaUrl(doc.featuredImage),
    featuredImageCard: resolveMediaCardUrl(doc.featuredImage) || undefined,
    images,
    featuredOnHero: doc.featuredOnHero ?? false,
    featuredOnHomepage: doc.featuredOnHomepage ?? false,
    challenge: doc.challenge ?? "",
    strategy,
    results: (doc.results ?? []).map((result) => ({
      metric: result.metric ?? undefined,
      text: result.text ?? "",
    })),
    href: doc.externalUrl?.trim() || projectHref(doc.slug),
    isExternal: Boolean(doc.externalUrl?.trim()),
  };
}

async function getPayloadClient() {
  return getPayload({ config });
}

export async function fetchProjects(): Promise<Project[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "portfolio",
    limit: 100,
    depth: 2,
    sort: "-updatedAt",
  });
  return result.docs.map(mapPortfolioDoc);
}

export async function fetchProjectBySlug(slug: string): Promise<Project | undefined> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "portfolio",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  });
  const doc = result.docs[0];
  return doc ? mapPortfolioDoc(doc) : undefined;
}

/** Single query covering both the homepage-featured and hero-featured sets —
 *  callers split the result by flag. Replaces two separate depth:2 queries
 *  against the same collection (each fetching up to 100 fully-populated
 *  docs) with one, cut down to a realistic homepage-sized limit. */
export async function fetchHomepageAndHeroFeaturedProjects(): Promise<Project[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "portfolio",
    where: {
      or: [{ featuredOnHomepage: { equals: true } }, { featuredOnHero: { equals: true } }],
    },
    limit: 50,
    depth: 2,
    sort: "-updatedAt",
  });
  return result.docs.map(mapPortfolioDoc);
}

export async function fetchProjectsForServiceId(serviceId: string): Promise<Project[]> {
  const all = await fetchProjects();
  const { SERVICE_CATEGORY_TO_ID } = await import("@/lib/content/types");
  return all.filter((p) => SERVICE_CATEGORY_TO_ID[p.serviceCategory] === serviceId);
}

export async function fetchPortfolioSlugs(): Promise<string[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "portfolio",
    limit: 100,
    depth: 0,
  });
  return result.docs.map((doc) => doc.slug);
}

export async function fetchClients(): Promise<Client[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "clients",
    limit: 100,
    depth: 1,
    sort: "name",
  });
  return result.docs.map(mapClientDoc);
}

export async function fetchTeamMembers(): Promise<TeamMember[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "team",
    limit: 100,
    depth: 1,
    sort: "sortOrder",
  });
  return result.docs.map(mapTeamDoc);
}
