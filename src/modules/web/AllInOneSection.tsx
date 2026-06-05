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
  CircleDot,
  ClipboardList,
  Clock,
  Code,
  Copy,
  FileText,
  Flag,
  FolderClosed,
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
  UserPlus,
  Zap,
} from "lucide-react";
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
    label: "Deadline Tracking",
    col: 4,
    row: 2,
  },
  {
    label: "Docs & Flow Charts",
    col: 6,
    row: 2,
  },
  {
    label: "Agents",
    col: 4,
    row: 4,
  },
  {
    label: "Meet & Chat",
    col: 6,
    row: 4,
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

const getIconColorClass = (col: number, row: number) => {
  const dist = Math.sqrt((col - centerCol) ** 2 + (row - centerRow) ** 2);
  const ratio = dist / maxDist; // 0 = center, 1 = corner

  if (ratio < 0.45) return "text-white";
  if (ratio < 0.65) return "text-neutral-200";
  if (ratio < 0.85) return "text-neutral-400";
  return "text-neutral-500";
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
    <div className={getIconColorClass(cell.col, cell.row)}>{cell.icon}</div>
    <span
      className={`text-[11px] font-medium tracking-wide leading-none ${getIconColorClass(cell.col, cell.row)}`}
    >
      {cell.label}
    </span>
  </motion.div>
);

const renderCardContent = (card: BigCard) => {
  switch (card.label) {
    case "Deadline Tracking":
      return (
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none text-left bg-neutral-200">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#00000005_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />
          {/* Top blue gradient light */}
          <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />

          <div className="relative pt-5 px-4 flex flex-col gap-3 w-full h-full">
            {/* Visual project columns */}
            <div className="flex gap-3 justify-center w-full mt-2">
              {/* Needs Updates Column */}
              <div className="flex-1 flex flex-col gap-2 max-w-[110px]">
                <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded text-[9px] text-blue-600 w-fit font-semibold shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>Needs Updates</span>
                  <span className="opacity-70 ml-0.5">5</span>
                </div>
                <div className="bg-white border border-neutral-200/80 rounded-lg p-2.5 flex flex-col gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
                  <div className="space-y-1">
                    <span className="text-[9.5px] font-bold text-zinc-900 leading-tight block">UI Polish</span>
                    <span className="text-[7.5px] text-neutral-400 block">High Priority</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 border-t border-neutral-100 pt-1.5">
                    <div className="flex -space-x-1.5">
                      <div className="w-4 h-4 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center text-[7px] font-bold text-blue-600">K</div>
                      <div className="w-4 h-4 rounded-full bg-neutral-100 border-2 border-white flex items-center justify-center text-[7px] font-bold text-neutral-500">H</div>
                    </div>
                    <div className="text-neutral-450">
                      <Calendar className="w-3 h-3 text-neutral-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Closed Column */}
              <div className="flex-1 flex flex-col gap-2 max-w-[110px]">
                <div className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 px-2 py-0.5 rounded text-[9px] text-neutral-600 w-fit font-semibold shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                  <span>Closed</span>
                  <span className="opacity-70 ml-0.5">3</span>
                </div>
                <div className="bg-white border border-neutral-200/80 rounded-lg p-2.5 flex flex-col gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
                  <div className="space-y-1">
                    <span className="text-[9.5px] font-bold text-zinc-800 leading-tight block">Auth Setup</span>
                    <span className="text-[7.5px] text-neutral-400 block">Completed</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 border-t border-neutral-100 pt-1.5">
                    <div className="w-4 h-4 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center text-[7px] font-bold text-blue-500">S</div>
                    <div className="text-neutral-450">
                      <Calendar className="w-3 h-3 text-neutral-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fade Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-neutral-200 via-neutral-200/95 to-transparent z-10 pointer-events-none" />

          {/* Title centered at bottom */}
          <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20">
              <FolderClosed className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-zinc-950 font-semibold text-sm tracking-tight">
              Deadline Tracking
            </span>
          </div>
        </div>
      );
    case "Docs & Flow Charts":
      return (
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none text-left bg-neutral-200">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#00000005_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />
          {/* Top blue gradient light */}
          <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />

          <div className="relative pt-8 px-4 flex items-start justify-center w-full h-full">
            {/* Stained stacked docs */}
            <div className="relative w-full max-w-[200px] h-24 flex items-center justify-center">
              <div className="absolute left-[10%] top-[10%] w-[60%] h-[90%] rounded-lg border border-neutral-200/60 bg-[#fbfbfb]/80 -rotate-6 transform origin-bottom-left shadow-sm" />
              <div className="absolute right-[10%] top-[10%] w-[60%] h-[90%] rounded-lg border border-neutral-200/60 bg-[#fbfbfb]/80 rotate-6 transform origin-bottom-right shadow-sm" />
              <div className="absolute z-10 w-[70%] h-full rounded-lg border border-neutral-200 bg-white p-3 flex flex-col gap-2 shadow-xl shadow-neutral-200/40">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] text-zinc-900 font-bold truncate leading-none">
                    Convergence Brief
                  </span>
                  <div className="flex -space-x-1">
                    <div className="w-3.5 h-3.5 rounded-full bg-blue-50 border-[1.5px] border-white flex items-center justify-center text-[7px] font-bold text-blue-600">G</div>
                    <div className="w-3.5 h-3.5 rounded-full bg-neutral-100 border-[1.5px] border-white flex items-center justify-center text-[7px] font-bold text-neutral-500">R</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 leading-none mt-1">
                  <span className="text-[8px] text-blue-500">★</span>
                  <div className="h-1 bg-neutral-200 rounded-full w-12" />
                </div>
                <div className="flex items-center gap-1 mt-1 text-[8px] font-semibold text-neutral-500 bg-neutral-50 border border-neutral-150 rounded px-1.5 py-0.5 w-fit scale-95 origin-left">
                  <span>Flow Chart</span>
                  <span className="text-blue-500 font-bold">→</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fade Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-neutral-200 via-neutral-200/95 to-transparent z-10 pointer-events-none" />

          {/* Title centered at bottom */}
          <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
              <FileText className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-zinc-950 font-semibold text-sm tracking-tight">
              Docs & Flow Charts
            </span>
          </div>
        </div>
      );
    case "Agents":
      return (
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none text-left bg-neutral-200">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#00000005_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />
          {/* Top blue gradient light */}
          <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />

          <div className="relative pt-6 px-5 w-full h-full font-sans">
            <div className="space-y-3 w-full max-w-[220px] mx-auto">
              {/* User message */}
              <div className="ml-auto bg-blue-600 border border-blue-500 rounded-2xl rounded-tr-sm px-3 py-1.5 text-[10px] text-white w-fit max-w-[85%] text-right leading-tight shadow-sm font-medium">
                Draft post for product launch
              </div>
              {/* Search Box */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-neutral-100 border border-neutral-200/60 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-neutral-500" />
                </div>
                <div className="flex-1 bg-white border border-neutral-200 shadow-sm rounded-md px-2.5 py-1.5 flex items-center justify-between text-[9px] text-neutral-800">
                  <span className="font-medium text-neutral-500">Search</span>
                  <span className="text-[8px] text-neutral-400 bg-neutral-100 border border-neutral-200 px-1 py-0.5 rounded font-mono">
                    ⌘K
                  </span>
                </div>
              </div>
              {/* Checkbox item */}
              <div className="flex items-center justify-between bg-white border border-neutral-200 shadow-sm rounded-md px-2.5 py-1.5 mt-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded border border-blue-200 flex items-center justify-center bg-blue-50">
                    <span className="text-[8px] text-blue-600 font-bold">✓</span>
                  </div>
                  <span className="text-[10px] text-zinc-800 font-medium">
                    AI Writer Draft
                  </span>
                </div>
                <div className="flex items-center gap-1.5 scale-90 origin-right">
                  <span className="text-[7px] bg-amber-50 text-amber-700 border border-amber-100 px-1 py-0.5 rounded font-semibold tracking-wider">
                    IN PROGRESS
                  </span>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-amber-400 shadow-sm shrink-0" />
                </div>
              </div>
            </div>
          </div>

          {/* Fade Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-neutral-200 via-neutral-200/95 to-transparent z-10 pointer-events-none" />

          {/* Title centered at bottom */}
          <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-zinc-950 font-semibold text-sm tracking-tight">
              Agents
            </span>
          </div>
        </div>
      );
    case "Meet & Chat":
      return (
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none text-left bg-neutral-200">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#00000005_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />
          {/* Top blue gradient light */}
          <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />

          {/* 10+ Messages Badge at top right corner */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5 text-[8.5px] text-blue-600 font-semibold shadow-sm">
            <MessageCircle className="w-3 h-3 text-blue-500" />
            <span>10+ messages</span>
          </div>

          {/* Content area aligned to top to match other cards */}
          <div className="relative pt-12 px-4 flex items-start justify-center w-full h-full">
            {/* The main rectangular box (large video tile for 1st user) */}
            <div className="relative w-full max-w-[210px] h-[92px] bg-neutral-50/50 border border-neutral-200 rounded-xl overflow-hidden shadow-sm flex items-center justify-center">
              {/* First User Content */}
              <div className="flex flex-col items-center justify-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-white border border-neutral-200/80 flex items-center justify-center text-xs font-semibold text-neutral-600 shadow-sm">
                  R
                </div>
                <span className="text-[8px] text-neutral-500 font-medium">Ritesh</span>
              </div>

              {/* Second User floating screen at the bottom-right (lower right side) */}
              <div className="absolute bottom-1.5 right-1.5 w-14 h-10 bg-white border border-neutral-200 shadow-[0_2px_8px_rgba(0,0,0,0.06)] rounded-lg flex items-center justify-center overflow-hidden">
                <div className="flex flex-col items-center justify-center gap-0.5">
                  <div className="w-5 h-5 rounded-full bg-neutral-50 border border-neutral-150 flex items-center justify-center text-[7px] font-semibold text-neutral-500">
                    R
                  </div>
                  <span className="text-[5.5px] text-neutral-400 font-medium leading-none">Rox</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fade Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-neutral-200 via-neutral-200/95 to-transparent z-10 pointer-events-none" />

          {/* Title centered at bottom */}
          <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
              <MessageCircle className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-zinc-950 font-semibold text-sm tracking-tight">
              Meet & Chat
            </span>
          </div>
        </div>
      );
    default:
      return null;
  }
};

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
    className="rounded-xl border overflow-hidden transition-all duration-400 border-neutral-300 bg-neutral-200 hover:border-neutral-400 shadow-[0_4px_24px_rgba(0,0,0,0.02)]"
  >
    {renderCardContent(card)}
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
    <section className="hidden md:block relative bg-black py-20 md:py-32 px-6 font-sans overflow-hidden">
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
              Core Platform
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white leading-[1.15] mb-5">
            All apps, all Intelligence.
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
            gridAutoRows: "98px",
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
              className="rounded-xl border overflow-hidden h-28 text-left border-neutral-300 bg-neutral-200"
            >
              {renderCardContent(card)}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AllInOneSection;
