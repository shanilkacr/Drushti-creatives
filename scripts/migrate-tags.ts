/**
 * migrate-tags.ts
 *
 * One-time migration: moves legacy free-text portfolio tags into a Tags
 * collection with portfolio relationship links.
 *
 * Usage:  npm run migrate-tags
 *
 * Legacy: requires a local SQLite payload.db and the sqlite3 CLI.
 * Do not run against Supabase/Postgres — use only for old SQLite databases.
 */

import "dotenv/config";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";

import { STATIC_PROJECTS } from "../src/data/staticProjects";
import config from "../src/payload.config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

function slugifyTagName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function runSql(dbPath: string, sql: string): string {
  return execSync(`sqlite3 "${dbPath}"`, {
    encoding: "utf-8",
    input: `${sql.trim()};\n`,
  }).trim();
}

function tableExists(dbPath: string, table: string): boolean {
  const result = runSql(
    dbPath,
    `SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='${table}'`,
  );
  return Number(result) > 0;
}

function readLegacyPortfolioTags(dbPath: string): Map<number, string[]> {
  if (!tableExists(dbPath, "portfolio_tags")) return new Map();

  const output = runSql(
    dbPath,
    "SELECT _parent_id, tag FROM portfolio_tags WHERE tag IS NOT NULL AND tag != '' ORDER BY _parent_id, _order",
  );

  const map = new Map<number, string[]>();
  for (const line of output.split("\n")) {
    if (!line) continue;
    const separator = line.indexOf("|");
    if (separator === -1) continue;
    const parentId = Number(line.slice(0, separator));
    const tag = line.slice(separator + 1).trim();
    if (!tag || Number.isNaN(parentId)) continue;
    const existing = map.get(parentId) ?? [];
    existing.push(tag);
    map.set(parentId, existing);
  }
  return map;
}

function applySchema(dbPath: string) {
  if (!tableExists(dbPath, "tags")) {
    runSql(
      dbPath,
      `CREATE TABLE tags (
        id integer PRIMARY KEY NOT NULL,
        name text NOT NULL,
        slug text NOT NULL,
        updated_at text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
        created_at text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
      )`,
    );
    runSql(dbPath, "CREATE UNIQUE INDEX tags_name_idx ON tags (name)");
    runSql(dbPath, "CREATE UNIQUE INDEX tags_slug_idx ON tags (slug)");
    runSql(dbPath, "CREATE INDEX tags_updated_at_idx ON tags (updated_at)");
    runSql(dbPath, "CREATE INDEX tags_created_at_idx ON tags (created_at)");
    console.log("Created tags table.");
  }

  if (!tableExists(dbPath, "portfolio_rels")) {
    runSql(
      dbPath,
      `CREATE TABLE portfolio_rels (
        id integer PRIMARY KEY NOT NULL,
        "order" integer,
        parent_id integer NOT NULL,
        path text NOT NULL,
        tags_id integer,
        FOREIGN KEY (parent_id) REFERENCES portfolio(id) ON UPDATE no action ON DELETE cascade,
        FOREIGN KEY (tags_id) REFERENCES tags(id) ON UPDATE no action ON DELETE cascade
      )`,
    );
    runSql(dbPath, 'CREATE INDEX portfolio_rels_order_idx ON portfolio_rels ("order")');
    runSql(dbPath, "CREATE INDEX portfolio_rels_parent_idx ON portfolio_rels (parent_id)");
    runSql(dbPath, "CREATE INDEX portfolio_rels_path_idx ON portfolio_rels (path)");
    runSql(dbPath, "CREATE INDEX portfolio_rels_tags_id_idx ON portfolio_rels (tags_id)");
    console.log("Created portfolio_rels table.");
  }

  const lockedRelsColumns = runSql(dbPath, "PRAGMA table_info(payload_locked_documents_rels)");
  if (!lockedRelsColumns.includes("|tags_id|")) {
    runSql(dbPath, "ALTER TABLE payload_locked_documents_rels ADD COLUMN tags_id integer REFERENCES tags(id)");
    runSql(
      dbPath,
      "CREATE INDEX payload_locked_documents_rels_tags_id_idx ON payload_locked_documents_rels (tags_id)",
    );
    console.log("Added tags_id to payload_locked_documents_rels.");
  }
}

