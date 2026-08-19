import type { CollectionConfig } from "payload";

import { SERVICE_CATEGORIES } from "@/lib/content/types";

export const Portfolio: CollectionConfig = {
  slug: "portfolio",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "client", "serviceCategory", "featuredOnHomepage", "updatedAt"],
  },
  timestamps: true,
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "client",
      type: "relationship",
      relationTo: "clients",
    },
    { name: "description", type: "textarea" },
    {
      name: "externalUrl",
      type: "text",
      label: "External live URL (optional)",
      admin: {
        description:
          "If set, the portfolio card links out to this URL (opens in a new tab) instead of the internal project detail page.",
      },
    },
    {
      name: "serviceCategory",
      type: "select",
      options: SERVICE_CATEGORIES.map((value) => ({ label: value, value })),
    },
    {
      name: "tags",
      type: "relationship",
      relationTo: "tags",
      hasMany: true,
      admin: {
        description: "Select existing tags or create a new one.",
      },
    },
    {
      name: "featuredImage",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "images",
      type: "array",
      label: "Gallery images",
      fields: [{ name: "image", type: "upload", relationTo: "media" }],
    },
    {
      type: "row",
      fields: [
        { name: "featuredOnHero", type: "checkbox", label: "Featured on hero", defaultValue: false },
        { name: "featuredOnHomepage", type: "checkbox", label: "Featured on homepage", defaultValue: false },
      ],
    },
    { name: "challenge", type: "textarea" },
    {
      name: "strategy",
      type: "group",
      fields: [
        { name: "intro", type: "textarea" },
        {
          name: "points",
          type: "array",
          fields: [
            { name: "title", type: "text" },
            { name: "text", type: "textarea" },
          ],
        },
      ],
    },
    {
      name: "results",
      type: "array",
      fields: [
        { name: "metric", type: "text" },
        { name: "text", type: "text" },
      ],
    },
  ],
};
