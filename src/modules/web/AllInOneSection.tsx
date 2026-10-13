"use client";

import { motion, useInView } from "framer-motion";
import React, { useRef } from "react";

/* ─── Grid cell types ────────────────────────────────────────────── */

interface SmallCell {
  logo: string;
  label: string;
  col: number;
  row: number;
  invert?: boolean;
}

/* ─── Data: 60 Tools filling the 10x6 keyboard grid ─────────────── */

const smallCells: SmallCell[] = [
  // ── Row 1 ──
  { logo: "/github.png", label: "GitHub", col: 1, row: 1 },
  { logo: "/linear.png", label: "Linear", col: 2, row: 1 },
  { logo: "/slack.png", label: "Slack", col: 3, row: 1 },
  { logo: "/Notion-logo.png", label: "Notion", col: 4, row: 1 },
  { logo: "/supabase.png", label: "Supabase", col: 5, row: 1 },
  { logo: "/vs-code.png", label: "VS Code", col: 6, row: 1 },
  { logo: "/cursor.png", label: "Cursor", col: 7, row: 1 },
  { logo: "/discord.png", label: "Discord", col: 8, row: 1 },
  { logo: "/jira-logo.jpg", label: "Jira", col: 9, row: 1 },
  { logo: "/gitlab.svg", label: "GitLab", col: 10, row: 1 },

  // ── Row 2 ──
  { logo: "/sentry.svg", label: "Sentry", col: 1, row: 2 },
  { logo: "/posthog.svg", label: "PostHog", col: 2, row: 2 },
  { logo: "/stripe.svg", label: "Stripe", col: 3, row: 2 },
  { logo: "/vs-code.png", label: "VS Code Ext", col: 4, row: 2 },
  { logo: "/cursor.png", label: "Cursor AI", col: 5, row: 2 },
  { logo: "/github.png", label: "GitHub PRs", col: 6, row: 2 },
  { logo: "/linear.png", label: "Linear Issues", col: 7, row: 2 },
  { logo: "/asana-logo.svg", label: "Asana", col: 8, row: 2 },
  { logo: "/calendly.png", label: "Calendly", col: 9, row: 2 },
  { logo: "/dd-logo.svg", label: "Datadog", col: 10, row: 2 },

  // ── Row 3 ──
  { logo: "/beter-stack.svg", label: "Better Stack", col: 1, row: 3 },
  { logo: "/hubsport.svg", label: "HubSpot", col: 2, row: 3 },
  { logo: "/plane-so logo.png", label: "Plane", col: 3, row: 3 },
  { logo: "/slack.png", label: "Slack Standup", col: 4, row: 3 },
  { logo: "/Notion-logo.png", label: "Notion Docs", col: 5, row: 3 },
  { logo: "/supabase.png", label: "Supabase DB", col: 6, row: 3 },
  { logo: "/discord.png", label: "Discord Chat", col: 7, row: 3 },
  { logo: "/cloudfare_black.svg", label: "Cloudflare", col: 8, row: 3, invert: true },
  { logo: "/whatsapp.png", label: "WhatsApp", col: 9, row: 3 },
  { logo: "/amplitude.svg", label: "Amplitude", col: 10, row: 3 },

  // ── Row 4 ──
  { logo: "/neon.png", label: "Neon", col: 1, row: 4 },
  { logo: "/github.png", label: "GitHub CI", col: 2, row: 4 },
  { logo: "/linear.png", label: "Linear Sprints", col: 3, row: 4 },
  { logo: "/sentry.svg", label: "Sentry Triage", col: 4, row: 4 },
  { logo: "/posthog.svg", label: "PostHog Events", col: 5, row: 4 },
  { logo: "/stripe.svg", label: "Stripe Billing", col: 6, row: 4 },
  { logo: "/jira-logo.jpg", label: "Jira Agile", col: 7, row: 4 },
  { logo: "/slack.png", label: "Slack Bot", col: 8, row: 4 },
  { logo: "/Notion-logo.png", label: "Notion Wiki", col: 9, row: 4 },
  { logo: "/supabase.png", label: "Supabase Auth", col: 10, row: 4 },

  // ── Row 5 ──
  { logo: "/vs-code.png", label: "VS Code Tasks", col: 1, row: 5 },
  { logo: "/cursor.png", label: "Cursor Bridge", col: 2, row: 5 },
  { logo: "/sentry.svg", label: "Sentry Alerts", col: 3, row: 5 },
  { logo: "/asana-logo.svg", label: "Asana Milestones", col: 4, row: 5 },
  { logo: "/gitlab.svg", label: "GitLab Pipelines", col: 5, row: 5 },
  { logo: "/calendly.png", label: "Calendly Sync", col: 6, row: 5 },
  { logo: "/beter-stack.svg", label: "Better Stack Ops", col: 7, row: 5 },
  { logo: "/posthog.svg", label: "PostHog Data", col: 8, row: 5 },
  { logo: "/stripe.svg", label: "Stripe Webhooks", col: 9, row: 5 },
  { logo: "/discord.png", label: "Discord Community", col: 10, row: 5 },

  // ── Row 6 ──
  { logo: "/gitlab.svg", label: "GitLab CI", col: 1, row: 6 },
  { logo: "/jira-logo.jpg", label: "Jira Boards", col: 2, row: 6 },
  { logo: "/asana-logo.svg", label: "Asana Tasks", col: 3, row: 6 },
  { logo: "/calendly.png", label: "Calendly Meet", col: 4, row: 6 },
  { logo: "/dd-logo.svg", label: "Datadog Logs", col: 5, row: 6 },
  { logo: "/beter-stack.svg", label: "Better Stack Uptime", col: 6, row: 6 },
  { logo: "/hubsport.svg", label: "HubSpot CRM", col: 7, row: 6 },
  { logo: "/plane-so logo.png", label: "Plane Cycles", col: 8, row: 6 },
  { logo: "/cloudfare_black.svg", label: "Cloudflare Edge", col: 9, row: 6, invert: true },
  { logo: "/whatsapp.png", label: "WhatsApp Alerts", col: 10, row: 6 },
];

