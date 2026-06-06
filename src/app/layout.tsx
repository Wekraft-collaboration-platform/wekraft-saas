import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
import { ClerkProvider } from "@clerk/nextjs";
import { dark, neobrutalism } from "@clerk/ui/themes";
import { Analytics } from "@vercel/analytics/next";
import { ViewTransition } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ConvexClientProvider } from "@/providers/ConvexClientProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ReferralTracker } from "@/providers/ReferralTracker";
import StructuredData from "@/components/StructuredData";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://wekraft.xyz"),
  title: {
    template: "%s | WeKraft",
    default: "WeKraft | AI-Powered Project Management & Workspace for Modern Software Teams",
  },
  description:
    "WeKraft is the ultimate AI-powered project management platform and collaborative workspace built for modern software teams. Plan sprints, track to-do lists, manage developer capacity, and coordinate complex projects with ease.",
  keywords: [
    "WeKraft",
    "project management",
    "project management platform",
    "PM platform",
    "AI platform",
    "AI project management",
    "AI project management platform",
    "AI project manager",
    "AI PM agent",
    "AI product manager",
    "AI ticketing automation",
    "developer workspace",
    "sprint planning",
    "issue tracker",
    "agile tool",
    "collaboration",
    "team collaboration",
    "git synchronization",
    "VS Code sync",
    "sprints",
  ],
  authors: [{ name: "WeKraft Team" }],
  creator: "WeKraft",
  publisher: "WeKraft",
  alternates: {
    canonical: "https://wekraft.xyz",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "WeKraft | AI-Powered Project Management & Workspace for Modern Software Teams",
    description: "The ultimate AI-powered project management platform and collaborative workspace built for modern software teams. Plan sprints, track to-dos, and manage developer capacity.",
    url: "https://wekraft.xyz",
    siteName: "WeKraft",
    images: [
      {
        url: "/hero.png",
        width: 1200,
        height: 630,
        alt: "WeKraft - Unified Software Team Collaboration Platform",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WeKraft | AI-Powered Project Management & Workspace for Modern Software Teams",
    description: "The ultimate AI-powered project management platform and collaborative workspace built for modern software teams. Plan sprints, track to-dos, and manage developer capacity.",
    images: ["/hero.png"],
  },
  icons: {
    icon: "/logo.svg",
  },
  other: {
    "geo.region": "IN",
    "geo.placename": "India",
    "geo.position": "22.309417;72.136230",
    ICBM: "22.309417, 72.136230",
  },
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://wekraft.xyz/#organization",
  "name": "WeKraft",
  "url": "https://wekraft.xyz",
  "logo": "https://wekraft.xyz/logo.svg",
  "sameAs": [
    "https://github.com/wekraft-collaboration-platform",
    "https://twitter.com/wekraft_xyz"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "support@wekraft.xyz",
    "contactType": "customer support"
  }
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://wekraft.xyz/#website",
  "url": "https://wekraft.xyz",
  "name": "WeKraft",
  "description": "AI-Powered Project Management & Workspace for Modern Software Teams",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://wekraft.xyz/web/docs?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`antialiased ${inter.variable} ${geistMono.variable} font-sans`}>
        <StructuredData data={[orgSchema, websiteSchema]} />
        <ClerkProvider
          appearance={{
            theme: dark,
          }}
        >
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              forcedTheme="dark"
              disableTransitionOnChange
            >
              <ConvexClientProvider>
                <main>
                  <ViewTransition>
                    <ReferralTracker />
                    {children}
                  </ViewTransition>
                </main>
              </ConvexClientProvider>

              <Toaster position="top-right" />
            </ThemeProvider>
          </QueryProvider>
        </ClerkProvider>
        <Analytics />
      </body>
    </html>
  );
}
