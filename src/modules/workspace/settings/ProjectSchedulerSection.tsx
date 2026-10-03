"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import {
  CalendarClock,
  Clock,
  History,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Mail,
  Repeat,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { format } from "date-fns";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ProjectSchedulerSectionProps {
  projectId: Id<"projects">;
  isOwner: boolean;
  currentUserEmail?: string;
}

export function ProjectSchedulerSection({
  projectId,
  isOwner,
  currentUserEmail,
}: ProjectSchedulerSectionProps) {
  const scheduler = useQuery(api.scheduler.getScheduler, { projectId });
  const upsertScheduler = useMutation(api.scheduler.upsertScheduler);

  const [name, setName] = useState("");
  const [frequencyDays, setFrequencyDays] = useState("7");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when data loads
  useEffect(() => {
    if (scheduler) {
      setName(scheduler.name || "Weekly Project Health Brief");
      setFrequencyDays(String(scheduler.frequencyDays || 7));
      setRecipientEmail(scheduler.recipientEmail || currentUserEmail || "");
      setIsActive(scheduler.isActive ?? false);
    } else if (currentUserEmail) {
      setName("Weekly Project Health Brief");
      setFrequencyDays("7");
      setRecipientEmail(currentUserEmail);
      setIsActive(false);
    }
  }, [scheduler, currentUserEmail]);

  const handleToggleActive = async (checked: boolean) => {
    if (!isOwner) return;
    setIsActive(checked);
    try {
      await upsertScheduler({
        projectId,
        name: name.trim() || "Project Health Brief",
        frequencyDays: Math.max(3, parseInt(frequencyDays) || 7),
        recipientEmail: recipientEmail.trim() || currentUserEmail || "",
        isActive: checked,
      });
      toast.success(
        checked
          ? "Automated reports scheduled and activated!"
          : "Automated reports paused.",
      );
    } catch (err: any) {
      setIsActive(!checked);
      toast.error(err?.message || "Failed to update scheduler status.");
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) return;
    if (!name.trim()) {
      toast.error("Report name cannot be empty");
      return;
    }
    if (!recipientEmail.trim()) {
      toast.error("Recipient email is required");
      return;
    }

    const freq = Math.max(3, parseInt(frequencyDays) || 7);

    setIsSaving(true);
    try {
      await upsertScheduler({
        projectId,
        name: name.trim(),
        frequencyDays: freq,
        recipientEmail: recipientEmail.trim(),
        isActive,
      });
      toast.success("Schedule configuration saved!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save schedule settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-2 pt-2">
      {/* Header */}
      <div>
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-primary" />
          Scheduled Health Reports
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Automated Kaya AI project health briefs and sprint status summaries delivered to your inbox.
        </p>
      </div>

      {/* Main Container */}
      <div className="rounded-md border border-border/60 bg-card divide-y divide-neutral-800/60 overflow-hidden shadow-xs">
        {/* Row 1: Toggle & Run Status */}
        <div className="flex items-center justify-between px-4 py-3 hover:bg-muted/15 transition-colors">
          <div className="flex items-center gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground">
                  Automated Report Delivery
                </span>
                {scheduler?.isRunning ? (
                  <Badge
                    variant="outline"
                    className="text-[10px] py-0 px-1.5 rounded-md bg-blue-500/10 text-blue-400 border-blue-500/20 font-normal flex items-center gap-1"
                  >
                    <Loader2 className="w-2.5 h-2.5 animate-spin" /> Running
                  </Badge>
                ) : isActive ? (
                  <Badge
                    variant="outline"
                    className="text-[10px] py-0 px-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-normal flex items-center gap-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[10px] py-0 px-1.5 rounded-md bg-muted text-muted-foreground border-border/60 font-normal"
                  >
                    Paused
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Periodically generates comprehensive project summaries, sprint health, and blocker insights.
              </p>
            </div>
          </div>

          <Switch
            disabled={!isOwner}
            checked={isActive}
            onCheckedChange={handleToggleActive}
          />
        </div>

        {/* Row 2: Status Cards (Last Sent & Next Scheduled Run - Minimal) */}
        <div className="px-4 py-2 bg-muted/10 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Last Run */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border/50 bg-background/50">
            <div className="w-5 h-5 rounded-md bg-neutral-900/90 border border-border/50 flex items-center justify-center shrink-0">
              <History className="w-3 h-3 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
              <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
                Last Sent
              </span>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[11px] font-mono font-medium text-foreground truncate">
                  {scheduler?.lastRunAt
                    ? format(scheduler.lastRunAt, "MMM d • HH:mm")
                    : "Never sent yet"}
                </span>
                {scheduler?.lastRunStatus && (
                  <span
                    className={cn(
                      "text-[9px] font-medium capitalize",
                      scheduler.lastRunStatus === "success"
                        ? "text-emerald-400"
                        : "text-rose-400",
                    )}
                  >
                    {scheduler.lastRunStatus === "success" ? "✓" : "✗"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Next Run */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border/50 bg-background/50">
            <div className="w-5 h-5 rounded-md bg-neutral-900/90 border border-border/50 flex items-center justify-center shrink-0">
              <Clock className="w-3 h-3 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
              <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
                Next Run
              </span>
              <span className="text-[11px] font-mono font-medium text-foreground truncate">
                {isActive && scheduler?.nextRunAt
                  ? format(scheduler.nextRunAt, "MMM d • HH:mm")
                  : isActive
                    ? "Scheduled"
                    : "Paused"}
              </span>
            </div>
          </div>
        </div>

        {/* Row 3: Configuration Form */}
        <form onSubmit={handleSaveConfig} className="p-3.5 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Report Name */}
            <div className="space-y-1 sm:col-span-1">
              <Label htmlFor="schedName" className="text-[11px] text-foreground flex items-center gap-1.5">
                <FileText className="w-3 h-3 text-muted-foreground" />
                Report Title
              </Label>
              <Input
                id="schedName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Weekly Health Brief"
                disabled={!isOwner}
                className="text-xs h-8 bg-background font-medium rounded-md border-border/60"
              />
            </div>

            {/* Frequency */}
            <div className="space-y-1 sm:col-span-1">
              <Label htmlFor="schedFreq" className="text-[11px] text-foreground flex items-center gap-1.5">
                <Repeat className="w-3 h-3 text-muted-foreground" />
                Frequency
              </Label>
              <Select
                value={frequencyDays}
                onValueChange={setFrequencyDays}
                disabled={!isOwner}
              >
                <SelectTrigger id="schedFreq" className="text-xs h-8 bg-background rounded-md border-border/60">
                  <SelectValue placeholder="Select Frequency" />
                </SelectTrigger>
                <SelectContent className="rounded-md border-border/60">
                  <SelectItem value="3" className="text-xs">Every 3 Days (High Velocity)</SelectItem>
                  <SelectItem value="5" className="text-xs">Every 5 Days (Workweek)</SelectItem>
                  <SelectItem value="7" className="text-xs">Every 7 Days (Weekly)</SelectItem>
                  <SelectItem value="14" className="text-xs">Every 14 Days (Bi-weekly Sprint)</SelectItem>
                  <SelectItem value="30" className="text-xs">Every 30 Days (Monthly)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Recipient Email */}
            <div className="space-y-1 sm:col-span-1">
              <Label htmlFor="schedEmail" className="text-[11px] text-foreground flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-muted-foreground" />
                Recipient Email
              </Label>
              <Input
                id="schedEmail"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="you@company.com"
                disabled={!isOwner}
                className="text-xs h-8 bg-background font-medium rounded-md border-border/60"
              />
            </div>
          </div>

          {/* Form Actions */}
          {isOwner && (
            <div className="flex items-center justify-end gap-2 pt-0.5">
              <Button
                type="submit"
                size="sm"
                disabled={isSaving}
                className="text-[11px] h-7 px-2.5 rounded-md cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3 mr-1" /> Save Configuration
                  </>
                )}
              </Button>
            </div>
          )}

          {!isOwner && (
            <div className="pt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Only the project owner can modify the report schedule.</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
