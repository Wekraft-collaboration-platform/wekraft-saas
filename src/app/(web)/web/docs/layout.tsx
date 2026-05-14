"use client";

import { docsConfig } from "@/lib/docs-config";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Search, ChevronRight, BookOpen, Terminal, Layers, Zap,
  Calendar, Users, BarChart3, Clock, Settings, AlertCircle,
  CheckSquare, Menu, X, Command,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState, useCallback, useRef } from "react";
import { allDocs } from "@/lib/docs-config";

const iconMap: { [key: string]: any } = {
  BookOpen, Terminal, Layers, CheckSquare, AlertCircle,
  Zap, Clock, Calendar, Users, BarChart3, Settings,
};

const badgeColors: Record<string, string> = {
  New: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  Updated: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  Beta: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
};

// ─── Search Dialog ──────────────────────────────────────────────────────────
function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.trim().length > 0
    ? allDocs.filter(
        (doc) =>
          doc.title.toLowerCase().includes(query.toLowerCase()) ||
          doc.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className="relative w-full max-w-lg mx-4 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8">
          <Search className="h-4 w-4 text-white/40 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documentation..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
          />
          <button onClick={onClose}>
            <kbd className="text-[10px] text-white/30 border border-white/10 rounded px-1.5 py-0.5 font-mono">
              ESC
            </kbd>
          </button>
        </div>

        {/* Results */}
        <div className="max-h-64 overflow-y-auto">
          {query && results.length === 0 && (
            <p className="text-sm text-white/30 text-center py-8">
              No results for "{query}"
            </p>
          )}
          {!query && (
            <p className="text-xs text-white/25 text-center py-6 font-mono">
              Type to search all docs
            </p>
          )}
          {results.map((doc) => {
            const Icon = iconMap[doc.icon ?? ""] || BookOpen;
            return (
              <Link
                key={doc.slug}
                href={`/web/docs/${doc.slug}`}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors group"
              >
                <div className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center shrink-0">
                  <Icon className="h-3.5 w-3.5 text-white/50 group-hover:text-white/80 transition-colors" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-white/80 group-hover:text-white font-medium truncate transition-colors">
                    {doc.title}
                  </p>
                  <p className="text-xs text-white/30 truncate">{doc.description}</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-white/20 ml-auto shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar Content ─────────────────────────────────────────────────────────
function SidebarContent({
  pathname,
  onSearchOpen,
  onNavClick,
}: {
  pathname: string;
  onSearchOpen: () => void;
  onNavClick?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center justify-center gap-3 px-5 pt-5 pb-4 border-b border-white/6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image src="/logo.svg" alt="Wekraft" width={24} height={24} className="shrink-0" />
          <span className="text-sm font-semibold text-white tracking-tight leading-none mt-0.5">Wekraft</span>
        </Link>
        <div className="flex items-center justify-center text-[10px] font-mono text-white/20 border border-white/10 rounded px-2 py-0.5 leading-none">
          Docs
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-3">
        <button
          onClick={onSearchOpen}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/4 border border-white/8 text-white/40 hover:bg-white/6 hover:text-white/60 hover:border-white/12 transition-all text-sm group"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 text-left text-xs">Search docs...</span>
          <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] text-white/20 font-mono border border-white/8 rounded px-1 py-0.5">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pb-6 space-y-5">
        {Object.entries(docsConfig).map(([category, items]) => (
          <div key={category}>
            <h3 className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/25">
              {category}
            </h3>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const Icon = iconMap[item.icon ?? ""] || BookOpen;
                const isActive = pathname === `/web/docs/${item.slug}` || pathname.endsWith(`/web/docs/${item.slug}`);
                return (
                  <li key={item.slug}>
                    <Link
                      href={`/web/docs/${item.slug}`}
                      onClick={onNavClick}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                        isActive
                          ? "bg-white/8 text-white font-medium border border-white/10"
                          : "text-white/45 hover:bg-white/4 hover:text-white/80"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-3.5 w-3.5 shrink-0 transition-colors",
                          isActive ? "text-white/90" : "text-white/25 group-hover:text-white/50"
                        )}
                      />
                      <span className="flex-1 leading-none">{item.title}</span>
                      {item.badge && (
                        <span className={cn("text-[9px] font-semibold rounded px-1.5 py-0.5 leading-none", badgeColors[item.badge])}>
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <ChevronRight className="h-3 w-3 text-white/30 ml-auto shrink-0" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-white/6">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[11px] text-white/25 hover:text-white/50 transition-colors"
        >
          ← Back to Wekraft
        </Link>
      </div>
    </div>
  );
}

// ─── Main Layout ─────────────────────────────────────────────────────────────
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Cmd+K shortcut
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setSearchOpen(true);
    }
    if (e.key === "Escape") {
      setSearchOpen(false);
      setMobileOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Search Dialog */}
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile Top Bar */}
      <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b border-white/6 bg-[#050505]/90 backdrop-blur-md lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Wekraft" width={20} height={20} />
          <span className="text-sm font-semibold text-white/80">Docs</span>
        </div>
        <button
          onClick={() => setSearchOpen(true)}
          className="ml-auto p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>
      </header>

      {/* Mobile Sidebar Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-[#0a0a0a] border-r border-white/8 shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent
              pathname={pathname}
              onSearchOpen={() => { setMobileOpen(false); setSearchOpen(true); }}
              onNavClick={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-white/6 bg-[#080808] lg:flex flex-col z-20">
          <SidebarContent
            pathname={pathname}
            onSearchOpen={() => setSearchOpen(true)}
          />
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:pl-64 min-w-0">
          <div className="w-full px-6 py-12 lg:px-10 lg:py-14">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
