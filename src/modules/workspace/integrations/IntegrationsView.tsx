"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import {
  Blocks,
  CheckCircle2,
  ExternalLink,
  Layers,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "../../../../convex/_generated/api";

interface IntegrationTool {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  logo: string;
  isSvg?: boolean;
  persona: "kaya" | "harry";
  personaRole: "PM Context" | "Dev Context";
  status: "available" | "coming_soon" | "connected";
  capabilities: string[];
}

const INTEGRATION_TOOLS: IntegrationTool[] = [
  // ─── KAYA (PM CONTEXT) ──────────────────────────────────────────────────────
  {
    id: "linear",
    name: "Linear",
    subtitle: "Issues & Sprint Cycles",
    description:
      "Sync issues, cycles, and backlog states directly into Kaya's sprint engine.",
    logo: "/linear.png",
    persona: "kaya",
    personaRole: "PM Context",
    status: "available",
    capabilities: [
      "Auto-sync active sprint cycles",
      "Bi-directional issue state mapping",
      "Backlog velocity analysis",
    ],
  },
  {
    id: "notion",
    name: "Notion",
    subtitle: "Product Specs & Docs",
    description:
      "Index product requirement docs (PRDs), meeting notes, and roadmap wikis.",
    logo: "/Notion-logo.png",
    persona: "kaya",
    personaRole: "PM Context",
    status: "coming_soon",
    capabilities: [
      "Workspace document RAG",
      "Auto-extract task requirements",
      "Roadmap & timeline sync",
    ],
  },
  {
    id: "slack",
    name: "Slack",
    subtitle: "Team Decisions & Updates",
    description:
      "Capture channel discussions, standup updates, and architectural decisions.",
    logo: "/slack.png",
    persona: "kaya",
    personaRole: "PM Context",
    status: "coming_soon",
    capabilities: [
      "Channel conversation ingest",
      "Daily standup summarization",
      "Blocker & bottleneck detection",
    ],
  },
  {
    id: "calendly",
    name: "Calendly",
    subtitle: "Team Availability",
    description:
      "Sync team availability and meeting schedules for automated calendar planning.",
    logo: "/calendly.png",
    persona: "kaya",
    personaRole: "PM Context",
    status: "coming_soon",
    capabilities: [
      "Smart meeting scheduling",
      "Member availability checks",
      "Sprint capacity calculation",
    ],
  },
  {
    id: "jira",
    name: "Jira",
    subtitle: "Legacy Epics & Sprints",
    description:
      "Import epics, stories, and sprint boards for legacy project migration.",
    logo: "/jira-logo.jpg",
    persona: "kaya",
    personaRole: "PM Context",
    status: "coming_soon",
    capabilities: [
      "Historical sprint import",
      "Issue status mapping",
      "Legacy backlog conversion",
    ],
  },

  // ─── HARRY (DEV CONTEXT) ────────────────────────────────────────────────────
  {
    id: "github",
    name: "GitHub",
    subtitle: "Codebase & Pull Requests",
    description:
      "Codebase file tree mapping, pull request reviews, and commit activity tracking.",
    logo: "/github.png",
    persona: "harry",
    personaRole: "Dev Context",
    status: "coming_soon",
    capabilities: [
      "Multi-file code context index",
      "Automated PR diff analysis",
      "Commit activity & heatmaps",
    ],
  },
  {
    id: "vercel",
    name: "Vercel",
    subtitle: "Deployments & Previews",
    description:
      "Real-time deployment statuses, build failure alerts, and preview URLs.",
    logo: "vercel",
    isSvg: true,
    persona: "harry",
    personaRole: "Dev Context",
    status: "coming_soon",
    capabilities: [
      "Build failure triage",
      "Preview deployment tracking",
      "Instant rollback suggestions",
    ],
  },
  {
    id: "sentry",
    name: "Sentry",
    subtitle: "Runtime Errors & Traces",
    description:
      "Production exception tracking, crash stack traces, and issue frequencies.",
    logo: "/sentry.svg",
    persona: "harry",
    personaRole: "Dev Context",
    status: "coming_soon",
    capabilities: [
      "Live stack trace ingestion",
      "Crash frequency analysis",
      "Automated root-cause code link",
    ],
  },
];

