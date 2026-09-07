import React from "react";
import Image from "next/image";

export interface ConnectorInfo {
  id: string;
  name: string;
  category: string;
  logo: string;
  agent: "kaya" | "harry";
}

export const CONNECTOR_META: Record<string, ConnectorInfo> = {
  linear: {
    id: "linear",
    name: "Linear",
    category: "Issues & Sprints",
    logo: "/linear.png",
    agent: "kaya",
  },
  notion: {
    id: "notion",
    name: "Notion",
    category: "Docs & PRDs",
    logo: "/Notion-logo.png",
    agent: "kaya",
  },
  slack: {
    id: "slack",
    name: "Slack",
    category: "Team Chat",
    logo: "/slack.png",
    agent: "kaya",
  },
  calendly: {
    id: "calendly",
    name: "Calendly",
    category: "Scheduling",
    logo: "/calendly.png",
    agent: "kaya",
  },
  jira: {
    id: "jira",
    name: "Jira",
    category: "Issue Tracking",
    logo: "/jira-logo.jpg",
    agent: "kaya",
  },
  sentry: {
    id: "sentry",
    name: "Sentry",
    category: "Error Tracking",
    logo: "/sentry.svg",
    agent: "harry",
  },
  github: {
    id: "github",
    name: "GitHub",
    category: "Codebase & PRs",
    logo: "/github.png",
    agent: "harry",
  },
  vercel: {
    id: "vercel",
    name: "Vercel",
    category: "Deployments",
    logo: "vercel",
    agent: "harry",
  },
  datadog: {
    id: "datadog",
    name: "Datadog",
    category: "Observability",
    logo: "/datadog.png",
    agent: "harry",
  },
  betterstack: {
    id: "betterstack",
    name: "Better Stack",
    category: "Logs & Incidents",
    logo: "/betterstack.png",
    agent: "harry",
  },
};

export function ConnectorIcon({
  connectorId,
  size = 18,
  className = "",
}: {
  connectorId: string;
  size?: number;
  className?: string;
}) {
  const meta = CONNECTOR_META[connectorId] || {
    id: connectorId,
    name: connectorId,
    logo: "/project.svg",
  };

  if (meta.logo === "vercel") {
    return (
      <div
        className={`rounded-md bg-neutral-950 border border-neutral-800 flex items-center justify-center shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        title={meta.name}
      >
        <svg viewBox="0 0 24 24" className="w-3/5 h-3/5 fill-foreground">
          <path d="M12 1L24 22H0L12 1Z" />
        </svg>
      </div>
    );
  }

  if (meta.id === "sentry") {
    return (
      <div
        className={`rounded-md bg-purple-950/80 border border-purple-800/60 flex items-center justify-center shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        title={meta.name}
      >
        <Image
          src={meta.logo}
          alt={meta.name}
          width={Math.round(size * 0.8)}
          height={Math.round(size * 0.8)}
          className="dark:invert object-contain"
        />
      </div>
    );
  }

  if (meta.id === "github" || meta.id === "jira") {
    return (
      <div
        className={`rounded-md bg-white border border-neutral-300 flex items-center justify-center shrink-0 overflow-hidden p-0.5 ${className}`}
        style={{ width: size, height: size }}
        title={meta.name}
      >
        <Image
          src={meta.logo}
          alt={meta.name}
          width={Math.round(size * 0.75)}
          height={Math.round(size * 0.75)}
          className="object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className={`rounded-md bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 overflow-hidden p-0.5 ${className}`}
      style={{ width: size, height: size }}
      title={meta.name}
    >
      <Image
        src={meta.logo}
        alt={meta.name}
        width={Math.round(size * 0.75)}
        height={Math.round(size * 0.75)}
        className="object-contain"
      />
    </div>
  );
}
