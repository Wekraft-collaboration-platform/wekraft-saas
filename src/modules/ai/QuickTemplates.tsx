"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  FileText,
  Calendar,
  Layers,
  Clock,
  Users,
  BarChart3,
  Briefcase,
  ClipboardList,
  AlertCircle,
  Gauge,
  GitPullRequest,
  Bug,
  GitCommit,
  FolderTree,
  Wrench,
  HelpCircle,
  Sparkles,
  GitBranch,
  CheckCircle2,
} from "lucide-react";

interface QuickTemplatesProps {
  onSelectPrompt: (prompt: string) => void;
  isHarry: boolean;
  onToggleAgent: (isHarry: boolean) => void;
}

interface TemplateItem {
  title: string;
  description: string;
  prompt: string;
  icons: React.ComponentType<{ className?: string }>[];
}

export function QuickTemplates({
  onSelectPrompt,
  isHarry,
  onToggleAgent,
}: QuickTemplatesProps) {
  const kayaTemplates: TemplateItem[] = [
    {
      title: "Project report",
      description: "Analyze team contributions, generate structured progress updates, and outline upcoming milestones.",
      prompt: "Generate a project report for me",
      icons: [FileText, Sparkles],
    },
    {
      title: "Set reminder",
      description: "Schedule automated alerts, task follow-ups, and sync with your connected workspace calendars.",
      prompt: "Set a reminder for me",
      icons: [Calendar, Clock],
    },
    {
      title: "Create sprint",
      description: "Plan and initialize the next product development sprint, assigning tasks and scoping goals.",
      prompt: "Help me create a new sprint",
      icons: [Layers, CheckCircle2],
    },
    {
      title: "Auto schedulers",
      description: "Configure automated notification schedules and report triggers to keep your stakeholders updated.",
      prompt: "Setup an automated report scheduler",
      icons: [Clock, Sparkles],
    },
    {
      title: "Get standup",
      description: "Collect and compile daily status updates, task completions, and blockages from all team members.",
      prompt: "Get daily standup updates",
      icons: [Users, ClipboardList],
    },
    {
      title: "Team analysis",
      description: "Perform deep analytics on team velocity, task throughput, work distribution, and sprint health.",
      prompt: "Analyze team performance and velocity",
      icons: [BarChart3, Users],
    },
    {
      title: "Get my work",
      description: "Retrieve a clean summary of your current assigned issues, priority tasks, and deadlines.",
      prompt: "What is my assigned work for today?",
      icons: [Briefcase, CheckCircle2],
    },
    {
      title: "Summarize tasks",
      description: "Condense long descriptions, comment threads, and execution states of your active workspace items.",
      prompt: "Summarize my active tasks",
      icons: [ClipboardList, Sparkles],
    },
    {
      title: "Summarize issues",
      description: "Get a high-level overview of critical project issues, active bug clusters, and outstanding blockers.",
      prompt: "Summarize active issues in the project",
      icons: [AlertCircle, Bug],
    },
    {
      title: "Who is overload?",
      description: "Scan workloads across team members to detect bottleneck risk, overallocation, or burning out.",
      prompt: "Who in the team has overload?",
      icons: [Gauge, AlertCircle],
    },
  ];

  const harryTemplates: TemplateItem[] = [
    {
      title: "Review recent PR",
      description: "Scan recently submitted pull requests for bugs, standard violations, and security optimizations.",
      prompt: "Review recent PRs in the repository",
      icons: [GitPullRequest, Sparkles],
    },
    {
      title: "Check issues",
      description: "Read open developer issues and review codebase concerns, tracking technical debt and bug status.",
      prompt: "Check open issues in the repository",
      icons: [Bug, AlertCircle],
    },
    {
      title: "Check latest commits",
      description: "Review recent commit messages, code modifications, and author contributions in the branch.",
      prompt: "Check the latest commits in the repo",
      icons: [GitCommit, GitBranch],
    },
    {
      title: "Analyze project structure",
      description: "Understand package imports, code architectural patterns, module relationships, and hierarchy.",
      prompt: "Analyze the project structure",
      icons: [FolderTree, FileText],
    },
    {
      title: "Suggest updates",
      description: "Suggest packages updates, dependency patches, structural cleanups, or code refactor ideas.",
      prompt: "Suggest code updates or refactoring",
      icons: [Wrench, Sparkles],
    },
    {
      title: "Ask about repo",
      description: "Formulate technical questions regarding repository classes, algorithms, setup or deployment flow.",
      prompt: "Ask a question about the repository",
      icons: [HelpCircle, GitBranch],
    },
  ];

  const activeTemplates = isHarry ? harryTemplates : kayaTemplates;

  return (
    <div className="w-full flex flex-col gap-6 mt-6">
      {/* Header section */}
      <div className="flex items-center justify-between border-b border-border/10 pb-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground font-pop">
          Quick Templates
        </h2>
        <div className="flex items-center gap-1.5 bg-[#18181b]/80 p-1 rounded-full border border-border/30">
          <button
            onClick={() => onToggleAgent(false)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer",
              !isHarry
                ? "bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-md shadow-pink-500/10"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            for Kaya
          </button>
          <button
            onClick={() => onToggleAgent(true)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer",
              isHarry
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/10"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            for Harry
          </button>
        </div>
      </div>

      {/* Grid section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {activeTemplates.map((template, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(template.prompt)}
            className="group relative flex flex-col justify-between p-5 rounded-2xl border border-border bg-sidebar hover:bg-sidebar/85 transition-all duration-300 text-left min-h-[160px] cursor-pointer hover:shadow-md focus:outline-hidden"
          >
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-foreground tracking-wide group-hover:text-primary transition-colors">
                {template.title}
              </h3>
              <p className="text-[12px] text-muted-foreground leading-normal line-clamp-3 group-hover:text-muted-foreground/80 transition-colors">
                {template.description}
              </p>
            </div>
            
            {/* Badges container at the bottom */}
            <div className="flex items-center gap-2 mt-4 text-muted-foreground group-hover:text-foreground transition-colors">
              {template.icons.map((Icon, iconIdx) => (
                <Icon
                  key={iconIdx}
                  className="w-4 h-4 transition-all"
                />
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