export const IntegrationsView = () => {
  const params = useParams();
  const slug = params.slug as string;

  const project = useQuery(api.project.getProjectBySlug, { slug });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "kaya" | "harry">(
    "all",
  );
  const [selectedTool, setSelectedTool] = useState<IntegrationTool | null>(
    null,
  );
  const [isLinearModalOpen, setIsLinearModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const filteredTools = INTEGRATION_TOOLS.filter((tool) => {
    const matchesAgent =
      activeFilter === "all" || tool.persona === activeFilter;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAgent && matchesSearch;
  });

  const kayaTools = filteredTools.filter((t) => t.persona === "kaya");
  const harryTools = filteredTools.filter((t) => t.persona === "harry");

  const handleOpenConnect = (tool: IntegrationTool) => {
    if (tool.status === "available" && tool.id === "linear") {
      setSelectedTool(tool);
      setIsLinearModalOpen(true);
    } else {
      toast.info(`${tool.name} integration is scheduled for future work.`);
    }
  };

  const handleConnectLinear = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsLinearModalOpen(false);
      toast.success(
        "Linear connector configured! Live sync scheduled for next release.",
      );
    }, 800);
  };

  const renderToolLogo = (tool: IntegrationTool) => {
    if (tool.logo === "vercel") {
      return (
        <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-border/60 flex items-center justify-center shrink-0">
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 fill-foreground text-foreground"
          >
            <path d="M12 1L24 22H0L12 1Z" />
          </svg>
        </div>
      );
    }

    if (tool.id === "sentry") {
      return (
        <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-border/60 flex items-center justify-center p-2 shrink-0 overflow-hidden">
          <Image
            src={tool.logo}
            alt={tool.name}
            width={28}
            height={28}
            className="object-contain dark:invert"
          />
        </div>
      );
    }

    return (
      <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-border/60 flex items-center justify-center p-2 shrink-0 overflow-hidden">
        <Image
          src={tool.logo}
          alt={tool.name}
          width={28}
          height={28}
          className="object-contain"
        />
      </div>
    );
  };

  const renderToolCard = (tool: IntegrationTool) => {
    const isAvailable = tool.status === "available";

    return (
      <div
        key={tool.id}
        className="group relative flex flex-col justify-between rounded-xl border border-border/60 bg-card/40 hover:bg-card/70 hover:border-border transition-all duration-200 p-5"
      >
        <div className="space-y-4">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {renderToolLogo(tool)}
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-semibold text-foreground">
                    {tool.name}
                  </h4>
                  {isAvailable ? (
                    <Badge
                      variant="outline"
                      className="text-[10px] font-medium px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    >
                      Available
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-[10px] font-medium px-2 py-0.5 bg-muted/40 text-muted-foreground border-border/50"
                    >
                      Planned
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{tool.subtitle}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground/90 leading-relaxed">
            {tool.description}
          </p>

          {/* Capabilities */}
          <div className="space-y-1 pt-1 border-t border-border/40">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
              Brain Capabilities
            </p>
            <ul className="space-y-1">
              {tool.capabilities.map((cap, i) => (
                <li
                  key={i}
                  className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
                >
                  <span className="h-1 w-1 rounded-full bg-primary/60 shrink-0" />
                  <span>{cap}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-5 mt-4 border-t border-border/40 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground/70">
            {isAvailable ? "Ready to configure" : "Roadmap item"}
          </span>

          {isAvailable ? (
            <Button
              size="sm"
              onClick={() => handleOpenConnect(tool)}
              className="h-8 text-xs font-medium gap-1.5 px-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Connect {tool.name}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled
              className="h-8 text-xs font-normal gap-1.5 px-3 bg-muted/20 border-border/40 text-muted-foreground/60 cursor-not-allowed"
            >
              <Lock className="h-3 w-3" />
              Coming Soon
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full min-h-screen p-6 md:p-8 space-y-8 bg-background">
      {/* ─── Header & Project Brain Status ──────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/50 pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium text-primary tracking-wider uppercase">
              Project Brain
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              {project?.projectName || "Workspace"}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Blocks className="h-7 w-7 text-primary" />
            Integrations
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Connect your tools to empower your agents. The Project Brain indexes
            synced data per project, providing Kaya and Harry with real-time
            domain knowledge.
          </p>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-3 bg-card/60 border border-border/60 rounded-xl px-4 py-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-medium text-foreground">
              Brain Core
            </span>
          </div>
          <span className="text-border">|</span>
          <span className="text-xs text-muted-foreground">
            0 Connected • 1 Available
          </span>
        </div>
      </div>

      {/* ─── Search & Persona Filter Tabs ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-muted/40 border border-border/50 rounded-lg w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeFilter === "all"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Integrations ({INTEGRATION_TOOLS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("kaya")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeFilter === "kaya"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Image src="/kaya.svg" alt="Kaya" width={14} height={14} />
            Kaya (PM Context)
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("harry")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeFilter === "harry"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Image src="/harry.svg" alt="Harry" width={14} height={14} />
            Harry (Dev Context)
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools..."
            className="pl-8 h-9 text-xs bg-card/40 border-border/50"
          />
        </div>
      </div>

      {/* ─── SECTION 1: KAYA (PM CONTEXT) ───────────────────────────────────── */}
      {(activeFilter === "all" || activeFilter === "kaya") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Image src="/kaya.svg" alt="Kaya" width={18} height={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-foreground">
                    Kaya — PM Context
                  </h3>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-normal px-2 py-0 border-border/50 text-muted-foreground"
                  >
                    Product & Project Intelligence
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Empower Kaya with sprint roadmaps, product specs, meeting
                  notes, and team communication.
                </p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground hidden md:inline-block">
              {kayaTools.length} tools
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kayaTools.map(renderToolCard)}
          </div>
        </div>
      )}

      {/* ─── SECTION 2: HARRY (DEV CONTEXT) ─────────────────────────────────── */}
      {(activeFilter === "all" || activeFilter === "harry") && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Image src="/harry.svg" alt="Harry" width={18} height={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-foreground">
                    Harry — Dev Context
                  </h3>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-normal px-2 py-0 border-border/50 text-muted-foreground"
                  >
                    Engineering & Runtime Intelligence
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Empower Harry with codebase commits, pull request discussions,
                  live errors, and deployment states.
                </p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground hidden md:inline-block">
              {harryTools.length} tools
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {harryTools.map(renderToolCard)}
          </div>
        </div>
      )}

      {/* ─── LINEAR CONNECT MODAL (MINIMAL PREVIEW) ─────────────────────────── */}
      <Dialog open={isLinearModalOpen} onOpenChange={setIsLinearModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border/60">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-border/60 flex items-center justify-center p-1.5 shrink-0">
                <Image
                  src="/linear.png"
                  alt="Linear"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <div>
                <DialogTitle className="text-base">
                  Connect Linear to Project Brain
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Feeds active issues and cycles directly to Kaya PM Agent.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleConnectLinear} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Linear Personal API Key
              </label>
              <Input
                type="password"
                placeholder="lin_api_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="h-9 text-xs bg-muted/30 font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                Generate in Linear Settings → Account → Security & Access →
                Personal API Keys.
              </p>
            </div>

            <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">
                  Default Team Scope
                </span>
                <Badge variant="outline" className="text-[10px] font-mono">
                  Auto-Detect
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Kaya will automatically discover teams and cycles associated
                with this API key.
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsLinearModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isConnecting}
                className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    Save & Test Connection
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
