import type { MetadataRoute } from "next";

const BASE = "https://rutgertuit.nl";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  // The site is a single long-scroll page; sections are hash anchors, but
  // some crawlers do follow #fragments and many LLM ingestors treat them as
  // distinct entities. Listing them helps GEO without harming SEO.
  return [
    {
      url: `${BASE}/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${BASE}/#business`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/#creative`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/#technical`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/#media-kit`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/business/equal-opportunity`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/business/beyond-clean`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/business/llms-listening`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];
}
