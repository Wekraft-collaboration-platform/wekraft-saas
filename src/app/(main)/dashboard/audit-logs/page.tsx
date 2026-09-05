"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Sparkles,
  ArrowRight,
  Search,
  Activity,
  CheckCircle2,
  ListTodo,
  Bug,
  Users,
  MessageSquare,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Clover,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

export default function AuditLogsPage() {
  const user = useQuery(api.user.getCurrentUser);
  const projects = useQuery(api.project.getUserProjects);

  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const effectivePlan = user?.accountType || "free";
  const isPro = effectivePlan === "pro";

  // Default to first project if not selected
  const activeProjectId =
    selectedProjectId ||
    (projects && projects.length > 0 ? (projects[0]._id as string) : "");

  const auditLogData = useQuery(
    api.auditLog.getAuditLogs,
    activeProjectId && isPro ? { projectId: activeProjectId as any } : "skip",
  );

  const logs = auditLogData?.logs || [];

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction =
      actionFilter === "all" || log.targetType === actionFilter;

    return matchesSearch && matchesAction;
  });

  // Calculate stat counts
  const taskCount = logs.filter((l) => l.targetType === "task").length;
  const issueCount = logs.filter((l) => l.targetType === "issue").length;
  const customerCount = logs.filter(
    (l) => l.targetType === "customer" || l.targetType === "request",
  ).length;

  const getActionBadge = (action: string) => {
    if (action.includes("create")) {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-mono capitalize">
          {action.replace(".", " ")}
        </Badge>
      );
    }
    if (action.includes("status") || action.includes("update")) {
      return (
        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] font-mono capitalize">
          {action.replace(".", " ")}
        </Badge>
      );
    }
    if (action.includes("delete")) {
      return (
        <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[10px] font-mono capitalize">
          {action.replace(".", " ")}
        </Badge>
      );
    }
    if (action.includes("comment")) {
      return (
        <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px] font-mono capitalize">
          {action.replace(".", " ")}
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="text-[10px] font-mono capitalize border-border"
      >
        {action.replace(".", " ")}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight font-inter">
              Audit Trail & Security Logs
            </h1>
            {isPro ? (
              <Badge className="bg-muted text-foreground border-border text-xs font-mono">
                Pro Enabled
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-border text-muted-foreground bg-muted/40 text-xs font-mono flex items-center gap-1"
              >
                <Lock className="h-3 w-3" /> Pro Feature
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time compliance activity feed recording task, issue, and
            security actions across your workspace.
          </p>
        </div>

        {/* Project Selector (if Pro) */}
        {isPro && projects && projects.length > 0 && (
          <div className="w-64">
            <Select
              value={activeProjectId}
              onValueChange={(val) => setSelectedProjectId(val)}
            >
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((proj) => (
                  <SelectItem
                    key={proj._id}
                    value={proj._id}
                    className="text-xs"
                  >
                    {proj.projectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* PAYWALL SCREEN IF NOT PRO */}
      {!isPro ? (
        <div className="relative rounded-2xl border border-border/80 bg-card/60 p-8 sm:p-12 overflow-hidden shadow-xl">
          <div className="max-w-2xl mx-auto text-center space-y-6 relative z-10">
            <div className="inline-flex items-center justify-center p-4 bg-muted/80 rounded-2xl border border-border text-muted-foreground shadow-inner">
              <Lock className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight font-inter text-foreground">
                Unlock Enterprise Audit Logs & Security Trails
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Audit logs provide complete compliance visibility into member
                operations, status updates, deletion events, and (ALE)/(ETE)
                security actions.
              </p>
            </div>

            {/* Feature Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-lg mx-auto py-2">
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>Full Member Action Timelines</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>Task & Issue Modification Logs</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>Application-Level Encryption Events</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>Exportable Compliance Trails</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Link href="/web/pricing">
                <Button
                  size="lg"
                  className="bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-md gap-2 cursor-pointer"
                >
                  <Clover className="h-4 w-4" /> Upgrade to Pro Plan{" "}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Blurred Placeholder Table */}
          <div className="mt-12 opacity-15 pointer-events-none filter blur-sm space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-muted/40 rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted-foreground/20" />
                  <div className="space-y-1">
                    <div className="h-3 w-32 bg-muted-foreground/20 rounded" />
                    <div className="h-2.5 w-20 bg-muted-foreground/20 rounded" />
                  </div>
                </div>
                <div className="h-6 w-24 bg-muted-foreground/20 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* PRO AUDIT LOG VIEWER */
        <div className="space-y-6">
          {/* Stat Cards Header */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-card border border-border p-4 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Total Events</span>
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground font-mono">
                {logs.length}
              </p>
            </div>

            <div className="bg-card border border-border p-4 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Tasks Logs</span>
                <ListTodo className="h-4 w-4 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-foreground font-mono">
                {taskCount}
              </p>
            </div>

            <div className="bg-card border border-border p-4 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Issues Logs</span>
                <Bug className="h-4 w-4 text-rose-400" />
              </div>
              <p className="text-2xl font-bold text-foreground font-mono">
                {issueCount}
              </p>
            </div>

            <div className="bg-card border border-border p-4 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Customer Desk</span>
                <Users className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-foreground font-mono">
                {customerCount}
              </p>
            </div>
          </div>

          {/* Search & Filter Control Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search actor, title, or action..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Select
                value={actionFilter}
                onValueChange={(val) => setActionFilter(val)}
              >
                <SelectTrigger className="w-40 text-xs">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="project">Projects & Team</SelectItem>
                  <SelectItem value="task">Tasks</SelectItem>
                  <SelectItem value="issue">Issues</SelectItem>
                  <SelectItem value="customer">Customers</SelectItem>
                  <SelectItem value="request">Requests</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Audit Logs Table */}
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-xl bg-card/50 space-y-3">
              <ShieldCheck className="h-10 w-10 text-muted-foreground/40" />
              <h3 className="text-sm font-semibold text-foreground">
                No Audit Logs Recorded
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Member actions on tasks, issues, and customer desk will
                automatically populate here.
              </p>
            </div>
          ) : (
            <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-muted-foreground font-medium">
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Actor</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Target Item</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredLogs.map((log) => {
                      const isExpanded = expandedLogId === log._id;
                      return (
                        <tr
                          key={log._id}
                          className="hover:bg-muted/30 transition-colors group"
                        >
                          <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                            {format(log.createdAt, "MMM d, yyyy • HH:mm:ss")}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-foreground">
                                {log.userName}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {log.userEmail}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {getActionBadge(log.action)}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-foreground truncate max-w-xs">
                            {log.targetTitle}
                          </td>
                          <td className="py-3.5 px-4 capitalize font-mono text-[11px] text-muted-foreground">
                            {log.targetType}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {log.changes ? (
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() =>
                                  setExpandedLogId(isExpanded ? null : log._id)
                                }
                                className="text-[11px] gap-1 cursor-pointer"
                              >
                                {isExpanded ? (
                                  <>
                                    Hide <ChevronUp className="h-3 w-3" />
                                  </>
                                ) : (
                                  <>
                                    Diff <ChevronDown className="h-3 w-3" />
                                  </>
                                )}
                              </Button>
                            ) : (
                              <span className="text-[11px] text-muted-foreground/40">
                                -
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
