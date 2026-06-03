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
  Bot,
  UserPlus,
  HelpCircle,
  Video,
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
  Video,
  Bot,
  UserPlus,
  HelpCircle,
};

const badgeColors: Record<string, string> = {
  New: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  Updated: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  Beta: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
};

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
  isSearching,
}: {
  category: string;
  items: typeof allDocs;
  pathname: string;
  onNavClick?: () => void;
  defaultOpen: boolean;
  isSearching?: boolean;
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

  // Force expand when a search query is active
  useEffect(() => {
    if (isSearching) {
      setIsOpen(true);
    }
  }, [isSearching]);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-1.5 group cursor-pointer"
      >
        <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[#525252] group-hover:text-[#a3a3a3] transition-colors">
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
                    "group relative overflow-hidden flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150 min-w-0",
                    isActive
                      ? "text-white font-medium"
                      : "text-[#a3a3a3] hover:bg-white/4 hover:text-[#e5e5e5]",
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none absolute inset-0 -z-10 transition-opacity",
                      isActive
                        ? "opacity-100 bg-linear-to-l from-blue-600 dark:from-blue-600/70 via-blue-600/20 to-transparent!"
                        : "opacity-0"
                    )}
                  />
                  <Icon
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 transition-colors",
                      isActive
                        ? "text-white"
                        : "text-[#525252] group-hover:text-[#a3a3a3]",
                    )}
                  />
                  <SidebarItemText title={item.title} isActive={isActive} />
                  {badge && !isActive && (
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
  onNavClick,
}: {
  pathname: string;
  onNavClick?: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocsConfig = Object.entries(docsConfig).reduce((acc, [category, items]) => {
    const filteredItems = items.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filteredItems.length > 0) {
      acc[category] = filteredItems;
    }
    return acc;
  }, {} as typeof docsConfig);

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center justify-center gap-3 px-5 pt-5 pb-4 border-b border-white/6">
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/logo.svg"
            alt="Wekraft"
            width={32}
            height={32}
            className="shrink-0"
          />
          <span className="text-base font-semibold text-white tracking-tight leading-none mt-0.5">
            Wekraft
          </span>
        </Link>
        <div className="flex items-center justify-center text-[10px] font-mono text-white/20 border border-white/10 rounded px-2 py-0.5 leading-none">
          Docs
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-3">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search docs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-lg bg-white/4 border border-white/8 text-white/90 placeholder:text-white/30 hover:bg-white/6 hover:border-white/12 focus:bg-[#0c0c0c] focus:border-blue-500/50 focus:outline-none transition-all text-xs"
          />
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-white/30 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-white/30 hover:text-white/60 rounded-full transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation — Collapsible categories */}
      <nav className="flex-1 overflow-y-auto overscroll-contain px-3 pb-6 space-y-5">
        {Object.entries(filteredDocsConfig).map(([category, items]) => (
          <SidebarCategory
            key={category}
            category={category}
            items={items}
            pathname={pathname}
            onNavClick={onNavClick}
            defaultOpen={true}
            isSearching={searchQuery.trim().length > 0}
          />
        ))}
        {Object.keys(filteredDocsConfig).length === 0 && (
          <div className="text-center py-8 text-white/20 text-xs font-mono">
            No matching documents
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/6">
        {/* Back to Wekraft — premium card */}
        <Link
          href="/web"
          className="group relative flex items-center gap-3 w-full px-3.5 py-3 rounded-xl bg-gradient-to-r from-white/6 via-white/3 to-transparent border border-white/8 hover:border-white/15 hover:from-white/8 hover:via-white/4 transition-all duration-200 mb-2.5 overflow-hidden"
        >
          <div className="shrink-0 w-7 h-7 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center group-hover:bg-white/12 transition-colors">
            <svg className="h-3.5 w-3.5 text-white/50 transition-transform group-hover:-translate-x-0.5 group-hover:text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white/60 group-hover:text-white/90 transition-colors leading-none">Back to Wekraft</p>
          </div>
        </Link>

        {/* Support & GitHub */}
        <div className="flex items-center justify-center gap-1">
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=support@wekraft.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-medium text-white/30 hover:text-white/60 hover:bg-white/4 border border-transparent hover:border-white/6 transition-all duration-150"
          >
            <MessageCircle className="h-3 w-3" />
            Support
          </a>
          <div className="w-px h-4 bg-white/6 shrink-0" />
          <a
            href="https://github.com/Wekraft-collaboration-platform"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-medium text-white/30 hover:text-white/60 hover:bg-white/4 border border-transparent hover:border-white/6 transition-all duration-150"
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

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
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
          onClick={() => setMobileOpen(true)}
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
          <aside className="absolute left-0 top-0 h-full w-80 bg-[#0a0a0a] border-r border-white/8 shadow-2xl animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent
              pathname={pathname}
              onNavClick={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="fixed left-0 top-0 hidden h-full w-72 border-r border-white/6 bg-[#080808] lg:flex flex-col z-20">
          <SidebarContent
            pathname={pathname}
          />
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:pl-72 min-w-0">
          <div className="w-full px-6 py-12 lg:px-10 lg:py-14">{children}</div>
        </main>
      </div>
    </div>
  );
}