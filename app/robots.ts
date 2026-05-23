import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // No disallows. Crawlers and LLM ingestion are explicitly welcome
        // per the dual-audience principle in CLAUDE.md.
      },
    ],
    sitemap: "https://rutgertuit.nl/sitemap.xml",
    host: "https://rutgertuit.nl",
  };
}
