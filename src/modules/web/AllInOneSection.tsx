"use client";

import { motion, useInView } from "framer-motion";
import {
  AtSign,
  BarChart,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  Briefcase,
  Calendar,
  CalendarCheck,
  CheckSquare,
  CircleDot,
  ClipboardList,
  Clock,
  Code,
  Copy,
  FileText,
  Flag,
  Gauge,
  GitBranch,
  Globe,
  Hash,
  Headphones,
  History,
  Inbox,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  Link,
  ListChecks,
  ListOrdered,
  Mail,
  Map,
  MessageCircle,
  Repeat,
  Search,
  Settings2,
  Shield,
  Smartphone,
  Sparkles,
  Table,
  Tag,
  Target,
  Timer,
  TrendingUp,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useRef } from "react";

/* ─── Grid cell types ────────────────────────────────────────────── */

interface SmallCell {
  icon: React.ReactNode;
  label: string;
  col: number;
  row: number;
}

interface BigCard {
  label: string;
  col: number;
  row: number;
  image?: string;
  imageAlt?: string;
  svgIcon?: string;
  lucideIcon?: React.ReactNode;
  tagline?: string;
}

/* ─── Data ───────────────────────────────────────────────────────── */

const smallCells: SmallCell[] = [
  // ── Row 1 ──
  {
    icon: <GitBranch className="w-5 h-5" />,
    label: "GitHub Sync",
    col: 1,
    row: 1,
  },
  { icon: <Search className="w-5 h-5" />, label: "Search", col: 2, row: 1 },
  { icon: <CircleDot className="w-5 h-5" />, label: "Issues", col: 3, row: 1 },
  { icon: <Repeat className="w-5 h-5" />, label: "Sprints", col: 4, row: 1 },
  { icon: <BookOpen className="w-5 h-5" />, label: "Wikis", col: 5, row: 1 },
  { icon: <Bot className="w-5 h-5" />, label: "AI Agents", col: 6, row: 1 },
  { icon: <Calendar className="w-5 h-5" />, label: "Calendar", col: 7, row: 1 },
  { icon: <Gauge className="w-5 h-5" />, label: "Velocity", col: 8, row: 1 },
  {
    icon: <Briefcase className="w-5 h-5" />,
    label: "Portfolios",
    col: 9,
    row: 1,
  },
  { icon: <Copy className="w-5 h-5" />, label: "Templates", col: 10, row: 1 },

  // ── Row 2 sides ──
  {
    icon: <Bell className="w-5 h-5" />,
    label: "Notifications",
    col: 1,
    row: 2,
  },
  { icon: <BarChart3 className="w-5 h-5" />, label: "Reports", col: 2, row: 2 },
  { icon: <Target className="w-5 h-5" />, label: "Goals", col: 3, row: 2 },
  { icon: <Zap className="w-5 h-5" />, label: "Automations", col: 8, row: 2 },
  {
    icon: <Settings2 className="w-5 h-5" />,
    label: "Custom Fields",
    col: 9,
    row: 2,
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    label: "AI Writer",
    col: 10,
    row: 2,
  },

  // ── Row 3 sides ──
  { icon: <Code className="w-5 h-5" />, label: "API", col: 1, row: 3 },
  { icon: <Flag className="w-5 h-5" />, label: "Milestones", col: 2, row: 3 },
  {
    icon: <ClipboardList className="w-5 h-5" />,
    label: "Forms",
    col: 3,
    row: 3,
  },
  { icon: <Layers className="w-5 h-5" />, label: "Workflows", col: 8, row: 3 },
  { icon: <Link className="w-5 h-5" />, label: "Integrations", col: 9, row: 3 },
  {
    icon: <History className="w-5 h-5" />,
    label: "Time Logs",
    col: 10,
    row: 3,
  },

  // ── Row 4 sides ──
  { icon: <AtSign className="w-5 h-5" />, label: "Mentions", col: 1, row: 4 },
  {
    icon: <ListOrdered className="w-5 h-5" />,
    label: "Priorities",
    col: 2,
    row: 4,
  },
  { icon: <Timer className="w-5 h-5" />, label: "Estimates", col: 3, row: 4 },
  { icon: <Globe className="w-5 h-5" />, label: "Activity", col: 8, row: 4 },
  { icon: <LayoutGrid className="w-5 h-5" />, label: "Views", col: 9, row: 4 },
  {
    icon: <Shield className="w-5 h-5" />,
    label: "Permissions",
    col: 10,
    row: 4,
  },

  // ── Row 5 sides ──
  { icon: <Mail className="w-5 h-5" />, label: "Email", col: 1, row: 5 },
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    label: "Dashboards",
    col: 2,
    row: 5,
  },
  {
    icon: <Clock className="w-5 h-5" />,
    label: "Time Tracking",
    col: 3,
    row: 5,
  },
  { icon: <Tag className="w-5 h-5" />, label: "Labels", col: 8, row: 5 },
  {
    icon: <UserPlus className="w-5 h-5" />,
    label: "Guest Access",
    col: 9,
    row: 5,
  },
  { icon: <FileText className="w-5 h-5" />, label: "Exports", col: 10, row: 5 },

  // ── Row 6 ──
  { icon: <Hash className="w-5 h-5" />, label: "Channels", col: 1, row: 6 },
  {
    icon: <Headphones className="w-5 h-5" />,
    label: "24/7 Support",
    col: 2,
    row: 6,
  },
  {
    icon: <ListChecks className="w-5 h-5" />,
    label: "Checklists",
    col: 3,
    row: 6,
  },
  {
    icon: <CalendarCheck className="w-5 h-5" />,
    label: "Scheduling",
    col: 4,
    row: 6,
  },
  {
    icon: <Table className="w-5 h-5" />,
    label: "Spreadsheets",
    col: 5,
    row: 6,
  },
  {
    icon: <MessageCircle className="w-5 h-5" />,
    label: "Team Chat",
    col: 6,
    row: 6,
  },
  {
    icon: <BarChart className="w-5 h-5" />,
    label: "Gantt Charts",
    col: 7,
    row: 6,
  },
  { icon: <Map className="w-5 h-5" />, label: "Roadmaps", col: 8, row: 6 },
  { icon: <Inbox className="w-5 h-5" />, label: "Inbox", col: 9, row: 6 },
  {
    icon: <Smartphone className="w-5 h-5" />,
    label: "Mobile",
    col: 10,
    row: 6,
  },
];

