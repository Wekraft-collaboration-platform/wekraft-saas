"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useKayaStore } from "@/store/useKayaStore";
import {
  Mic,
  Send,
  Plus,
  Activity,
  Mail,
  FileUp,
  ChevronDown,
  Check,
  FolderCode,
  Loader2,
  Paperclip,
} from "lucide-react";
import { cn } from "@/lib/utils";
import RightSidebar from "@/app/(main)/dashboard/RightSidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface TemplateItem {
  title: string;
  body: string;
  prompt: string;
  icon: React.ReactNode;
}

const CONNECTOR_INFO: Record<
  string,
  { name: string; logo: string; bgClass?: string; iconClass?: string }
> = {
  linear: { name: "Linear", logo: "/linear.png" },
  notion: { name: "Notion", logo: "/Notion-logo.png" },
  slack: { name: "Slack", logo: "/slack.png" },
  calendly: { name: "Calendly", logo: "/calendly.png" },
  jira: {
    name: "Jira",
    logo: "/jira-logo.jpg",
    bgClass: "bg-white border-zinc-300",
  },
  sentry: {
    name: "Sentry",
    logo: "/sentry.svg",
    bgClass: "bg-purple-900 border-purple-800",
    iconClass: "brightness-0 invert",
  },
  github: {
    name: "GitHub",
    logo: "/github.png",
    bgClass: "bg-white border-zinc-300",
  },
  vercel: { name: "Vercel", logo: "/vercel-color.svg" },
  datadog: { name: "Datadog", logo: "/datadog.png" },
  betterstack: { name: "Better Stack", logo: "/betterstack.png" },
  asana: { name: "Asana", logo: "/asana-logo.svg" },
  discord: { name: "Discord", logo: "/discord.png" },
};

