"use client";

import {
  AlertCircle,
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Clock,
  Code,
  Command,
  CreditCard,
  FileText,
  FolderTree,
  Info,
  Layers,
  LayoutDashboard,
  Menu,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Terminal,
  UserCog,
  Users,
  X,
  Zap,
  ExternalLink,
  MessageCircle,
  FileCode2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { allDocs, docsConfig, getDocBadge } from "@/lib/docs-config";
import { cn } from "@/lib/utils";

const iconMap: { [key: string]: any } = {
  BookOpen,
  Terminal,
  Layers,
  CheckSquare,
  AlertCircle,
  Zap,
  Clock,
  Calendar,
  Users,
  BarChart3,
  Settings,
  Command,
  Sparkles,
  ShieldCheck,
  CreditCard,
  FileText,
  Info,
  Rocket,
  LayoutDashboard,
  FolderTree,
  UserCog,
  Bell,
  Code,
};

const badgeColors: Record<string, string> = {
  New: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  Updated: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  Beta: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
};

// ─── Search Dialog ──────────────────────────────────────────────────────────
function SearchDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const results =
    query.trim().length > 0
      ? allDocs.filter(
          (doc) =>
            doc.title.toLowerCase().includes(query.toLowerCase()) ||
            doc.description.toLowerCase().includes(query.toLowerCase()),
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
              No results for &quot;{query}&quot;
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
                  <p className="text-xs text-white/30 truncate">
                    {doc.description}
                  </p>
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

// ─── Sidebar Item Text with Marquee on Hover/Active ──────────────────────────
function SidebarItemText({ title, isActive }: { title: string; isActive: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [scrollDist, setScrollDist] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (container && textEl) {
      const dist = textEl.scrollWidth - container.offsetWidth;
      setScrollDist(dist > 0 ? dist : 0);
    }
  }, [title]);

  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const textEl = textRef.current;
      if (container && textEl) {
        const dist = textEl.scrollWidth - container.offsetWidth;
        setScrollDist(dist > 0 ? dist : 0);
      }
    };
    window.addEventListener("resize", handleResize);
    const timer = setTimeout(handleResize, 150);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [isActive, title]);

  const shouldAnimate = scrollDist > 0 && (isActive || isHovered);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden relative whitespace-nowrap select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={title}
    >
      <span
        ref={textRef}
        className={cn(
          "inline-block whitespace-nowrap",
          shouldAnimate ? "animate-marquee-text" : "truncate w-full block"
        )}
        style={shouldAnimate ? ({ "--scroll-dist": `${scrollDist}px` } as React.CSSProperties) : undefined}
      >
        {title}
      </span>
    </div>
  );
}

// ─── Collapsible Category ───────────────────────────────────────────────────
function SidebarCategory({
  category,
  items,
  pathname,
  onNavClick,
  defaultOpen,
}: {
  category: string;
  items: typeof allDocs;
  pathname: string;
  onNavClick?: () => void;
  defaultOpen: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Auto-expand if active item is in this category
  useEffect(() => {
    const hasActive = items.some(
      (item) =>
        pathname === `/web/docs/${item.slug}` ||
        pathname.endsWith(`/web/docs/${item.slug}`),
    );
    if (hasActive) setIsOpen(true);
  }, [pathname, items]);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-1.5 group cursor-pointer"
      >
        <h3 className="text-[10px] font-semibold uppercase tracking-widest text-white/25 group-hover:text-white/40 transition-colors">
          {category}
        </h3>
        <ChevronDown
          className={cn(
            "h-3 w-3 text-white/20 group-hover:text-white/40 transition-all duration-200",
            !isOpen && "-rotate-90",
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-in-out",
          isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <ul className="space-y-1 pb-1">
          {items.map((item) => {
            const Icon = iconMap[item.icon ?? ""] || BookOpen;
            const badge = getDocBadge(item);
            const isActive =
              pathname === `/web/docs/${item.slug}` ||
              pathname.endsWith(`/web/docs/${item.slug}`);
            return (
              <li key={item.slug}>
                <Link
                  href={`/web/docs/${item.slug}`}
                  onClick={onNavClick}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150 min-w-0",
                    isActive
                      ? "bg-white/8 text-white font-medium border border-white/10"
                      : "text-white/45 hover:bg-white/4 hover:text-white/80",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 transition-colors",
                      isActive
                        ? "text-white/90"
                        : "text-white/25 group-hover:text-white/50",
                    )}
                  />
                  <SidebarItemText title={item.title} isActive={isActive} />
                  {badge && (
                    <span
                      className={cn(
                        "text-[9px] font-semibold rounded px-1.5 py-0.5 leading-none",
                        badgeColors[badge],
                      )}
                    >
                      {badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
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
          <Image
            src="/logo.svg"
            alt="Wekraft"
            width={24}
            height={24}
            className="shrink-0"
          />
          <span className="text-sm font-semibold text-white tracking-tight leading-none mt-0.5">
            Wekraft
          </span>
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
        </button>
      </div>

      {/* Navigation — Collapsible categories */}
      <nav className="flex-1 overflow-y-auto px-3 pb-6 space-y-5">
        {Object.entries(docsConfig).map(([category, items], index) => (
          <SidebarCategory
            key={category}
            category={category}
            items={items}
            pathname={pathname}
            onNavClick={onNavClick}
            defaultOpen={true}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/6 space-y-1.5">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[11px] text-white/25 hover:text-white/50 transition-colors"
        >
          ← Back to Wekraft
        </Link>
        <div className="flex items-center gap-3 pt-1">
          <Link
            href="mailto:support@wekraft.xyz"
            className="flex items-center gap-1 text-[10px] text-white/20 hover:text-white/40 transition-colors"
          >
            <MessageCircle className="h-3 w-3" />
            Support
          </Link>

          <a
            href="https://github.com/wekraft"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-white/20 hover:text-white/40 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Main Layout ─────────────────────────────────────────────────────────────
export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
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

      {/* Mobile Sidebar Drawer — with slide animation */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-[#0a0a0a] border-r border-white/8 shadow-2xl animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent
              pathname={pathname}
              onSearchOpen={() => {
                setMobileOpen(false);
                setSearchOpen(true);
              }}
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
          <div className="w-full px-6 py-12 lg:px-10 lg:py-14">{children}</div>
        </main>
      </div>
    </div>
  );
}
