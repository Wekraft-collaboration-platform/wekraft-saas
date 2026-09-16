"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Blocks, CheckCircle2, Clock, UserCheck } from "lucide-react";
import { api } from "../../../../convex/_generated/api";

interface IntegrationItem {
  id: string;
  name: string;
  category: string;
  logo: string;
  agent: "kaya" | "harry";
  status: "available" | "coming_soon";
}

const KAYA_INTEGRATIONS: IntegrationItem[] = [
  {
    id: "linear",
    name: "Linear",
    category: "Issues & Sprints",
    logo: "/linear.png",
    agent: "kaya",
    status: "available",
  },
  {
    id: "notion",
    name: "Notion",
    category: "Docs & PRDs",
    logo: "/Notion-logo.png",
    agent: "kaya",
    status: "available",
  },
  {
    id: "slack",
    name: "Slack",
    category: "Team Chat",
    logo: "/slack.png",
    agent: "kaya",
    status: "available",
  },
  {
    id: "calendly",
    name: "Calendly",
    category: "Scheduling",
    logo: "/calendly.png",
    agent: "kaya",
    status: "available",
  },
  {
    id: "jira",
    name: "Jira",
    category: "Issue Tracking",
    logo: "/jira-logo.jpg",
    agent: "kaya",
    status: "available",
  },
];

const HARRY_INTEGRATIONS: IntegrationItem[] = [
  {
    id: "sentry",
    name: "Sentry",
    category: "Error Tracking",
    logo: "/sentry.svg",
    agent: "harry",
    status: "available",
  },
  {
    id: "github",
    name: "GitHub",
    category: "Codebase & PRs",
    logo: "/github.png",
    agent: "harry",
    status: "coming_soon",
  },
  {
    id: "vercel",
    name: "Vercel",
    category: "Deployments",
    logo: "vercel",
    agent: "harry",
    status: "coming_soon",
  },
  {
    id: "datadog",
    name: "Datadog",
    category: "Observability",
    logo: "/datadog.png",
    agent: "harry",
    status: "coming_soon",
  },
  {
    id: "betterstack",
    name: "Better Stack",
    category: "Logs & Incidents",
    logo: "/betterstack.png",
    agent: "harry",
    status: "coming_soon",
  },
];

const ALL_INTEGRATIONS = [...KAYA_INTEGRATIONS, ...HARRY_INTEGRATIONS];