export function AgentDashboardView() {
  const router = useRouter();
  const setIsKayaOpen = useKayaStore((s) => s.setIsOpen);
  const [prompt, setPrompt] = useState("");
  const [isRightSidebarExpanded, setIsRightSidebarExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all user projects with task and issue counts
  const projectsOverview = useQuery(api.project.getAgentProjectsOverview);

  // Sort projects: highest (taskCount + issueCount) first, then newest created
  const sortedProjects = useMemo(() => {
    if (!projectsOverview || projectsOverview.length === 0) return [];
    return [...projectsOverview].sort((a, b) => {
      const aTotal = (a.taskCount || 0) + (a.issueCount || 0);
      const bTotal = (b.taskCount || 0) + (b.issueCount || 0);

      if (bTotal !== aTotal) return bTotal - aTotal;

      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }, [projectsOverview]);

  // Selected project state - defaults to the top prioritized project
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (sortedProjects.length > 0) {
      if (
        !selectedProjectId ||
        !sortedProjects.some((p) => p._id === selectedProjectId)
      ) {
        setSelectedProjectId(sortedProjects[0]._id);
      }
    }
  }, [sortedProjects, selectedProjectId]);

  const selectedProject = useMemo(() => {
    return (
      sortedProjects.find((p) => p._id === selectedProjectId) ||
      sortedProjects[0] ||
      null
    );
  }, [sortedProjects, selectedProjectId]);

  // MCP Connections query for selected project
  const mcpConnections = useQuery(
    api.mcp.getConnectionsByProject,
    selectedProject
      ? { projectId: selectedProject._id as Id<"projects"> }
      : "skip",
  );

  const isMcpLoading = selectedProject && mcpConnections === undefined;

  // Show all connected MCP tools for this project
  const connectedMcpList = useMemo(() => {
    if (!mcpConnections) return [];
    return mcpConnections.filter((c) => c.isConnected);
  }, [mcpConnections]);

  const kayaTemplates: TemplateItem[] = [
    {
      title: "Team workload & status",
      body: "Get team workload and project status",
      prompt: "Get team workload and project status overview.",
      icon: (
        <Activity className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
      ),
    },
    {
      title: "Generate project report",
      body: "Generate full project report and send it to my gmail",
      prompt: "Generate full project report and send it to my gmail.",
      icon: (
        <Mail className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
      ),
    },
    {
      title: "PRD to tasks & issues",
      body: "Upload PRD/ doc to auto create Tasks or issues",
      prompt: "Upload PRD/ doc to auto create Tasks or issues.",
      icon: (
        <FileUp className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
      ),
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row items-start w-full min-h-[calc(100vh-120px)] relative">
      {/* Center Agent Interface */}
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center min-h-[calc(100vh-140px)] w-full px-4 select-none relative">
        {/* Top Left Project Selector Dropdown */}
        <div className="w-full flex items-center justify-start px-2 sm:px-6 pt-2 pb-4 absolute top-0 left-0 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-200 transition-all cursor-pointer shadow-xs max-w-[220px]"
              >
                <FolderCode className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="truncate">
                  {selectedProject
                    ? selectedProject.projectName
                    : projectsOverview === undefined
                      ? "Loading..."
                      : "Select Project"}
                </span>
                <ChevronDown className="w-3 h-3 text-zinc-400 shrink-0 ml-0.5 opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-56 bg-zinc-950/95 backdrop-blur-md border-zinc-800 text-zinc-200 p-1.5 shadow-2xl rounded-xl z-50 max-h-[320px] overflow-y-auto"
            >
              <div className="px-2.5 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Select Project
              </div>
              {sortedProjects.length === 0 ? (
                <div className="px-2.5 py-3 text-xs text-zinc-500 text-center">
                  {projectsOverview === undefined
                    ? "Loading projects..."
                    : "No projects found"}
                </div>
              ) : (
                sortedProjects.map((p) => {
                  const isSelected = p._id === selectedProject?._id;
                  return (
                    <DropdownMenuItem
                      key={p._id}
                      onClick={() => setSelectedProjectId(p._id)}
                      className={cn(
                        "flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors focus:bg-zinc-800 focus:text-zinc-100 mb-0.5",
                        isSelected
                          ? "bg-zinc-900 text-zinc-100 font-medium border border-zinc-800/80"
                          : "text-zinc-300 hover:bg-zinc-900/60",
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FolderCode
                          className={cn(
                            "w-3.5 h-3.5 shrink-0",
                            isSelected ? "text-white" : "text-zinc-400",
                          )}
                        />
                        <span className="truncate">{p.projectName}</span>
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-white shrink-0" />
                      )}
                    </DropdownMenuItem>
                  );
                })
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Centered Logo & Title */}
        <div className="flex items-center gap-3 mb-8 mt-12 sm:mt-8">
          <div className="relative w-9 h-9 flex items-center justify-center">
            <Image
              src="/kaya.svg"
              alt="Kaya"
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Kaya
          </h1>
        </div>

        {/* Card Wrapper */}
        <div className="w-full max-w-[760px]">
          {/* Main Box - Fully rounded on all sides */}
          <div className="relative w-full rounded-2xl! bg-[#09090b] border-[1.5px] border-[#d8b4fe]/70 overflow-hidden!">
            {/* Input area */}
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (prompt.trim() && selectedProject) {
                    setIsKayaOpen(true);
                    router.push(`/dashboard/my-projects/${selectedProject.slug}/workspace/tasks`);
                  }
                }
              }}
              placeholder="Ask Kaya anything about your project or upload a PRD..."
              rows={3}
              className="w-full bg-neutral-900 text-sm p-4 text-zinc-100 placeholder:text-zinc-300 resize-none outline-none leading-relaxed min-h-[90px]"
            />

            {/* Hidden upload input */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setPrompt((prev) =>
                    prev
                      ? `${prev}\n[Attached: ${file.name}]`
                      : `[Attached: ${file.name}]`,
                  );
                }
              }}
            />

            {/* Bottom Bar */}
            <div className="flex items-center justify-between border-t pt-2 px-6 pb-4">
              {/* Left Side: Upload Icon with Background & MCP */}
              <div className="flex items-center gap-2">
                {/* Upload icon with background */}
                <Button
                  type="button"
                  size={"icon-sm"}
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-neutral-800 text-white hover:bg-neutral-600 rounded! cursor-pointer"
                  title="Upload attachment"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>

                {/* MCP Box with live loading and connector icons */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
                  <span className="font-semibold text-[11px] tracking-wide text-zinc-300">
                    MCP
                  </span>

                  {isMcpLoading ? (
                    <div className="flex items-center px-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                    </div>
                  ) : connectedMcpList.length > 0 ? (
                    <div className="flex items-center -space-x-1.5">
                      {connectedMcpList.slice(0, 4).map((conn, idx) => {
                        const connKey = (conn.connectorId || "").toLowerCase();
                        const info = CONNECTOR_INFO[connKey];
                        return (
                          <div
                            key={conn._id || idx}
                            className={cn(
                              "w-5 h-5 rounded-full border overflow-hidden flex items-center justify-center relative shrink-0 shadow-xs",
                              info?.bgClass || "bg-zinc-800 border-zinc-700",
                            )}
                            title={`${info?.name || conn.connectorId} (connected)`}
                          >
                            {info?.logo ? (
                              <Image
                                src={info.logo}
                                alt={info.name || conn.connectorId}
                                width={16}
                                height={16}
                                className={cn(
                                  "w-3.5 h-3.5 object-contain",
                                  info?.iconClass,
                                )}
                              />
                            ) : (
                              <span className="text-[9px] font-bold text-zinc-300 uppercase">
                                {conn.connectorId.charAt(0)}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : null}

                  <Link
                    href={
                      selectedProject
                        ? `/dashboard/my-projects/${selectedProject.slug}/workspace/integrations`
                        : "/dashboard"
                    }
                    className="p-0.5 rounded text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                    title="Connect or manage MCP servers"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right Side: Mic & Send Button */}
              <div className="flex items-center gap-2">
                <Button
                  size={"icon-sm"}
                  type="button"
                  className="bg-neutral-800  hover:bg-neutral-600 text-white rounded! cursor-pointer"
                  title="Voice input"
                >
                  <Mic className="w-4 h-4" />
                </Button>

                <Button
                  size={"icon-sm"}
                  disabled={!prompt.trim()}
                  onClick={() => {
                    if (prompt.trim() && selectedProject) {
                      setIsKayaOpen(true);
                      router.push(`/dashboard/my-projects/${selectedProject.slug}/workspace/tasks`);
                    }
                  }}
                  className={cn(
                    "cursor-pointer flex items-center justify-center",
                    prompt.trim()
                      ? "bg-slate-100 text-neutral-900 hover:bg-slate-200"
                      : "bg-zinc-800 border border-zinc-800 text-zinc-300 cursor-not-allowed",
                  )}
                  title="Send message to Kaya"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* 3 Quick Templates - Serious Linear style (title, body, icon, bg-gradient-to-br from-white/15 to neutral-900) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full mt-4">
            {kayaTemplates.map((template, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(template.prompt)}
                className="flex flex-col items-start text-left p-4 rounded-xl border border-white/10 hover:border-white/20 bg-gradient-to-br from-white/15 to-neutral-900 transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-md"
              >
                <div className="mb-2.5 p-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                  {template.icon}
                </div>
                <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors mb-1">
                  {template.title}
                </h4>
                <p className="text-[11px] text-zinc-400 group-hover:text-zinc-300 leading-snug transition-colors line-clamp-2">
                  {template.body}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side Sheet (Preserved on Dashboard) */}
      <RightSidebar
        isRightSidebarExpanded={isRightSidebarExpanded}
        setIsRightSidebarExpanded={setIsRightSidebarExpanded}
      />
    </div>
  );
}
