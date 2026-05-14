import Link from "next/link";
import { docsConfig } from "@/lib/docs-config";
import {
  BookOpen, Terminal, Layers, CheckSquare, AlertCircle,
  Zap, Clock, Calendar, Users, BarChart3, Settings,
  ArrowRight,
} from "lucide-react";

const iconMap: { [key: string]: any } = {
  BookOpen, Terminal, Layers, CheckSquare, AlertCircle,
  Zap, Clock, Calendar, Users, BarChart3, Settings,
};

const badgeColors: Record<string, string> = {
  New: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  Updated: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  Beta: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
};

const categoryIcons: Record<string, any> = {
  "Getting Started": BookOpen,
  "Core Features": Zap,
  "Advanced Tools": BarChart3,
};

export default function DocsIndexPage() {
  const allItems = Object.values(docsConfig).flat();
  const popularSlugs = ["overview", "extension", "tasks", "sprints"];
  const popularItems = popularSlugs.map((s) => allItems.find((d) => d.slug === s)!).filter(Boolean);

  return (
    <div className="max-w-3xl">
      {/* Hero */}
      <div className="mb-14">
        <div className="inline-flex items-center gap-2 text-[11px] font-mono text-white/25 border border-white/8 rounded-full px-3 py-1 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Documentation
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
          Wekraft Docs
        </h1>
        <p className="text-lg text-white/45 leading-relaxed max-w-xl">
          Everything you need to build, ship, and manage projects with your team.
          From your first sprint to AI-powered analytics.
        </p>
      </div>

      {/* Quick start cards */}
      <div className="mb-12">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/25 mb-4">
          Popular pages
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {popularItems.map((doc) => {
            const Icon = iconMap[doc.icon ?? ""] || BookOpen;
            return (
              <Link
                key={doc.slug}
                href={`/web/docs/${doc.slug}`}
                className="group relative flex items-start gap-4 p-4 rounded-xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/14 transition-all duration-200"
              >
                <div className="mt-0.5 w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center shrink-0 group-hover:bg-white/8 transition-colors">
                  <Icon className="h-4 w-4 text-white/50 group-hover:text-white/80 transition-colors" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                      {doc.title}
                    </span>
                    {doc.badge && (
                      <span className={`text-[9px] font-semibold rounded px-1.5 py-0.5 leading-none ${badgeColors[doc.badge]}`}>
                        {doc.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/35 leading-relaxed line-clamp-2">
                    {doc.description}
                  </p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-white/15 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all mt-0.5 shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* All categories */}
      <div className="space-y-10">
        {Object.entries(docsConfig).map(([category, items]) => {
          const CatIcon = categoryIcons[category] || BookOpen;
          return (
            <div key={category}>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center">
                  <CatIcon className="h-3.5 w-3.5 text-white/40" />
                </div>
                <h2 className="text-sm font-semibold text-white/70">{category}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {items.map((doc) => {
                  const Icon = iconMap[doc.icon ?? ""] || BookOpen;
                  return (
                    <Link
                      key={doc.slug}
                      href={`/web/docs/${doc.slug}`}
                      className="group flex items-center gap-3 px-4 py-3 rounded-lg border border-white/6 bg-white/[0.015] hover:bg-white/[0.035] hover:border-white/12 transition-all"
                    >
                      <Icon className="h-3.5 w-3.5 text-white/30 group-hover:text-white/60 transition-colors shrink-0" />
                      <span className="text-sm text-white/55 group-hover:text-white/80 transition-colors flex-1 font-medium">
                        {doc.title}
                      </span>
                      {doc.badge && (
                        <span className={`text-[9px] font-semibold rounded px-1.5 py-0.5 leading-none shrink-0 ${badgeColors[doc.badge]}`}>
                          {doc.badge}
                        </span>
                      )}
                      <ArrowRight className="h-3 w-3 text-white/10 group-hover:text-white/30 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="mt-16 pt-8 border-t border-white/6 flex items-center justify-between text-xs text-white/20">
        <span>Wekraft Documentation</span>
        <Link href="/web/docs/overview" className="hover:text-white/40 transition-colors flex items-center gap-1">
          Get started <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
