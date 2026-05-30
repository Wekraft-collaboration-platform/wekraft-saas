import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark, neobrutalism } from "@clerk/ui/themes";
import { Analytics } from "@vercel/analytics/next";
import { ViewTransition } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ConvexClientProvider } from "@/providers/ConvexClientProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://wekraft.xyz"),
  title: {
    template: "%s | Wekraft",
    default: "Wekraft | AI-Powered Project Management & Workspace for Modern Software Teams",
  },
  description:
    "Wekraft is the ultimate AI-powered project management platform and collaborative workspace built for modern software teams. Plan sprints, track to-do lists, manage developer capacity, and coordinate complex projects with ease.",
  keywords: [
    "Wekraft",
    "project management",
    "project management platform",
    "PM platform",
    "AI platform",
    "AI project management",
    "to-do app",
    "task manager",
    "to-do list for teams",
    "modern teams",
    "software development",
    "collaboration",
    "sprints",
    "AI project manager",
    "VS Code extension",
    "sprint planning",
    "team collaboration",
    "developer workspace",
    "issue tracker",
    "agile tool",
  ],
  authors: [{ name: "Wekraft Team" }],
  creator: "Wekraft",
  publisher: "Wekraft",
  alternates: {
    canonical: "/",
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
    title: "Wekraft | AI-Powered Project Management & Workspace for Modern Software Teams",
    description: "The ultimate AI-powered project management platform and collaborative workspace built for modern software teams. Plan sprints, track to-dos, and manage developer capacity.",
    url: "https://wekraft.xyz",
    siteName: "Wekraft",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Wekraft - Unified Software Team Collaboration Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wekraft | AI-Powered Project Management & Workspace for Modern Software Teams",
    description: "The ultimate AI-powered project management platform and collaborative workspace built for modern software teams. Plan sprints, track to-dos, and manage developer capacity.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/logo.svg",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`antialiased font-sans`}>
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
                  <ViewTransition>{children}</ViewTransition>
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
