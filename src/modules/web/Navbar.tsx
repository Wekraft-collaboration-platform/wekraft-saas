"use client";

import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import {
  Menu,
  X,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  CreditCard,
  Mail,
  Briefcase,
  History,
  GitBranch,
  Terminal,
  Copy,
  Check,
  Code2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SignUpButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

const comparisons = [
  {
    name: "Linear",
    href: "/web/wekraft-vs-linear",
    logo: "/linear.png",
    imgClass: "object-contain",
  },
  {
    name: "Jira",
    href: "/web/wekraft-vs-jira",
    logo: "/jira-logo.jpg",
    imgClass: "object-contain rounded-sm",
  },
  {
    name: "Asana",
    href: "/web/wekraft-vs-asana",
    logo: "/asana-logo.svg",
    imgClass: "object-contain",
  },
  {
    name: "Notion",
    href: "/web/wekraft-vs-notion",
    logo: "/Notion-logo.png",
    imgClass: "object-contain",
  },
  {
    name: "Plane",
    href: "/web/wekraft-vs-plane",
    logo: "/plane-so logo.png",
    imgClass: "object-contain",
  },
];

const featureHighlights = [
  {
    title: "AI Issue Management",
    desc: "Automated backlog refinement and smart ticketing.",
    icon: Sparkles,
  },
  {
    title: "Git & PR Bi-Directional Sync",
    desc: "Commits & branches stay synchronized in real time.",
    icon: GitBranch,
  },
  {
    title: "IDE-Native Execution",
    desc: "Work on tickets without ever leaving your editor.",
    icon: Terminal,
  },
];

const companyItems = [
  {
    name: "Pricing",
    desc: "Simple, transparent plans for teams of any size.",
    href: "/web/pricing",
    icon: CreditCard,
    isLink: true,
  },
  {
    name: "Contact Us",
    desc: "Get in touch with our team for questions or support.",
    href: "/web/contact",
    icon: Mail,
    isLink: true,
  },
  {
    name: "Careers",
    desc: "Join us in crafting the future of developer tools.",
    badge: "",
    icon: Briefcase,
    isLink: false,
  },
  {
    name: "Changelog",
    desc: "Explore weekly updates, improvements, and releases.",
    badge: "v2.0",
    icon: History,
    isLink: false,
  },
];

const extensionIdes = [
  {
    name: "VS Code",
    desc: "marketplace.visualstudio.com",
    logo: "/vs-code.png",
    href: "vscode:extension/wekraft.wekraft",
    logoSize: 20,
    imgClass: "object-contain",
  },
  {
    name: "Cursor",
    desc: "open-vsx.org",
    logo: "/cursor.png",
    href: "cursor:extension/wekraft.wekraft",
    logoSize: 32,
    imgClass: "object-cover w-full h-full",
  },
  {
    name: "Antigravity IDE",
    desc: "open-vsx.org",
    logo: "/antigravity-color.svg",
    href: "https://open-vsx.org/vscode/item?itemName=WeKraft.wekraft",
    newTab: true,
    logoSize: 20,
    imgClass: "object-contain",
  },
];

const mcpIntegrations = [
  { name: "Linear", logo: "/linear.png" },
  { name: "Notion", logo: "/Notion-logo.png" },
  { name: "Slack", logo: "/slack.png" },
  { name: "Supabase", logo: "/supabase.png" },
  { name: "Vercel", isVercel: true },
  { name: "PostHog", logo: "/posthog.svg" },
];

const Navbar = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLightSection, setIsLightSection] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<
    "features" | "company" | "extension" | "mcp" | null
  >(null);
  const [copiedCli, setCopiedCli] = useState(false);

  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const currentUser = useQuery(api.user.getCurrentUser);

  const handleCopyCli = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText("code --install-extension WeKraft.wekraft");
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const handleScrollTo = (e: React.MouseEvent, id: string) => {
    if (pathname === "/web" || pathname === "/") {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        const targetPosition =
          element.getBoundingClientRect().top + window.pageYOffset - 90;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 1200;
        let start: number | null = null;

        const step = (timestamp: number) => {
          if (!start) start = timestamp;
          const progress = timestamp - start;
          const percentage = Math.min(progress / duration, 1);

          const easing =
            percentage < 0.5
              ? 4 * percentage * percentage * percentage
              : 1 - Math.pow(-2 * percentage + 2, 3) / 2;

          window.scrollTo(0, startPosition + distance * easing);

          if (progress < duration) {
            window.requestAnimationFrame(step);
          }
        };

        window.requestAnimationFrame(step);
        window.history.pushState(null, "", `/web#${id}`);
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsLightSection(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    const section3 = document.getElementById("section3");
    if (section3) observer.observe(section3);

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (section3) observer.unobserve(section3);
    };
  }, []);

  return (
    <header
      className={clsx(
        "fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out",
        scrolled || isMenuOpen || isLightSection
          ? clsx(
              "top-4 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-w-4xl w-[95%] md:w-full rounded-2xl border",
              isLightSection
                ? "bg-neutral-950/80 border-white/10"
                : "bg-neutral-900/50 border-white/10",
            )
          : "top-0 bg-transparent w-full border-none shadow-none",
      )}
    >
      <nav
        className={clsx(
          "mx-auto max-w-7xl px-6 flex items-center justify-between transition-all duration-300",
          scrolled || isLightSection ? "h-14 max-w-5xl mx-auto" : "h-20",
        )}
      >
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/logo.svg" alt="Logo" width={32} height={32} />
          {!scrolled && !isLightSection && (
            <span className="font-semibold font-pop text-white text-lg sm:text-xl">
              WeKraft
            </span>
          )}
        </Link>

        {/* Desktop Links: Features, Company, Docs, Extension */}
        <div
          className={clsx(
            "hidden md:flex text-sm font-medium shrink-0 items-center",
            scrolled || isLightSection ? "gap-2" : "gap-3",
          )}
        >
          {/* 1. FEATURES (Dropdown on Hover) */}
          <div
            className="relative py-2 group"
            onMouseEnter={() => setActiveDropdown("features")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              onClick={(e) => handleScrollTo(e, "features")}
              className="relative cursor-pointer transition-all duration-300 text-neutral-200 hover:text-white px-3.5 py-1.5 flex items-center gap-1 group"
            >
              <span>Features</span>
              <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-white transition-all duration-300 ease-out -translate-x-1/2 group-hover:w-[calc(100%-1.75rem)]" />
            </button>

            <AnimatePresence>
              {activeDropdown === "features" && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-full left-[-160px] mt-2 w-[740px] bg-neutral-950 border border-white/[0.08] rounded-2xl p-6 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.06)] backdrop-blur-3xl text-left z-50 flex flex-row gap-6 origin-top before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-3"
                >
                  {/* Left Column: Feature Highlights & Scroll Button */}
                  <div className="flex-1 flex flex-col justify-between border-r border-white/[0.06] pr-6">
                    <div>
                      <h4 className="font-semibold font-pop text-sm tracking-tight text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-neutral-400" />
                        Platform Features
                      </h4>
                      <p className="text-neutral-400 text-[11px] mt-1 font-normal font-sans leading-relaxed">
                        Engineered for momentum — AI management, PR sync, and
                        in-editor control.
                      </p>

                      <div className="flex flex-col gap-2.5 mt-3">
                        {featureHighlights.map((feat) => {
                          const IconComp = feat.icon;
                          return (
                            <div
                              key={feat.title}
                              className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <IconComp className="w-3.5 h-3.5 text-neutral-400" />
                                <span className="text-xs font-medium text-neutral-200">
                                  {feat.title}
                                </span>
                              </div>
                              <p className="text-[10.5px] text-neutral-400 mt-1 leading-snug">
                                {feat.desc}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        handleScrollTo(e, "features");
                        setActiveDropdown(null);
                      }}
                      className="mt-3 w-full py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-neutral-200 hover:text-white text-xs font-medium flex items-center justify-between transition-all group/btn cursor-pointer"
                    >
                      <span>Scroll to full feature breakdown</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Right Column: Why WeKraft Comparison Links */}
                  <div className="flex-[1.1] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold font-pop text-sm tracking-tight text-white">
                          Why WeKraft?
                        </h4>
                        <Link
                          href="/web/why-wekraft"
                          onClick={() => setActiveDropdown(null)}
                          className="text-[11px] text-neutral-400 hover:text-white font-medium flex items-center gap-1 hover:underline"
                        >
                          View all <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </div>
                      <p className="text-neutral-400 text-[11px] mt-1 font-normal font-sans leading-relaxed">
                        See how WeKraft stacks up against other project tools.
                      </p>

                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {comparisons.map((item, idx) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setActiveDropdown(null)}
                            className={clsx(
                              "group bg-white/[0.03] hover:bg-white/[0.06] text-neutral-300 hover:text-white px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-all duration-200 font-medium font-sans hover:shadow-[0_4px_20px_rgba(255,255,255,0.04)]",
                              idx === comparisons.length - 1 && "col-span-2",
                            )}
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-5 h-5 flex items-center justify-center bg-neutral-900/50 rounded p-0.5 shrink-0">
                                <img
                                  src={item.logo}
                                  alt={item.name}
                                  className={`w-full h-full ${item.imgClass}`}
                                />
                              </span>
                              <span>{item.name}</span>
                            </span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. COMPANY (Dropdown on Hover) */}
          <div
            className="relative py-2 group"
            onMouseEnter={() => setActiveDropdown("company")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="relative cursor-pointer transition-all duration-300 text-neutral-200 hover:text-white px-3.5 py-1.5 flex items-center gap-1 group">
              <span>Company</span>
              <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-white transition-all duration-300 ease-out -translate-x-1/2 group-hover:w-[calc(100%-1.75rem)]" />
            </button>

            <AnimatePresence>
              {activeDropdown === "company" && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[480px] bg-neutral-950 border border-white/[0.08] rounded-2xl p-5 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.06)] backdrop-blur-3xl text-left z-50 origin-top before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-3"
                >
                  <div className="mb-3 px-1">
                    <h4 className="font-semibold font-pop text-sm tracking-tight text-white">
                      Company
                    </h4>
                    <p className="text-neutral-400 text-[11px] mt-0.5">
                      Everything you need to connect with our platform and team.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {companyItems.map((item) => {
                      const Icon = item.icon;
                      if (item.isLink && item.href) {
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setActiveDropdown(null)}
                            className="group p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] transition-all flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 font-medium text-xs text-white">
                                  <Icon className="w-3.5 h-3.5 text-neutral-400" />
                                  {item.name}
                                </span>
                                <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
                              </div>
                              <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                                {item.desc}
                              </p>
                            </div>
                          </Link>
                        );
                      }

                      return (
                        <div
                          key={item.name}
                          className="p-3 rounded-xl bg-white/[0.015] border border-white/[0.04] flex flex-col justify-between cursor-default"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-2 font-medium text-xs text-neutral-300">
                                <Icon className="w-3.5 h-3.5 text-neutral-400" />
                                {item.name}
                              </span>
                              {item.badge && (
                                <span className="text-[9.5px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-neutral-300 border border-white/10 font-medium">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-neutral-500 mt-1 leading-snug">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. DOCS (Direct Link) */}
          <Link
            href="/web/docs"
            className="relative cursor-pointer transition-all duration-300 text-neutral-200 hover:text-white px-3.5 py-1.5 group"
          >
            <span>Docs</span>
            <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-white transition-all duration-300 ease-out -translate-x-1/2 group-hover:w-[calc(100%-1.75rem)]" />
          </Link>

          {/* 4. EXTENSION (Dropdown on Hover) */}
          <div
            className="relative py-2 group"
            onMouseEnter={() => setActiveDropdown("extension")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="relative cursor-pointer transition-all duration-300 text-neutral-200 hover:text-white px-3.5 py-1.5 flex items-center gap-1.5 group">
              <Code2 className="w-3.5 h-3.5 text-neutral-400" />
              <span>Extension</span>
              <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-white transition-all duration-300 ease-out -translate-x-1/2 group-hover:w-[calc(100%-1.75rem)]" />
            </button>

            <AnimatePresence>
              {activeDropdown === "extension" && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-full right-[-80px] mt-2 w-[340px] bg-neutral-950 border border-white/[0.08] rounded-2xl p-4 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.06)] backdrop-blur-3xl text-left z-50 origin-top before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-3"
                >
                  <div className="px-1 pb-2 flex items-center justify-between border-b border-white/[0.06]">
                    <div>
                      <span className="text-xs font-semibold text-white tracking-tight">
                        Install Extension
                      </span>
                      <p className="text-[10px] text-neutral-400">
                        Bring WeKraft directly into your IDE.
                      </p>
                    </div>
                  </div>

                  {/* IDE list */}
                  <div className="py-2 flex flex-col gap-1">
                    {extensionIdes.map((ide) => (
                      <a
                        key={ide.name}
                        href={ide.href}
                        {...(ide.newTab
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        onClick={() => setActiveDropdown(null)}
                        className="group flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-white/[0.05] transition-colors duration-150 cursor-pointer border border-transparent hover:border-white/[0.05]"
                      >
                        <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center shrink-0 overflow-hidden">
                          <Image
                            src={ide.logo}
                            alt={ide.name}
                            width={ide.logoSize}
                            height={ide.logoSize}
                            className={ide.imgClass}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-neutral-200 leading-tight">
                            {ide.name}
                          </p>
                          <p className="text-[10px] text-neutral-500 truncate font-mono mt-0.5">
                            {ide.desc}
                          </p>
                        </div>

                        <span className="text-[10px] font-medium text-neutral-300 bg-white/[0.06] border border-white/10 rounded-md px-2.5 py-1 transition-all group-hover:bg-white/15 group-hover:text-white group-hover:border-white/20 shrink-0">
                          Install
                        </span>
                      </a>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 5. MCP (Dropdown on Hover) */}
          <div
            className="relative py-2 group"
            onMouseEnter={() => setActiveDropdown("mcp")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="relative cursor-pointer transition-all duration-300 text-neutral-200 hover:text-white px-3.5 py-1.5 flex items-center gap-1 group">
              <span>MCP</span>
              <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-white transition-all duration-300 ease-out -translate-x-1/2 group-hover:w-[calc(100%-1.75rem)]" />
            </button>

            <AnimatePresence>
              {activeDropdown === "mcp" && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-full right-[-80px] mt-2 w-[660px] bg-neutral-950 border border-white/[0.08] rounded-2xl p-5 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.06)] backdrop-blur-3xl text-left z-50 flex flex-row gap-5 origin-top before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-3"
                >
                  {/* Left Column: 20+ Integrations Available */}
                  <div className="flex-1 flex flex-col justify-between border-r border-white/[0.06] pr-5">
                    <div>
                      <h4 className="font-semibold font-pop text-sm tracking-tight text-white">
                        20+ Integrations Available
                      </h4>
                      <p className="text-neutral-400 text-[11px] mt-1 font-normal font-sans leading-relaxed">
                        Connect with your existing software stack and developer
                        tooling.
                      </p>

                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {mcpIntegrations.map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-neutral-300"
                          >
                            <span className="w-5 h-5 flex items-center justify-center bg-neutral-900/60 rounded p-0.5 shrink-0">
                              {item.isVercel ? (
                                <svg
                                  className="w-3.5 h-3.5 fill-white"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="m12 1.608 12 20.784H0Z" />
                                </svg>
                              ) : (
                                <img
                                  src={item.logo}
                                  alt={item.name}
                                  className="w-full h-full object-contain"
                                />
                              )}
                            </span>
                            <span className="text-[11.5px] font-medium text-neutral-200">
                              {item.name}
                            </span>
                          </div>
                        ))}

                        <div className="col-span-2 flex items-center justify-center py-2 px-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] font-medium text-neutral-400">
                          +14 more integrations available
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: WeKraft MCP Server */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold font-pop text-sm tracking-tight text-white">
                          WeKraft MCP Server
                        </h4>
                        <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-neutral-300 border border-white/10 font-medium">
                          Coming soon
                        </span>
                      </div>
                      <p className="text-neutral-400 text-[11px] mt-1 font-normal font-sans leading-relaxed">
                        Allow autonomous AI agents to connect directly with your
                        workspace.
                      </p>

                      {/* Supported Agent chips */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {["Claude", "Codex", "Cursor", "Antigravity"].map(
                          (agent) => (
                            <span
                              key={agent}
                              className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] text-neutral-200 font-medium"
                            >
                              {agent}
                            </span>
                          ),
                        )}
                      </div>

                      {/* Clean informational card without fake code */}
                      <div className="mt-4 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-white " />
                          <span className="text-xs font-medium text-neutral-200">
                            Under Development
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[9.5px] text-neutral-500 font-mono mt-3">
                      Model Context Protocol standard support.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right side CTA & Auth */}
        <div className="flex items-center gap-4 shrink-0">
          {!isAuthLoading && (
            <>
              {isAuthenticated ? (
                <div className="hidden md:flex items-center gap-4">
                  <Avatar className="h-9 w-9 border border-white/20">
                    <AvatarImage src={currentUser?.avatarUrl} />
                    <AvatarFallback className="bg-white/10 text-white text-xs">
                      {currentUser?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <Link href="/auth/callback">
                    <Button
                      size="sm"
                      className={clsx(
                        "duration-300 hover:scale-105 transition-all cursor-pointer font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 border-none shadow-[0_0_20px_rgba(37,99,235,0.4)] rounded-full",
                        scrolled || isLightSection
                          ? "px-4 py-1.5 text-xs"
                          : "px-5 py-2 text-sm",
                      )}
                    >
                      Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <a
                    href="https://www.producthunt.com/products/wekraft?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-wekraft"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:opacity-90 transition-opacity"
                    id="navbar-product-hunt-desktop"
                  >
                    <img
                      alt="Wekraft - your project lives in Github , so should your workspace. | Product Hunt"
                      src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1165218&theme=light&t=1780813633054"
                      className="h-9 w-auto object-contain"
                      width="167"
                      height="36"
                    />
                  </a>
                  <SignUpButton>
                    <Button
                      size="sm"
                      className={clsx(
                        "duration-300 hover:scale-105 transition-all cursor-pointer font-medium text-white bg-blue-600 hover:bg-blue-500",
                        scrolled || isLightSection
                          ? "px-4 py-1.5 text-xs"
                          : "px-5 py-2 text-sm",
                      )}
                    >
                      Sign-up
                    </Button>
                  </SignUpButton>
                </div>
              )}
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-1 opacity-80 hover:opacity-100 transition-opacity"
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-neutral-950/95 border-b border-white/10"
          >
            <div className="flex flex-col px-6 py-4 gap-3 text-sm">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="text-white/80 hover:text-white py-1 font-medium"
              >
                Home
              </Link>

              <button
                onClick={(e) => {
                  setIsMenuOpen(false);
                  handleScrollTo(e, "features");
                }}
                className="text-left text-white/80 hover:text-white py-1 font-medium cursor-pointer"
              >
                Features
              </button>

              <div className="pl-3 py-1 flex flex-col gap-1.5 border-l border-white/10">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Comparisons
                </span>
                {comparisons.map((c) => (
                  <Link
                    key={c.name}
                    href={c.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-neutral-400 hover:text-white text-xs flex items-center justify-between"
                  >
                    <span>WeKraft vs {c.name}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                ))}
              </div>

              <div className="pl-3 py-1 flex flex-col gap-1.5 border-l border-white/10">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Company
                </span>
                <Link
                  href="/web/pricing"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-neutral-300 hover:text-white text-xs"
                >
                  Pricing
                </Link>
                <Link
                  href="/web/contact"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-neutral-300 hover:text-white text-xs"
                >
                  Contact Us
                </Link>
                <span className="text-neutral-500 text-xs flex items-center justify-between">
                  <span>Careers</span>
                  <span className="text-[9px] px-1.5 rounded-full bg-white/10 text-neutral-300">
                    Hiring
                  </span>
                </span>
                <span className="text-neutral-500 text-xs flex items-center justify-between">
                  <span>Changelog</span>
                  <span className="text-[9px] px-1.5 rounded-full bg-white/10 text-neutral-300">
                    v2.0
                  </span>
                </span>
              </div>

              <Link
                href="/web/docs"
                onClick={() => setIsMenuOpen(false)}
                className="text-white/80 hover:text-white py-1 font-medium"
              >
                Docs
              </Link>

              <div className="pl-3 py-1 flex flex-col gap-1.5 border-l border-white/10">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Extension
                </span>
                {extensionIdes.map((ide) => (
                  <a
                    key={ide.name}
                    href={ide.href}
                    {...(ide.newTab
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-neutral-300 hover:text-white text-xs flex items-center justify-between"
                  >
                    <span>{ide.name}</span>
                    <span className="text-[10px] text-neutral-300">
                      Install
                    </span>
                  </a>
                ))}
              </div>

              <div className="pl-3 py-1 flex flex-col gap-1.5 border-l border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                    MCP (Model Context Protocol)
                  </span>
                  <span className="text-[9px] px-1.5 rounded-full bg-white/10 text-neutral-300">
                    Coming soon
                  </span>
                </div>
                <span className="text-neutral-400 text-xs">
                  20+ Integrations (Linear, Notion, Slack, Supabase, Vercel,
                  PostHog)
                </span>
                <span className="text-neutral-500 text-[11px]">
                  Connect WeKraft with Claude, Codex, Cursor &amp; Antigravity
                </span>
              </div>

              {!isAuthLoading && (
                <div className="pt-2 border-t border-white/10 flex flex-col gap-2.5">
                  <a
                    href="https://www.producthunt.com/products/wekraft?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-wekraft"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex justify-center py-1"
                    id="navbar-product-hunt-mobile"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <img
                      alt="Wekraft - your project lives in Github , so should your workspace. | Product Hunt"
                      src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1165218&theme=light&t=1780813633054"
                      className="h-9 w-auto object-contain"
                      width="167"
                      height="36"
                    />
                  </a>
                  {isAuthenticated ? (
                    <Link href="/dashboard" className="w-full">
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Continue to Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <SignUpButton forceRedirectUrl={"/auth"}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        Sign-up
                      </Button>
                    </SignUpButton>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
