import React from "react";
import type { Metadata } from "next";
import StructuredData from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "About WeKraft | The Unified Developer Command Center",
  description: "Discover WeKraft's vision, team, and E-E-A-T credentials as the unified, AI-native collaboration platform for agile development.",
  alternates: {
    canonical: "https://wekraft.xyz/web/about",
  },
};

const aboutSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": "https://wekraft.xyz/web/about/#aboutpage",
  "url": "https://wekraft.xyz/web/about",
  "name": "About WeKraft",
  "description": "Learn about the mission, engineering team, and core values of WeKraft, a unified workspace for project planning, code synchronizations, and team collaboration.",
  "publisher": {
    "@type": "Organization",
    "name": "WeKraft",
    "url": "https://wekraft.xyz",
    "logo": {
      "@type": "ImageObject",
      "url": "https://wekraft.xyz/logo.svg"
    }
  },
  "mainEntity": {
    "@type": "Organization",
    "name": "WeKraft",
    "description": "A high-performance SaaS platform combining task planning, VS Code integration, real-time audio/video calls, and autonomous AI product managers/dev agents.",
    "url": "https://wekraft.xyz",
    "sameAs": [
      "https://github.com/wekraft-saas",
      "https://twitter.com/wekraft_hq"
    ]
  }
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StructuredData data={aboutSchema} />
      {children}
    </>
  );
}
