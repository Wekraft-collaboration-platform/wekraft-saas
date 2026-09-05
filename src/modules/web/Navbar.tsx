"use client";

import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import {
  Menu,
  TimerIcon,
  TimerReset,
  X,
  ArrowRight,
  Compass,
  Layers,
  CheckCircle2,
  FileText,
  Send,
  ArrowUpRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SignUpButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

const navLinks: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/web?scroll=features" },
  { label: "Pricing", href: "/web/pricing" },
  { label: "Contact", href: "/web/contact" },
  { label: "Why WeKraft?", href: "/web/why-wekraft" },
  { label: "Docs", href: "/web/docs" },
];

const Navbar = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLightSection, setIsLightSection] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const currentUser = useQuery(api.user.getCurrentUser);

  const handleScrollTo = (e: React.MouseEvent, id: string) => {
    if (pathname === "/web" || pathname === "/") {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        const targetPosition =
          element.getBoundingClientRect().top + window.pageYOffset - 90;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 1200; // Slower duration (1.2 seconds)
        let start: number | null = null;

        const step = (timestamp: number) => {
          if (!start) start = timestamp;
          const progress = timestamp - start;
          const percentage = Math.min(progress / duration, 1);

          // Easing function (easeInOutCubic)
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
        <div className="flex items-center gap-2 shrink-0">
          <Image src="/logo.svg" alt="Logo" width={32} height={32} />
          {!scrolled && !isLightSection && (
            <span className="font-semibold font-pop text-white text-lg sm:text-xl">
              WeKraft
            </span>
          )}
        </div>

        {/* Desktop Links */}
        <div
          className={clsx(
            "hidden md:flex text-sm font-medium shrink-0 items-center ",
            scrolled || isLightSection ? "gap-1" : "gap-2",
          )}
        >
          {navLinks.map(({ label, href }) => {
            if (label === "Why WeKraft?") {
              return (
                <div
                  key={label}
                  className="relative group py-1.5"
                  onMouseEnter={() => setShowDropdown(true)}
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  <Link
                    href={href}
                    className="relative cursor-pointer transition-all duration-300 text-neutral-200 hover:text-white px-4 py-1.5"
                  >
                    <span>{label}</span>
                    <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-white transition-all duration-300 ease-out -translate-x-1/2 group-hover:w-[calc(100%-2rem)]" />
                  </Link>

                  {/* Dropdown Popover */}
                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.96 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full right-[-140px] mt-3.5 w-[630px] bg-neutral-950 border border-white/[0.08] rounded-2xl p-6 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.06)] backdrop-blur-3xl text-left z-50 flex flex-row gap-6 origin-top-right"
                      >
                        {/* Left Column: Info and Links */}
                        <div className="flex-[1.25] flex flex-col gap-4">
                          <div>
                            <h4 className="font-semibold font-pop text-sm tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-neutral-400">
                              Discover why teams switch to WeKraft
                            </h4>
                            <p className="text-neutral-400 text-[11px] mt-1 font-normal font-sans leading-relaxed">
                              See how WeKraft stacks up against the tools you
                              know. Select a platform to view feature matrices.
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <Link
                              href="/web/wekraft-vs-linear"
                              className="group bg-white/[0.03] hover:bg-white/[0.06] text-neutral-300 hover:text-white px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs transition-all duration-200 font-medium font-sans hover:shadow-[0_4px_20px_rgba(255,255,255,0.04)]"
                            >
                              <span className="flex items-center gap-2.5">
                                <span className="w-6 h-6 flex items-center justify-center bg-neutral-900/50 rounded-lg p-1 shrink-0 transition-colors">
                                  <img
                                    src="/linear.png"
                                    alt="Linear"
                                    className="w-full h-full object-contain"
                                  />
                                </span>
                                <span>Linear</span>
                              </span>
                              <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                            </Link>

                            <Link
                              href="/web/wekraft-vs-jira"
                              className="group bg-white/[0.03] hover:bg-white/[0.06] text-neutral-300 hover:text-white px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs transition-all duration-200 font-medium font-sans hover:shadow-[0_4px_20px_rgba(255,255,255,0.04)]"
                            >
                              <span className="flex items-center gap-2.5">
                                <span className="w-6 h-6 flex items-center justify-center bg-neutral-900/50 rounded-lg p-1 shrink-0 transition-colors">
                                  <img
                                    src="/jira-logo.jpg"
                                    alt="Jira"
                                    className="w-full h-full object-contain rounded-sm"
                                  />
                                </span>
                                <span>Jira</span>
                              </span>
                              <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                            </Link>

                            <Link
                              href="/web/wekraft-vs-asana"
                              className="group bg-white/[0.03] hover:bg-white/[0.06] text-neutral-300 hover:text-white px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs transition-all duration-200 font-medium font-sans hover:shadow-[0_4px_20px_rgba(255,255,255,0.04)]"
                            >
                              <span className="flex items-center gap-2.5">
                                <span className="w-6 h-6 flex items-center justify-center bg-neutral-900/50 rounded-lg p-1 shrink-0 transition-colors">
                                  <img
                                    src="/asana-logo.svg"
                                    alt="Asana"
                                    className="w-full h-full object-contain"
                                  />
                                </span>
                                <span>Asana</span>
                              </span>
                              <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                            </Link>

                            <Link
                              href="/web/wekraft-vs-notion"
                              className="group bg-white/[0.03] hover:bg-white/[0.06] text-neutral-300 hover:text-white px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs transition-all duration-200 font-medium font-sans hover:shadow-[0_4px_20px_rgba(255,255,255,0.04)]"
                            >
                              <span className="flex items-center gap-2.5">
                                <span className="w-6 h-6 flex items-center justify-center bg-neutral-900/50 rounded-lg p-1 shrink-0 transition-colors">
                                  <img
                                    src="/Notion-logo.png"
                                    alt="Notion"
                                    className="w-full h-full object-contain"
                                  />
                                </span>
                                <span>Notion</span>
                              </span>
                              <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                            </Link>

                            <Link
                              href="/web/wekraft-vs-plane"
                              className="group bg-white/[0.03] hover:bg-white/[0.06] text-neutral-300 hover:text-white px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs transition-all duration-200 font-medium font-sans hover:shadow-[0_4px_20px_rgba(255,255,255,0.04)] col-span-2"
                            >
                              <span className="flex items-center gap-2.5">
                                <span className="w-6 h-6 flex items-center justify-center bg-neutral-900/50 rounded-lg p-1 shrink-0 transition-colors">
                                  <img
                                    src="/plane-so logo.png"
                                    alt="Plane"
                                    className="w-full h-full object-contain"
                                  />
                                </span>
                                <span>Plane</span>
                              </span>
                              <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                            </Link>
                          </div>
                        </div>

                        {/* Right Column: Visual Mockup Image */}
                        <div className="flex-[0.75] relative rounded-xl border border-white/[0.08] overflow-hidden bg-neutral-900/30 group/img min-h-[190px] flex items-stretch">
                          <img
                            src="/why hover.svg"
                            alt="Why switch to WeKraft"
                            className="absolute inset-0 w-full h-full object-cover scale-[1.20] transition-transform duration-700 group-hover/img:scale-[1.26]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent pointer-events-none opacity-80" />
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/5 pointer-events-none" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <Link
                key={label}
                href={href}
                onClick={(e) => {
                  if (label === "Features") {
                    handleScrollTo(e, "features");
                  }
                }}
                className="relative cursor-pointer transition-all duration-300 text-neutral-200 hover:text-white px-4 py-1.5 group"
              >
                <span>{label}</span>
                <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-white transition-all duration-300 ease-out -translate-x-1/2 group-hover:w-[calc(100%-2rem)]" />
              </Link>
            );
          })}
        </div>

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

          {/* Minimal Mobile Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-1 opacity-80 hover:opacity-100 transition-opacity"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Minimal Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden"
          >
            <div className="flex flex-col px-6 pb-6 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    setIsMenuOpen(false);
                    if (link.label === "Features") {
                      handleScrollTo(e, "features");
                    }
                  }}
                  className="text-white/70 text-sm font-medium hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {!isAuthLoading && (
                <>
                  {isAuthenticated ? (
                    <div className="flex flex-col gap-3 mt-2">
                      <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/10">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={currentUser?.avatarUrl} />
                          <AvatarFallback className="bg-white/10 text-white text-xs">
                            {currentUser?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-white/80 text-sm font-medium">
                          {currentUser?.name || "My Account"}
                        </span>
                      </div>
                      <Link href="/dashboard" className="w-full">
                        <Button
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Continue to Home
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 mt-2">
                      <SignUpButton forceRedirectUrl={"/auth"}>
                        <Button className="w-full bg-white text-black hover:bg-white/90">
                          Sign-up
                        </Button>
                      </SignUpButton>
                      <a
                        href="https://www.producthunt.com/products/wekraft?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-wekraft"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex justify-center py-2"
                        id="navbar-product-hunt-mobile"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <img
                          alt="Wekraft - your project lives in Github , so should your workspace. | Product Hunt"
                          src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1165218&theme=light&t=1780813633054"
                          className="h-10 w-auto object-contain"
                          width="185"
                          height="40"
                        />
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
