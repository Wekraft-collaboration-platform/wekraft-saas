"use client";

import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Blocks } from "lucide-react";

interface IntegrationItem {
  id: string;
  name: string;
  category: string;
  logo: string;
  status: "available" | "coming_soon";
}

const KAYA_INTEGRATIONS: IntegrationItem[] = [
  {
    id: "linear",
    name: "Linear",
    category: "Issues & Sprints",
    logo: "/linear.png",
    status: "available",
  },
  {
    id: "notion",
    name: "Notion",
    category: "Docs & PRDs",
    logo: "/Notion-logo.png",
    status: "coming_soon",
  },
  {
    id: "slack",
    name: "Slack",
    category: "Team Chat",
    logo: "/slack.png",
    status: "coming_soon",
  },
  {
    id: "calendly",
    name: "Calendly",
    category: "Scheduling",
    logo: "/calendly.png",
    status: "coming_soon",
  },
  {
    id: "jira",
    name: "Jira",
    category: "Issue Tracking",
    logo: "/jira-logo.jpg",
    status: "coming_soon",
  },
];

const HARRY_INTEGRATIONS: IntegrationItem[] = [
  {
    id: "github",
    name: "GitHub",
    category: "Codebase & PRs",
    logo: "/github.png",
    status: "coming_soon",
  },
  {
    id: "vercel",
    name: "Vercel",
    category: "Deployments",
    logo: "vercel",
    status: "coming_soon",
  },
  {
    id: "sentry",
    name: "Sentry",
    category: "Error Tracking",
    logo: "/sentry.svg",
    status: "coming_soon",
  },
];

export const IntegrationsView = () => {
  const renderLogo = (item: IntegrationItem) => {
    if (item.logo === "vercel") {
      return (
        <div className="w-9 h-9 rounded-lg bg-neutral-950 border border-border/60 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-foreground">
            <path d="M12 1L24 22H0L12 1Z" />
          </svg>
        </div>
      );
    }
    if (item.id === "sentry") {
      return (
        <div className="w-10 h-10 rounded-lg bg-purple-900 border border-border/60 flex items-center justify-center shrink-0 overflow-hidden">
          <Image
            src={item.logo}
            alt={item.name}
            width={40}
            height={40}
            className="dark:invert"
          />
        </div>
      );
    }
    if (item.id === "calendly") {
      return (
        <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-border/60 flex items-center justify-center shrink-0 overflow-hidden">
          <Image
            src={item.logo}
            alt={item.name}
            width={36}
            height={36}
            className="object-contain"
          />
        </div>
      );
    }
    if (item.id === "github" || item.id === "jira") {
      return (
        <div className="w-9 h-9 rounded-lg bg-white border border-border/60 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
          <Image
            src={item.logo}
            alt={item.name}
            width={24}
            height={24}
            className="object-contain"
          />
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-border/60 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
        <Image
          src={item.logo}
          alt={item.name}
          width={24}
          height={24}
          className="object-contain"
        />
      </div>
    );
  };

  const renderCard = (item: IntegrationItem) => (
    <div
      key={item.id}
      className="flex items-center justify-between p-4 rounded-lg border border-border/70 bg-neutral-950 hover:bg-black cursor-pointer transition-all duration-150"
    >
      <div className="flex items-center gap-3">
        {renderLogo(item)}
        <div>
          <h4 className="text-sm font-semibold text-foreground">{item.name}</h4>
          <p className="text-xs text-muted-foreground">{item.category}</p>
        </div>
      </div>

      {item.status === "available" ? (
        <Button
          size="sm"
          className="h-8 text-xs px-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
        >
          Connect
        </Button>
      ) : (
        <Badge
          variant="outline"
          className="text-[10px] px-2 py-0.5 text-muted-foreground/70 border-border/40 font-normal"
        >
          Coming Soon
        </Badge>
      )}
    </div>
  );

  return (
    <div className="w-full h-full min-h-screen p-6 md:p-8 space-y-8 bg-background">
      {/* Top Header */}
      <div className="border-b border-border/50 pb-5 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          <Blocks className="h-6 w-6 inline" /> Integrations
        </h1>
        <p className="text-sm text-muted-foreground">
          Available integrations for Kaya and Harry. Bring your work across
          different platforms and Power up your Agents.
        </p>
      </div>

      {/* Kaya Integrations */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Image src="/kaya.svg" alt="Kaya" width={18} height={18} />
          <h2 className="text-sm font-semibold text-foreground">
            Kaya Integrations{" "}
            <span className="text-xs text-muted-foreground font-normal">
              ({KAYA_INTEGRATIONS.length})
            </span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {KAYA_INTEGRATIONS.map(renderCard)}
        </div>
      </div>

      {/* Harry Integrations */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <Image src="/harry.svg" alt="Harry" width={18} height={18} />
          <h2 className="text-sm font-semibold text-foreground">
            Harry Integrations{" "}
            <span className="text-xs text-muted-foreground font-normal">
              ({HARRY_INTEGRATIONS.length})
            </span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {HARRY_INTEGRATIONS.map(renderCard)}
        </div>
      </div>
    </div>
  );
};
