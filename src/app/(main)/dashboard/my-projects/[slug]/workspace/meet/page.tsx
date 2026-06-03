"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Video, Plus, Link2, Loader2, ShieldAlert } from "lucide-react";
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

export default function MeetPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user: clerkUser } = useUser();

  // ── Project data for permissions + notification ──────────────────────────
  const project = useQuery(api.project.getProjectBySlug, { slug });
  const { isOwner, isAdmin, isLoading: permLoading } = useProjectPermissions(
    project?._id as Id<"projects"> | undefined
  );
  const canStart = isOwner || isAdmin;

  // ── Convex mutation ──────────────────────────────────────────────────────
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

  return (
    <div className="w-full h-full p-6 max-w-7xl mx-auto">
      {/* ── Header ───────────────────────────────────── */}
      <header className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold">
            <Video className="w-6 h-6 mr-2 text-primary inline-block" />
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

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {/* span keeps tooltip working even when button is disabled */}
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
          </TooltipProvider>
        </div>
      </header>

      {/* ── Empty State ──────────────────────────────── */}
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6 text-center">
        <Image
          src="/pat106.svg"
          width={120}
          height={120}
          alt="Meet"
          className="inline-block mr-2"
        />

        <div className="space-y-2 max-w-sm">
          <p className="text-xl font-semibold">No Active Meetings</p>
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
          <TooltipProvider>
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
          </TooltipProvider>

          <Button
            variant="outline"
            className="rounded-full px-6"
            onClick={() => setJoinDialogOpen(true)}
          >
            Join with ID
          </Button>
        </div>
      </div>

      {/* ── Join by ID Dialog ─────────────────────────── */}
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
  );
}