async function ensureTag(
  payload: Awaited<ReturnType<typeof getPayload>>,
  name: string,
  cache: Map<string, number>,
): Promise<number | null> {
  const cached = cache.get(name);
  if (cached !== undefined) return cached;

  const slug = slugifyTagName(name);
  const existing = await payload.find({
    collection: "tags",
    where: {
      or: [{ name: { equals: name } }, { slug: { equals: slug } }],
    },
    limit: 1,
  });

  if (existing.docs[0]) {
    cache.set(name, existing.docs[0].id);
    return existing.docs[0].id;
  }

  const created = await payload.create({
    collection: "tags",
    data: { name, slug },
  });

  cache.set(name, created.id);
  console.log(`Created tag: ${name}`);
  return created.id;
}

async function linkPortfolioTags(
  payload: Awaited<ReturnType<typeof getPayload>>,
  legacyTagsByPortfolioId: Map<number, string[]>,
) {
  const tagIdByName = new Map<string, number>();
  let tagsCreated = 0;
  let portfoliosUpdated = 0;

  const portfolios = await payload.find({
    collection: "portfolio",
    limit: 500,
    depth: 0,
  });
  const portfolioById = new Map(portfolios.docs.map((doc) => [doc.id, doc]));

  const assignments = new Map<number, string[]>();

  if (legacyTagsByPortfolioId.size > 0) {
    for (const [portfolioId, tagNames] of legacyTagsByPortfolioId) {
      if (portfolioById.has(portfolioId)) {
        assignments.set(portfolioId, tagNames);
      }
    }
  } else {
    for (const project of STATIC_PROJECTS) {
      if (project.tags.length === 0) continue;
      const portfolio = portfolios.docs.find((doc) => doc.slug === project.slug);
      if (portfolio) assignments.set(portfolio.id, project.tags);
    }
  }

  for (const tagNames of assignments.values()) {
    for (const name of tagNames) {
      const before = tagIdByName.size;
      await ensureTag(payload, name, tagIdByName);
      if (tagIdByName.size > before) tagsCreated++;
    }
  }

  for (const [portfolioId, tagNames] of assignments) {
    const tagIds: number[] = [];
    for (const name of tagNames) {
      const id = tagIdByName.get(name);
      if (id !== undefined) tagIds.push(id);
    }

    await payload.update({
      collection: "portfolio",
      id: portfolioId,
      data: { tags: tagIds },
    });
    portfoliosUpdated++;
  }

  return { tagsCreated, portfoliosUpdated };
}

async function migrate() {
  const dbPath =
    process.env.DATABASE_URL?.replace(/^file:/, "") ??
    path.join(rootDir, "payload.db");
  const resolvedDbPath = path.isAbsolute(dbPath) ? dbPath : path.join(rootDir, dbPath);

  const legacyTagsByPortfolioId = readLegacyPortfolioTags(resolvedDbPath);
  console.log(`Found legacy tag data for ${legacyTagsByPortfolioId.size} portfolio items.`);

  applySchema(resolvedDbPath);

  if (legacyTagsByPortfolioId.size > 0) {
    runSql(resolvedDbPath, "DROP TABLE IF EXISTS portfolio_tags");
    console.log("Dropped legacy portfolio_tags table.");
  }

  const payload = await getPayload({ config });
  const { tagsCreated, portfoliosUpdated } = await linkPortfolioTags(
    payload,
    legacyTagsByPortfolioId,
  );

  const tags = await payload.find({ collection: "tags", limit: 200, sort: "name" });
  const sample = await payload.find({
    collection: "portfolio",
    limit: 1,
    depth: 1,
    where: { slug: { equals: "uber-rides-social-media" } },
  });

  console.log(`Verified ${tags.totalDocs} tags in CMS.`);
  if (sample.docs[0]) {
    const sampleTags = (sample.docs[0].tags ?? [])
      .map((tag) => (typeof tag === "number" ? null : tag?.name))
      .filter(Boolean);
    console.log(
      `Sample portfolio "${sample.docs[0].slug}" tags: ${sampleTags.join(", ") || "(none)"}`,
    );
  }

  console.log("Migration complete.");
  console.log(`  Tags created: ${tagsCreated}`);
  console.log(`  Portfolios updated: ${portfoliosUpdated}`);
  process.exit(0);
}

migrate().catch((error) => {
  console.error(error);
  process.exit(1);
});
