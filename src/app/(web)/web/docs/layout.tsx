"use client";

import { docsConfig } from "@/lib/docs-config";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, ChevronRight, BookOpen, Terminal, Layers, Zap, Calendar, Users, BarChart3, Clock, Settings, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const iconMap: { [key: string]: any } = {
  Overview: BookOpen,
  "VS Code Extension": Terminal,
  Projects: Layers,
  Tasks: Zap,
  Issues: Zap,
  Sprints: Zap,
  "Time Logs": Clock,
  Calendar: Calendar,
  "Team Space": Users,
  Heatmaps: BarChart3,
  "Manage Teams": Settings,
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-full w-72 border-r border-sidebar-border bg-sidebar lg:block">
        <div className="flex h-full flex-col p-6">
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.svg" alt="Wekraft Logo" width={28} height={28} />
              <span className="text-lg font-bold tracking-tight text-sidebar-foreground">Wekraft</span>
            </Link>
            
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-lg p-2 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}
          </div>

          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <nav className="flex-1 space-y-6 overflow-y-auto pr-2">
            {Object.entries(docsConfig).map(([category, items]) => (
              <div key={category}>
                <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {category}
                </h3>
                <ul className="space-y-1">
                  {items.map((item) => {
                    const Icon = iconMap[item.title] || BookOpen;
                    const isActive = pathname === `/web/docs/${item.slug}`;
                    return (
                      <li key={item.slug}>
                        <Link
                          href={`/web/docs/${item.slug}`}
                          className={cn(
                            "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                            isActive 
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                          )}
                        >
                          <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground/60")} />
                          <span>{item.title}</span>
                          {isActive && <ChevronRight className="ml-auto h-3 w-3" />}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:pl-72">
        <div className="mx-auto max-w-4xl px-6 py-12 lg:px-12">
          {children}
        </div>
      </main>
    </div>
  );
}
