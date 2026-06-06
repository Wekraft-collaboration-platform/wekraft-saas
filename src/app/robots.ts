import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wekraft.xyz";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/web", "/web/docs", "/web/pricing", "/web/contact"],
      disallow: ["/api/", "/dashboard/", "/onboard/", "/admin/", "/extension/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