/* ─── Radial distance for initial stagger animation ─────────────── */
const centerCol = 5.5;
const centerRow = 3.5;

const getRadialDelay = (col: number, row: number) => {
  const dist = Math.sqrt((col - centerCol) ** 2 + (row - centerRow) ** 2);
  return dist * 0.035;
};

/* ─── Components ─────────────────────────────────────────────────── */

const SmallCellComponent = ({
  cell,
  isInView,
}: {
  cell: SmallCell;
  isInView: boolean;
}) => (
  <motion.div
    style={{ gridColumn: cell.col, gridRow: cell.row }}
    initial={{ opacity: 0, scale: 0.85 }}
    animate={
      isInView
        ? {
            opacity: 1,
            scale: 1,
            y: [0, -3.5, 0],
          }
        : { opacity: 0, scale: 0.85 }
    }
    transition={{
      opacity: {
        duration: 0.45,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: getRadialDelay(cell.col, cell.row),
      },
      scale: {
        duration: 0.45,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: getRadialDelay(cell.col, cell.row),
      },
      y: {
        duration: 3.2 + ((cell.col + cell.row) % 3) * 0.7,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
        delay: ((cell.col * 2 + cell.row) % 7) * 0.25,
      },
    }}
    whileHover={{ y: -4, scale: 1.03, transition: { duration: 0.18 } }}
    className="rounded-xl border border-white/[0.05] bg-[#121316] hover:bg-[#18191f] hover:border-white/[0.18] flex flex-col items-center justify-center gap-2 p-2 transition-colors duration-200 cursor-pointer select-none group shadow-sm"
  >
    <div className="w-6 h-6 flex items-center justify-center shrink-0">
      <img
        src={cell.logo}
        alt={cell.label}
        className={`max-w-full max-h-full object-contain filter group-hover:scale-110 transition-transform duration-200 ${
          cell.invert ? "brightness-0 invert opacity-90" : ""
        }`}
      />
    </div>
    <span className="text-[11px] font-medium tracking-tight text-neutral-400 group-hover:text-white transition-colors duration-200 truncate max-w-full text-center px-1">
      {cell.label}
    </span>
  </motion.div>
);

/* ─── Main Section ───────────────────────────────────────────────── */

const AllInOneSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(sectionRef, {
    once: true,
    margin: "-60px 0px",
  });
  const gridInView = useInView(gridRef, { once: true, margin: "-80px 0px" });

  return (
    <section className="relative bg-black py-20 md:py-32 px-6 font-sans overflow-hidden">
      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* ── Header ─────────────────────────────────────────── */}
        <motion.div
          ref={sectionRef}
          className="text-center mb-14 md:mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="inline-flex items-center gap-2 px-6 py-1.5 rounded-full border border-white/20 backdrop-blur-md bg-muted/10 shadow-[0_0_20px_rgba(59,130,246,0.1)] mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
            <span className="text-sm text-neutral-100 tracking-wide">
              Supported Integrations
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white leading-[1.15] mb-5">
            Connect your entire stack.
            <br />
            <span className="text-neutral-400">Bring your work here without leaving WeKraft.</span>
          </h2>

          <p className="text-neutral-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Everything your team needs lives under one roof. No tab-juggling, no context-switching.
          </p>
        </motion.div>

        {/* ── Desktop Grid (Full 10x6 matrix) ────────────────── */}
        <div
          ref={gridRef}
          className="hidden lg:grid relative"
          style={{
            gridTemplateColumns: "repeat(10, 1fr)",
            gridAutoRows: "98px",
            gap: "8px",
            maskImage:
              "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
          }}
        >
          {smallCells.map((cell, i) => (
            <SmallCellComponent key={i} cell={cell} isInView={gridInView} />
          ))}
        </div>

        {/* ── Mobile Grid ─────────────────────────────────────── */}
        <div className="lg:hidden grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {smallCells.slice(0, 20).map((cell, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
              transition={{ duration: 0.4, delay: i * 0.03 }}
              className="rounded-xl border border-white/[0.05] bg-[#121316] flex flex-col items-center justify-center gap-2 p-3"
            >
              <div className="w-6 h-6 flex items-center justify-center shrink-0">
                <img
                  src={cell.logo}
                  alt={cell.label}
                  className={`max-w-full max-h-full object-contain ${
                    cell.invert ? "brightness-0 invert opacity-90" : ""
                  }`}
                />
              </div>
              <span className="text-xs font-medium text-neutral-300 truncate max-w-full text-center">
                {cell.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AllInOneSection;
