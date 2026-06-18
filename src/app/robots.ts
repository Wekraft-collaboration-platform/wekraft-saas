import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wekraft.xyz";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/llms.txt", "/llms-full.txt"],
      disallow: ["/api/", "/dashboard/", "/onboard/", "/admin/", "/extension/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