const bigCards: BigCard[] = [
  {
    label: "Tasks",
    col: 4,
    row: 2,
    lucideIcon: <CheckSquare className="w-5 h-5" />,
  },
  {
    label: "Teamspace",
    col: 6,
    row: 2,
    lucideIcon: <Users className="w-5 h-5" />,
  },
  {
    label: "Kaya AI",
    col: 4,
    row: 4,
    svgIcon: "/kaya.svg",
  },
  {
    label: "Insights",
    col: 6,
    row: 4,
    lucideIcon: <TrendingUp className="w-5 h-5" />,
  },
];

/* ─── Radial distance for stagger animation ──────────────────────── */
const centerCol = 5.5;
const centerRow = 3.5;
const maxDist = Math.sqrt((1 - centerCol) ** 2 + (1 - centerRow) ** 2);

const getRadialDelay = (col: number, row: number) => {
  const dist = Math.sqrt((col - centerCol) ** 2 + (row - centerRow) ** 2);
  return dist * 0.04;
};

/** Returns bg class: closer to center = darker/more opaque, outer = lighter */
const getCellBg = (col: number, row: number) => {
  const dist = Math.sqrt((col - centerCol) ** 2 + (row - centerRow) ** 2);
  const ratio = dist / maxDist; // 0 = center, 1 = corner
  if (ratio < 0.35) return "bg-muted";
  if (ratio < 0.55) return "bg-muted/80";
  if (ratio < 0.75) return "bg-muted/50";
  return "bg-muted/20";
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
    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
    transition={{
      duration: 0.45,
      ease: [0.25, 0.46, 0.45, 0.94],
      delay: getRadialDelay(cell.col, cell.row),
    }}
    className={`rounded-xl border border-white/[0.03] ${getCellBg(cell.col, cell.row)} flex flex-col items-center justify-center gap-2.5 hover:bg-neutral-800/60 hover:border-white/[0.06] transition-all duration-300 cursor-default`}
  >
    <div className="text-neutral-500">{cell.icon}</div>
    <span className="text-[11px] text-neutral-500 font-medium tracking-wide leading-none">
      {cell.label}
    </span>
  </motion.div>
);

const BigCardComponent = ({
  card,
  isInView,
}: {
  card: BigCard;
  isInView: boolean;
}) => (
  <motion.div
    style={{
      gridColumn: `${card.col} / span 2`,
      gridRow: `${card.row} / span 2`,
    }}
    initial={{ opacity: 0, scale: 0.9, y: 20 }}
    animate={
      isInView
        ? { opacity: 1, scale: 1, y: 0 }
        : { opacity: 0, scale: 0.9, y: 20 }
    }
    transition={{
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
      delay: getRadialDelay(card.col + 0.5, card.row + 0.5),
    }}
    className="rounded-xl border border-white/[0.04] bg-muted overflow-hidden hover:border-white/[0.08] transition-colors duration-400"
  />
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
    <section className="bg-black py-20 md:py-32 px-6 font-sans overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        {/* ── Header ─────────────────────────────────────────── */}
        <motion.div
          ref={sectionRef}
          className="text-center mb-14 md:mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 backdrop-blur-md bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.1)] mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
            <span className="text-sm text-neutral-200 tracking-wide">
              Core Platform
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white leading-[1.15] mb-5">
            All apps, all intelligence.
            <br />
            <span className="text-neutral-400">One workspace.</span>
          </h2>

          <p className="text-neutral-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Everything your team needs — from tasks and sprints to AI agents and
            real-time insights — lives under one roof. No tab-juggling, no
            context-switching.
          </p>
        </motion.div>

        {/* ── Desktop Grid ───────────────────────────────────── */}
        <div
          ref={gridRef}
          className="hidden lg:grid relative"
          style={{
            gridTemplateColumns: "repeat(10, 1fr)",
            gridAutoRows: "110px",
            gap: "8px",
            maskImage:
              "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
          }}
        >


          {/* Small cells */}
          {smallCells.map((cell, i) => (
            <SmallCellComponent key={i} cell={cell} isInView={gridInView} />
          ))}

          {/* Big featured cards */}
          {bigCards.map((card, i) => (
            <BigCardComponent
              key={`big-${i}`}
              card={card}
              isInView={gridInView}
            />
          ))}
        </div>

        {/* ── Mobile Grid (simplified) ───────────────────────── */}
        <div className="lg:hidden grid grid-cols-2 gap-3">
          {bigCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={
                headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-xl border border-white/[0.04] bg-muted overflow-hidden h-28"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AllInOneSection;