export const IntegrationsView = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params?.slug as string | undefined;

  const [activeTab, setActiveTab] = useState<"all" | "connected">("all");

  const project = useQuery(
    api.project.getProjectBySlug,
    slug ? { slug } : "skip",
  );
  const projectId = project?._id;

  const connections = useQuery(
    api.mcp.getConnectionsByProject,
    projectId ? { projectId } : "skip",
  );
  const userRole = useQuery(
    api.mcp.getUserProjectRole,
    projectId ? { projectId } : "skip",
  );

  const disconnectMutation = useMutation(api.mcp.disconnectTool);

  const canManage = userRole?.canManage ?? false;
  const processedToastRef = useRef(false);

  // Handle post-OAuth query redirect feedback
  useEffect(() => {
    if (processedToastRef.current) return;
    const connectedParam = searchParams?.get("connected");
    const errorParam = searchParams?.get("error");

    if (connectedParam) {
      processedToastRef.current = true;
      toast.success(
        `Successfully connected ${connectedParam.toUpperCase()} via OAuth!`,
      );
      router.replace(`/dashboard/my-projects/${slug}/workspace/integrations`);
    } else if (errorParam) {
      processedToastRef.current = true;
      toast.error(`Connection error: ${errorParam}`);
      router.replace(`/dashboard/my-projects/${slug}/workspace/integrations`);
    }
  }, [searchParams, slug, router]);

  const connectedList = connections?.filter((c) => c.isConnected) || [];
  const connectedCount = connectedList.length;

  const isConnected = (connectorId: string) => {
    return connections?.some(
      (c) => c.connectorId === connectorId && c.isConnected,
    );
  };

  const getConnection = (connectorId: string) => {
    return connections?.find(
      (c) => c.connectorId === connectorId && c.isConnected,
    );
  };

  const handleOAuthConnect = (connectorId: string) => {
    if (!projectId || !slug) return;
    const uId = userRole?.userId || "";
    const uName = encodeURIComponent(userRole?.userName || "Admin");
    window.location.href = `/api/integrations/${connectorId}/authorize?projectId=${projectId}&slug=${slug}&userId=${uId}&userName=${uName}`;
  };

  const handleDisconnect = async (connectorId: string) => {
    if (!projectId) return;
    try {
      await disconnectMutation({
        projectId,
        connectorId,
      });
      toast.success("Disconnected successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to disconnect");
    }
  };

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

  const renderCard = (item: IntegrationItem) => {
    const connection = getConnection(item.id);
    const connected = !!connection;

    return (
      <div
        key={item.id}
        className={`flex items-center justify-between p-4 rounded-lg border border-border/70 ${
          connected
            ? "bg-neutral-900 hover:bg-neutral-900/80"
            : "bg-neutral-950 hover:bg-black"
        } cursor-pointer transition-all duration-150`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {renderLogo(item)}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-foreground truncate">
                {item.name}
              </h4>
              {connected && connection?.metadata?.toolsCount && (
                <span className="text-[10px] font-normal text-muted-foreground bg-neutral-950/80 border border-border/50 rounded px-1.5 py-0.5 shrink-0">
                  {connection.metadata.toolsCount} tools
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {item.category}
            </p>
            {activeTab === "connected" && connected && connection && (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground/80 mt-1">
                {connection.connectedByUserName && (
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-neutral-200" />
                    {connection.connectedByUserName}
                  </span>
                )}
                {connection.updatedAt && (
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                    <Clock className="w-2.5 h-2.5" />
                    {format(connection.updatedAt, "MMM d, h:mm a")}
                  </span>
                )}
              </div>
            )}
            {activeTab === "connected" &&
              connected &&
              connection?.metadata?.tokenExpiresAt && (
                <span
                  className={`text-[10px] font-normal rounded px-1.5 py-0.5 shrink-0 ${
                    connection.metadata.tokenExpiresAt < Date.now()
                      ? "text-amber-400 bg-amber-500/10 border border-amber-500/30 font-medium"
                      : "text-muted-foreground/70 bg-neutral-950/80 border border-border/50"
                  }`}
                >
                  {connection.metadata.tokenExpiresAt < Date.now()
                    ? "Expired"
                    : `Exp ${format(connection.metadata.tokenExpiresAt, "MMM d, h:mm a")}`}
                </span>
              )}
          </div>
        </div>

        <div className="shrink-0 ml-3">
          {(() => {
            const isExpired =
              connected &&
              Boolean(
                connection?.metadata?.tokenExpiresAt &&
                connection.metadata.tokenExpiresAt < Date.now(),
              );
            if (item.status !== "available") {
              return (
                <Badge
                  variant="outline"
                  className="text-[10px] px-2 py-0.5 text-muted-foreground/70 border-border/40 font-normal"
                >
                  Coming Soon
                </Badge>
              );
            }

            if (connected) {
              if (isExpired) {
                return canManage ? (
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      onClick={() => handleOAuthConnect(item.id)}
                      className="h-8 text-xs px-3 bg-amber-500/90 hover:bg-amber-500 text-neutral-950 font-medium"
                    >
                      Reconnect
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDisconnect(item.id)}
                      className="h-8 text-[11px] px-2.5 text-red-400 bg-neutral-950!"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-2 py-0.5 text-amber-400 border-amber-500/40 font-normal"
                  >
                    Expired
                  </Badge>
                );
              }

              return canManage ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDisconnect(item.id)}
                  className="h-8 text-[11px] px-3 text-red-400 bg-neutral-950!"
                >
                  Remove
                </Button>
              ) : (
                <Badge
                  variant="outline"
                  className="text-[10px] px-2 py-0.5 text-emerald-400 border-emerald-500/30 font-normal"
                >
                  Connected
                </Badge>
              );
            }

            return canManage ? (
              <Button
                size="sm"
                onClick={() => handleOAuthConnect(item.id)}
                className="h-8 text-xs px-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                Connect
              </Button>
            ) : (
              <Badge
                variant="outline"
                className="text-[10px] px-2 py-0.5 text-muted-foreground/70 border-border/40 font-normal"
              >
                Admin Only
              </Badge>
            );
          })()}
        </div>
      </div>
    );
  };

  const kayaList =
    activeTab === "all"
      ? KAYA_INTEGRATIONS
      : KAYA_INTEGRATIONS.filter((item) => isConnected(item.id));

  const harryList =
    activeTab === "all"
      ? HARRY_INTEGRATIONS
      : HARRY_INTEGRATIONS.filter((item) => isConnected(item.id));

  return (
    <div className="w-full h-full min-h-screen p-6 md:p-8 space-y-8 bg-background">
      {/* Top Header */}
      <div className="border-b border-border/50 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Blocks className="h-6 w-6 inline" /> MCP Connecters
          </h1>
          <p className="text-sm text-muted-foreground">
            Connect the tools your agents use every day. Give Kaya and Harry{" "}
            <br />
            secure, permissioned access to your workspace data.
          </p>
        </div>

        {/* Tab Switcher: ALL vs Connected (Right Aligned) */}
        <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-border/50 shrink-0 self-start sm:self-end">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "all"
                ? "bg-neutral-800 text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            ALL
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("connected")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "connected"
                ? "bg-neutral-800 text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Connected
            {connectedCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-neutral-200 text-neutral-800 border border-neutral-200 text-[10px] flex items-center justify-center font-bold">
                {connectedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === "connected" && connectedCount === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 border border-dashed border-border/60 rounded-xl bg-neutral-950/40">
          <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-muted-foreground">
            <Blocks className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">
              No integrations connected yet
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Switch back to the{" "}
              <strong className="text-foreground">ALL</strong> tab to connect
              Linear, Notion, Slack, Calendly, or Sentry to your workspace.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveTab("all")}
            className="text-xs h-8"
          >
            View All Connectors
          </Button>
        </div>
      ) : (
        <>
          {/* Kaya Integrations */}
          {(activeTab === "all" || kayaList.length > 0) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Image src="/kaya.svg" alt="Kaya" width={18} height={18} />
                <h2 className="text-sm font-semibold text-foreground">
                  Kaya Integrations{" "}
                  <span className="text-xs text-muted-foreground font-normal">
                    ({kayaList.length})
                  </span>
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {kayaList.map(renderCard)}
              </div>
            </div>
          )}

          {/* Harry Integrations */}
          {(activeTab === "all" || harryList.length > 0) && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <Image src="/harry.svg" alt="Harry" width={18} height={18} />
                <h2 className="text-sm font-semibold text-foreground">
                  Harry Integrations{" "}
                  <span className="text-xs text-muted-foreground font-normal">
                    ({harryList.length})
                  </span>
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {harryList.map(renderCard)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
