"use client";

import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Menu, TimerIcon, TimerReset, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "Reach us", href: "/reach-us" },
  { label: "About us", href: "/about-us" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLightSection, setIsLightSection] = useState(false);

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
              "backdrop-blur-md shadow-lg max-w-3xl w-[95%] md:w-full rounded-xl",
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
          scrolled || isLightSection ? "h-14 max-w-165 mx-auto" : "h-20",
        )}
      >
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Logo" width={32} height={32} />
          {!scrolled && !isLightSection && (
            <span className="font-semibold font-pop text-white text-lg sm:text-xl">
              WeKraft
            </span>
          )}
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-8 text-sm text-white/80">
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

        <div className="flex items-center gap-4">
          <Button
            size="sm"
            variant={"outline"}
            onClick={() =>
              document
                .getElementById("footer")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className={clsx(
              "hidden md:flex duration-300 hover:scale-105 transition-all cursor-pointer font-inter text-sm text-white bg-transparent border border-white/30",
              (scrolled || isLightSection) && "px-4 py-1.5 text-xs",
            )}
          >
            {scrolled || isLightSection ? (
              <>
                Wait List
                <TimerReset className="ml-2 w-4 h-4" />
              </>
            ) : (
              <>
                Coming Soon
                <TimerIcon className="ml-2 w-4 h-4" />
              </>
            )}
          </Button>

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
              <Button
                variant="outline"
                className="mt-2 w-full bg-transparent border-white/30 text-white hover:bg-white/10"
                onClick={() => {
                  setIsMenuOpen(false);
                  document
                    .getElementById("footer")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Join Wait List
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
