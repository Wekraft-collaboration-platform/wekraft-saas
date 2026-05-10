"use client";

import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Menu, TimerIcon, TimerReset, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SignUpButton } from "@clerk/nextjs";

const navLinks: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "Features", href: "#" },
  { label: "Pricing", href: "/pricing" },
  { label: "Reach us", href: "/reach-us" },
  { label: "Why us?", href: "/why-us" },
  { label: "Docs", href: "/docs" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLightSection, setIsLightSection] = useState(false);
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const currentUser = useQuery(api.user.getCurrentUser);

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
        "fixed top-2 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-linear",
        scrolled || isMenuOpen || isLightSection
          ? clsx(
              "backdrop-blur-md shadow-lg max-w-4xl w-[95%] md:w-full rounded-xl",
              isLightSection
                ? "bg-black/80 border border-white/10"
                : "bg-white/15",
            )
          : "bg-transparent w-full",
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
        <div className={clsx(
          "hidden md:flex text-sm text-white/80 shrink-0",
          scrolled || isLightSection ? "gap-5" : "gap-8"
        )}>
          {navLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="relative cursor-pointer transition-colors duration-200 hover:text-white after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full"
            >
              {label}
            </Link>
          ))}
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
                  <Link href="/dashboard">
                    <Button
                      size="sm"
                      className={clsx(
                        "duration-300 hover:scale-105 transition-all cursor-pointer font-inter text-sm text-white bg-blue-600 hover:bg-blue-700 border-none shadow-[0_0_20px_rgba(37,99,235,0.3)]",
                        (scrolled || isLightSection) && "px-4 py-1.5 text-xs",
                      )}
                    >
                      Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white/80 hover:text-white hover:bg-white/10 text-sm font-medium"
                    onClick={() =>
                      document
                        .getElementById("footer")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    Book a demo
                  </Button>
                  <SignUpButton mode="modal">
                    <Button
                      size="sm"
                      className={clsx(
                        "duration-300 hover:scale-105 transition-all cursor-pointer font-inter text-sm text-white bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-sm",
                        (scrolled || isLightSection) && "px-4 py-1.5 text-xs",
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
                  onClick={() => setIsMenuOpen(false)}
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
                      <SignUpButton mode="modal">
                        <Button className="w-full bg-white text-black hover:bg-white/90">
                          Sign-up
                        </Button>
                      </SignUpButton>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent border-white/30 text-white hover:bg-white/10"
                        onClick={() => {
                          setIsMenuOpen(false);
                          document
                            .getElementById("footer")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        Book a demo
                      </Button>
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
