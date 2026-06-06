import { MetadataRoute } from "next";
import { allDocs } from "@/lib/docs-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wekraft.xyz";

  // Static marketing & platform routes
  const routes = [
    "",
    "/web",
    "/web/pricing",
    "/web/contact",
    "/web/why-wekraft",
    "/web/docs",
    "/web/wekraft-vs-asana",
    "/web/wekraft-vs-jira",
    "/web/wekraft-vs-linear",
    "/web/wekraft-vs-notion",
    "/web/wekraft-vs-plane",
  ];

  const staticEntries: MetadataRoute.Sitemap = routes.map((route) => {
    // Higher priority for homepage, pricing, why-wekraft and docs index
    let priority = 0.7;
    if (route === "" || route === "/web") {
      priority = 1.0;
    } else if (
      route === "/web/pricing" ||
      route === "/web/docs" ||
      route === "/web/why-wekraft"
    ) {
      priority = 0.9;
    }

    return {
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority,
    };
  });

  // Dynamic documentation sub-pages
  const dynamicDocEntries: MetadataRoute.Sitemap = allDocs.map((doc) => {
    const lastModDate = doc.updated || doc.created || "2026-06-06";
    return {
      url: `${baseUrl}/web/docs/${doc.slug}`,
      lastModified: new Date(lastModDate),
      changeFrequency: "monthly",
      priority: 0.6,
    };
  });

  return [...staticEntries, ...dynamicDocEntries];
}
