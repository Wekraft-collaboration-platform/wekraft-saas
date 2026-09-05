import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WeKraft",
    short_name: "WeKraft",
    description: "The next-generation AI-powered project management platform and collaborative developer workspace.",
    start_url: "/web",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#2563eb",
    icons: [
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
