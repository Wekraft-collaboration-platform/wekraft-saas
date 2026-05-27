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
  title: {
    template: "%s | Wekraft",
    default: "Wekraft | Unified Software Team Collaboration Platform",
  },
  description:
    "Wekraft is the all-in-one workspace for software teams. Manage tasks, issues, sprints, and team capacity with AI-powered insights and deep VS Code integration.",
  keywords: [
    "project management",
    "software development",
    "collaboration",
    "sprints",
    "AI project manager",
    "VS Code extension",
  ],
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
