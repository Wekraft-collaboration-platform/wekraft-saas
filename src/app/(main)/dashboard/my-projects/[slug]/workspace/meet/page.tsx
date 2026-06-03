"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Video,
  Plus,
  Link2,
  Loader2,
  ShieldAlert,
  Clock,
  Users,
  Calendar,
  CheckCircle2,
  Radio,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";

import { useProjectPermissions } from "@/hooks/use-project-permissions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Id } from "../../../../../../../../convex/_generated/dataModel";
import { api } from "../../../../../../../../convex/_generated/api";
import Image from "next/image";

/** Generates a short, URL-safe random ID (e.g. "x7k2m-9pqr3") */
function generateCallId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const segment = (len: number) =>
    Array.from({ length: len }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  return `${segment(5)}-${segment(5)}`;
}

/** Format ms duration → "Xm Ys" */
function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/** Format timestamp → "Jun 3, 4:09 PM" */
function formatTs(ts: number): string {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ─── Meeting history card ────────────────────────────────────────────────────
function MeetCard({
  meet,
  slug,
}: {
  meet: {
    _id: string;
    meetingId: string;
    status: "active" | "inactive";
    createdByName: string;
    createdByAvatar?: string;
    startedAt: number;
    endedAt?: number;
    durationMs?: number;
    members: { userId: string; name: string; avatar?: string }[];
  };
  slug: string;
}) {
  const router = useRouter();
  const isActive = meet.status === "active";

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border p-4 transition-all duration-200",
        "bg-card hover:bg-accent/10",
        isActive
          ? "border-primary/30 shadow-[0_0_0_1px_hsl(var(--primary)/0.15)] hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.35)]"
          : "border-border/60 hover:border-border"
      )}
    >
      {/* Top row: status badge + creator + date */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {isActive ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <Radio className="w-2.5 h-2.5 animate-pulse" />
              Live
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border/40">
              <CheckCircle2 className="w-2.5 h-2.5" />
              Ended
            </span>
          )}

          {/* Creator */}
          <div className="flex items-center gap-1.5">
            <Avatar className="h-4 w-4">
              <AvatarImage src={meet.createdByAvatar} />
              <AvatarFallback className="text-[8px]">
                {meet.createdByName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-[11px] text-muted-foreground">
              {meet.createdByName}
            </span>
          </div>
        </div>

        {/* Date */}
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatTs(meet.startedAt)}
        </span>
      </div>

      {/* Meeting ID */}
      <p className="text-xs font-mono text-foreground/70 truncate">
        ID: <span className="text-foreground">{meet.meetingId}</span>
      </p>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
        {/* Duration */}
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {meet.durationMs != null
            ? formatDuration(meet.durationMs)
            : isActive
            ? "Ongoing"
            : "—"}
        </span>

        {/* Member count */}
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {meet.members.length} member{meet.members.length !== 1 ? "s" : ""}
        </span>

        {/* End time */}
        {meet.endedAt && (
          <span className="flex items-center gap-1 ml-auto text-[10px]">
            ended {formatTs(meet.endedAt)}
          </span>
        )}
      </div>

      {/* Member avatars */}
      {meet.members.length > 0 && (
        <div className="flex items-center gap-1">
          {meet.members.slice(0, 8).map((m, i) => (
            <Tooltip key={m.userId}>
              <TooltipTrigger asChild>
                <Avatar
                  className="h-6 w-6 ring-2 ring-background -ml-1 first:ml-0 cursor-default"
                  style={{ zIndex: meet.members.length - i }}
                >
                  <AvatarImage src={m.avatar} />
                  <AvatarFallback className="text-[8px] bg-accent">
                    {m.name[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {m.name}
              </TooltipContent>
            </Tooltip>
          ))}
          {meet.members.length > 8 && (
            <span className="text-[10px] text-muted-foreground ml-1">
              +{meet.members.length - 8}
            </span>
          )}
        </div>
      )}

      {/* Join button (only for active) */}
      {isActive && (
        <Button
          size="sm"
          className="w-full text-xs mt-1"
          onClick={() =>
            router.push(
              `/dashboard/my-projects/${slug}/workspace/meet/${meet.meetingId}`
            )
          }
        >
          <Radio className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
          Join Now
        </Button>
      )}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function MeetPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user: clerkUser } = useUser();

  // ── Project data + permissions ───────────────────────────────────────────
  const project = useQuery(api.project.getProjectBySlug, { slug });
  const { isOwner, isAdmin, isLoading: permLoading } = useProjectPermissions(
    project?._id as Id<"projects"> | undefined
  );
  const canStart = isOwner || isAdmin;

  // ── Meeting history ──────────────────────────────────────────────────────
  const meetings = useQuery(
    api.notifications.getProjectMeetings,
    project?._id ? { projectId: project._id as Id<"projects"> } : "skip"
  );
  const activeCount = meetings?.filter((m) => m.status === "active").length ?? 0;

  // ── Mutations ────────────────────────────────────────────────────────────
  const notifyMeeting = useMutation(api.notifications.notifyMeetingStarted);

  // ── Local state ──────────────────────────────────────────────────────────
  const [isCreating, setIsCreating] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [joinId, setJoinId] = useState("");

  /** Create a new meeting room, notify members, then navigate into it */
  const handleNewMeeting = async () => {
    if (!canStart || !project?._id || !clerkUser) return;
    setIsCreating(true);

    const callId = generateCallId();

    try {
      await notifyMeeting({
        hostName:
          clerkUser.fullName ??
          clerkUser.username ??
          clerkUser.primaryEmailAddress?.emailAddress ??
          "Someone",
        hostAvatar: clerkUser.imageUrl,
        projectId: project._id as Id<"projects">,
        meetingId: callId,
      });
    } catch (_) {
      // Notification failure should not block the meeting
    }

    router.push(`/dashboard/my-projects/${slug}/workspace/meet/${callId}`);
  };

  /** Join an existing meeting by pasting its ID or link */
  const handleJoin = () => {
    const id = joinId.trim().split("/").pop() ?? joinId.trim();
    if (!id) return;
    setJoinDialogOpen(false);
    router.push(`/dashboard/my-projects/${slug}/workspace/meet/${id}`);
  };

  const hasMeetings = meetings && meetings.length > 0;

  return (
    <TooltipProvider>
      <div className="w-full h-full p-6 max-w-7xl mx-auto">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <header className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <Video className="w-6 h-6 text-primary" />
              Team Meet
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Connect with your teammates in real-time video calls.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setJoinDialogOpen(true)}
            >
              <Link2 className="w-4 h-4 mr-2" />
              Join with ID
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <Button
                    size="sm"
                    className="text-xs"
                    onClick={handleNewMeeting}
                    disabled={isCreating || permLoading || !canStart}
                  >
                    {isCreating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    {isCreating ? "Starting…" : "New Meeting"}
                  </Button>
                </span>
              </TooltipTrigger>
              {!canStart && !permLoading && (
                <TooltipContent side="bottom" className="max-w-xs text-center">
                  Only project owners and admins can start a meeting.
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </header>

        {/* ── Active banner (if any live meet) ───────────────────────── */}
        {activeCount > 0 && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">
            <Radio className="w-4 h-4 animate-pulse shrink-0" />
            <span>
              <strong>{activeCount}</strong> active meeting
              {activeCount > 1 ? "s" : ""} in progress — join below.
            </span>
          </div>
        )}

        {/* ── Empty state OR history grid ─────────────────────────────── */}
        {!hasMeetings ? (
          <div className="flex flex-col items-center justify-center h-[55vh] gap-6 text-center">
            <Image
              src="/pat106.svg"
              width={120}
              height={120}
              alt="Meet"
            />
            <div className="space-y-2 max-w-sm">
              <p className="text-xl font-semibold">No Meetings Yet</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {canStart
                  ? "Start an instant meeting — all project members will be notified and can join with the meeting ID."
                  : "An owner or admin can start a meeting. You'll receive a notification when one begins."}
              </p>
            </div>

            {!canStart && !permLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 border border-border px-4 py-2 rounded-lg">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                Members cannot start meetings — only owners &amp; admins can.
              </div>
            )}

            <div className="flex gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button
                      onClick={handleNewMeeting}
                      disabled={isCreating || permLoading || !canStart}
                      className="rounded-full px-6"
                    >
                      {isCreating ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      Start a Meeting
                    </Button>
                  </span>
                </TooltipTrigger>
                {!canStart && !permLoading && (
                  <TooltipContent side="bottom" className="max-w-xs text-center">
                    Only project owners and admins can start a meeting.
                  </TooltipContent>
                )}
              </Tooltip>

              <Button
                variant="outline"
                className="rounded-full px-6"
                onClick={() => setJoinDialogOpen(true)}
              >
                Join with ID
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Section label */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Meeting History</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {meetings.length}
                </Badge>
              </div>
              {/* Quick-start CTA when there are past meets */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button
                      size="sm"
                      className="text-xs"
                      onClick={handleNewMeeting}
                      disabled={isCreating || permLoading || !canStart}
                    >
                      {isCreating ? (
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      {isCreating ? "Starting…" : "New Meeting"}
                    </Button>
                  </span>
                </TooltipTrigger>
                {!canStart && !permLoading && (
                  <TooltipContent side="bottom" className="max-w-xs text-center">
                    Only project owners and admins can start a meeting.
                  </TooltipContent>
                )}
              </Tooltip>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {meetings.map((m) => (
                <MeetCard key={m._id} meet={m} slug={slug} />
              ))}
            </div>
          </>
        )}

        {/* ── Join by ID Dialog ──────────────────────────────────────── */}
        <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Join a Meeting</DialogTitle>
              <DialogDescription>
                Paste a meeting ID or the full meeting link to join.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 py-2">
              <Label htmlFor="join-id">Meeting ID or Link</Label>
              <Input
                id="join-id"
                placeholder="e.g. x7k2m-9pqr3"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setJoinDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleJoin} disabled={!joinId.trim()}>
                Join
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
