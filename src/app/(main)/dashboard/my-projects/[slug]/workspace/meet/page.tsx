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
  EyeClosed,
  Ban,
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
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

// Helper date utilities for defaults
const getTodayDateStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getNextHourTimeStr = () => {
  const d = new Date();
  d.setHours(d.getHours() + 1);
  const hours = String(d.getHours()).padStart(2, "0");
  return `${hours}:00`;
};

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
        "group relative flex flex-col gap-3 rounded-xl border p-4 ",
        isActive
          ? "bg-sidebar border-muted"
          : "bg-muted border-accent"
      )}
    >
      {/* Top row: status + date */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Creator */}
        <div className="flex items-center gap-1.5">
          <Avatar className="h-5 w-5 border border-zinc-800">
            <AvatarImage src={meet.createdByAvatar} />
            <AvatarFallback className="text-[8px] bg-zinc-800 text-zinc-400">
              {meet.createdByName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-[11px] text-zinc-300">
            started by <span className="text-white font-medium">{meet.createdByName}</span>
          </span>
        </div>


        {/* Date */}
        <span className="text-[11px] text-zinc-100">
          {formatTs(meet.startedAt)}
        </span>
      </div>


      {/* Meeting ID */}
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[10px] font-mono text-zinc-300 uppercase tracking-tight">ID</span>
        <code className="text-xs font-mono text-white bg-zinc-800/70 border border-zinc-800 px-2 py-0.5 rounded truncate select-all">
          {meet.meetingId}
        </code>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-2 text-[11px] text-zinc-300 mt-1">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-zinc-300" />
          {meet.durationMs != null
            ? formatDuration(meet.durationMs)
            : isActive
              ? "Ongoing"
              : "—"}
        </span>
        <span className="text-zinc-100">•</span>
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5 text-zinc-300" />
          {meet.members.length} {meet.members.length === 1 ? "participant" : "participants"}
        </span>

        {/* End time */}
        {meet.endedAt && (
          <span className="text-[10px] text-zinc-300 ml-auto">
            ended {formatTs(meet.endedAt)}
          </span>
        )}
      </div>

      {/* Member avatars */}
      {meet.members.length > 0 && (
        <div className="flex items-center -space-x-1.5 overflow-hidden py-1">
          {meet.members.slice(0, 5).map((m, i) => (
            <Tooltip key={m.userId}>
              <TooltipTrigger asChild>
                <Avatar className="h-6 w-6 border border-zinc-950 ring-0 shrink-0">
                  <AvatarImage src={m.avatar} />
                  <AvatarFallback className="text-[7px] bg-zinc-800 text-zinc-300">
                    {m.name[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-100">
                {m.name}
              </TooltipContent>
            </Tooltip>
          ))}
          {meet.members.length > 5 && (
            <span className="text-[10px] text-zinc-500 font-medium pl-2">
              +{meet.members.length - 5} others
            </span>
          )}
        </div>
      )}

      {/* Join button (only for active) */}
      {isActive ? (
        <Button
          size="sm"
          className="w-full text-xs mt-2 font-medium shadow-[0_1px_2px_rgba(0,0,0,0.05)] h-8 rounded-lg"
          onClick={() =>
            router.push(
              `/dashboard/my-projects/${slug}/workspace/meet/${meet.meetingId}`
            )
          }
        >
          <Radio className="w-4 h-4 mr-1.5 " />
          Join Meeting
        </Button>
      ) : (
        <Button
          size="sm"
          className="w-full text-xs mt-2 font-medium shadow-[0_1px_2px_rgba(0,0,0,0.05)] h-8 rounded-lg"
        // disabled
        >
          <Ban className="w-4 h-4 mr-1.5 " />
          Meeting Ended
        </Button>
      )}
    </div>
  );
}

// ─── Scheduled meeting card ──────────────────────────────────────────────────
function ScheduledMeetCard({
  event,
  onDelete,
  isOwnerOrAdmin,
}: {
  event: any;
  onDelete: (id: Id<"calendarEvents">) => void;
  isOwnerOrAdmin: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border p-4 bg-sidebar border-border"
      )}
    >
      {/* Top row: Scheduled badge + Created date */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-zinc-300" />
          <span className="text-[11px] text-zinc-300 font-medium">
            Scheduled Meet
          </span>
        </div>
        <span className="text-[11px] text-zinc-100">
          Created {formatTs(event.createdAt)}
        </span>
      </div>

      {/* Main Title & Description */}
      <div>
        <h3 className="text-sm font-semibold text-white">{event.title}</h3>
        {event.description && (
          <p className="text-xs text-neutral-300 mt-1 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        )}
      </div>

      {/* Time & Duration stats row */}
      <div className="flex items-center gap-2 text-[11px] text-neutral-300 mt-1">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-zinc-300" />
          {formatTs(event.start)}
        </span>
        <span className="text-zinc-600">•</span>
        <span>1 hr duration</span>
      </div>

      {/* Cancel button */}
      {isOwnerOrAdmin && (
        <Button
          size="sm"
          className="w-full text-xs mt-2 font-medium shadow-[0_1px_2px_rgba(0,0,0,0.05)] h-8 rounded-lg"
          onClick={() => onDelete(event._id)}
        >
          <Ban className="w-4 h-4 mr-1.5" />
          Cancel Meeting
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
  const { isOwner, isAdmin, isViewer, isLoading: permLoading } = useProjectPermissions(
    project?._id as Id<"projects"> | undefined
  );
  const canStart = !isViewer && (isOwner || isAdmin);

  // ── Meeting history ──────────────────────────────────────────────────────
  const meetings = useQuery(
    api.notifications.getProjectMeetings,
    project?._id ? { projectId: project._id as Id<"projects"> } : "skip"
  );
  const activeCount = meetings?.filter((m) => m.status === "active").length ?? 0;

  // ── Calendar scheduled events ────────────────────────────────────────────
  const calendarEvents = useQuery(
    api.calendar.getEvents,
    project?._id ? { projectId: project._id as Id<"projects"> } : "skip"
  );
  const scheduledMeetings = calendarEvents?.filter(
    (e) => e.type === "event" && e.title === "Team Meeting"
  ) ?? [];

  // ── Mutations ────────────────────────────────────────────────────────────
  const notifyMeeting = useMutation(api.notifications.notifyMeetingStarted);
  const createEvent = useMutation(api.calendar.createEvent);
  const deleteEvent = useMutation(api.calendar.deleteEvent);

  // ── Local state ──────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"history" | "scheduled">("history");
  const [isCreating, setIsCreating] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [joinId, setJoinId] = useState("");

  // Schedule Meet state
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(getTodayDateStr());
  const [scheduleTime, setScheduleTime] = useState(getNextHourTimeStr());
  const [scheduleDesc, setScheduleDesc] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);

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

  /** Submit scheduled meeting to calendar Events */
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project?._id) return;
    setIsScheduling(true);

    try {
      const startDateTime = new Date(`${scheduleDate}T${scheduleTime}`).getTime();
      const endDateTime = startDateTime + 60 * 60 * 1000; // 1 hour default

      await createEvent({
        projectId: project._id as Id<"projects">,
        title: "Team Meeting", // Fixed title
        description: scheduleDesc.trim() || undefined,
        type: "event",
        start: startDateTime,
        end: endDateTime,
        allDay: false,
        color: "#c4b5fd", // purple
      });

      toast.success("Team Meeting scheduled successfully!");
      setScheduleDialogOpen(false);
      setScheduleDesc("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to schedule meeting.");
    } finally {
      setIsScheduling(false);
    }
  };

  /** Cancel a scheduled meeting */
  const handleCancelMeeting = async (id: Id<"calendarEvents">) => {
    const toastId = toast.loading("Cancelling scheduled meeting...");
    try {
      await deleteEvent({ id });
      toast.success("Meeting cancelled successfully!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel meeting.", { id: toastId });
    }
  };

  const hasMeetings = meetings && meetings.length > 0;

  return (
    <TooltipProvider>
      <div className="w-full h-full">
        {/* ── Blue Gradient Header ─────────────────────────────────────────── */}
        <div className="bg-linear-to-br from-blue-500 to-blue-200 p-4 h-44 relative">
          <header className="flex items-start justify-between gap-4 mb-8 z-20 relative">
            <div>
              <h1 className="text-2xl font-semibold flex text-white items-center gap-2">
                <Video className="w-6 h-6 text-white" />
                Team Meet
              </h1>
              <p className="text-sm text-neutral-100 mt-1">
                Connect with your teammates in real-time video calls. <br />
                Schedule for future and plan it well.
              </p>
            </div>

            <div className="flex items-center gap-3 z-20">
              {!isViewer && (
                <>
                  <Button
                    size="sm"
                    className="text-xs  cursor-pointer"
                    onClick={() => setJoinDialogOpen(true)}
                  >
                    <Link2 className="w-4 h-4 mr-2" />
                    Join with ID
                  </Button>

                  <Button
                    size="sm"
                    className="text-xs bg-white hover:bg-white/90 text-zinc-950 font-medium cursor-pointer"
                    onClick={() => setScheduleDialogOpen(true)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Meet
                  </Button>

                  <Button
                    size="sm"
                    className="text-xs bg-white hover:bg-white/90 text-zinc-950 font-medium cursor-pointer"
                    onClick={handleNewMeeting}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Start Instant Meeting
                  </Button>
                </>
              )}
              {isViewer && (
                <span className="text-[11px] text-white/80 bg-white/10 border border-white/20 px-3 py-1.5 rounded-md">
                  View-only access
                </span>
              )}
            </div>
          </header>

          <Image
            src="/team.png"
            alt="Meet"
            width={180}
            height={180}
            className="absolute -bottom-4 -right-2 pointer-events-none"
          />
        </div>

        {/* ── Main Content Area ─────────────────────────────────────────── */}
        <div className="p-6 max-w-7xl mx-auto">

          {/* ── Active banner (if any live meet) ───────────────────────── */}
          {/* {activeCount > 0 && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">
            <Radio className="w-4 h-4 animate-pulse shrink-0" />
            <span>
              <strong>{activeCount}</strong> active meeting
              {activeCount > 1 ? "s" : ""} in progress — join below.
            </span>
          </div>
        )} */}

          {/* ── Tabs ───────────────────────────────────────────────────── */}
          <div className="flex border-b border-zinc-800/80 mb-6">
            <button
              onClick={() => setActiveTab("history")}
              className={cn(
                "px-4 py-2 text-base font-medium border-b-2 transition-all duration-200 -mb-[2px] flex items-center gap-2",
                activeTab === "history"
                  ? "border-primary text-white"
                  : "border-transparent text-zinc-400 hover:text-white"
              )}
            >
              Meeting History
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-zinc-800 text-zinc-100">
                {meetings?.length ?? 0}
              </Badge>
            </button>
            <button
              onClick={() => setActiveTab("scheduled")}
              className={cn(
                "px-4 py-2 text-base font-medium border-b-2 transition-all duration-200 -mb-[2px] flex items-center gap-2",
                activeTab === "scheduled"
                  ? "border-primary text-white"
                  : "border-transparent text-zinc-400 hover:text-white"
              )}
            >
              Scheduled Meets
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-zinc-800 text-zinc-100">
                {scheduledMeetings.length}
              </Badge>
            </button>
          </div>

          {/* ── Tab Content ────────────────────────────────────────────── */}
          {activeTab === "history" ? (
            <>
              {/* Cards grid */}
              <div className="grid grid-cols-3 gap-6">
                {/* Creator Box (Admin/Owner only — hidden for viewers) */}
                {!isViewer && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleNewMeeting}
                        disabled={isCreating || permLoading || !canStart}
                        className={cn(
                          "group relative flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 transition-all duration-200 min-h-[160px] w-full",
                          canStart
                            ? "border-zinc-700 bg-sidebar/70 hover:border-zinc-600 hover:bg-zinc-900/70 cursor-pointer"
                            : "border-zinc-850/40 bg-zinc-900 opacity-40 cursor-not-allowed"
                        )}
                      >
                        {isCreating ? (
                          <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        ) : (
                          <Video className="w-5 h-5 text-white" />
                        )}
                        <span className="text-base text-zinc-300 group-hover:text-white transition-colors flex items-center gap-1">
                          {isCreating ? "Starting..." : "Start Instant Meeting"}
                          {!isCreating && <Plus className="w-3.5 h-3.5 text-zinc-100 group-hover:text-white" />}
                        </span>
                      </button>
                    </TooltipTrigger>
                    {!canStart && !permLoading && (
                      <TooltipContent side="top" className="bg-zinc-900 border border-zinc-800 text-zinc-200">
                        Only project owners and admins can start instant meetings.
                      </TooltipContent>
                    )}
                  </Tooltip>
                )}

                {meetings?.map((m) => (
                  <MeetCard key={m._id} meet={m} slug={slug} />
                ))}
              </div>
            </>
          ) : (
            <>
              {scheduledMeetings.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[40vh] gap-4 text-center">
                  <Calendar className="w-12 h-12 text-zinc-600" />
                  <div className="space-y-1 max-w-sm">
                    <p className="text-lg font-semibold text-zinc-300">No Scheduled Meetings</p>
                    <p className="text-xs text-zinc-500">
                      Plan a future meeting to sync with your team.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="mt-2 text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium"
                    onClick={() => setScheduleDialogOpen(true)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule a Meet
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {scheduledMeetings.map((event) => (
                    <ScheduledMeetCard
                      key={event._id}
                      event={event}
                      onDelete={handleCancelMeeting}
                      isOwnerOrAdmin={canStart}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Join by ID Dialog ──────────────────────────────────────── */}
          <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
            <DialogContent className="sm:max-w-md bg-zinc-950 border border-zinc-800 text-zinc-100">
              <DialogHeader>
                <DialogTitle className="text-zinc-100">Join a Meeting</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Paste a meeting ID or the full meeting link to join.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2 py-2">
                <Label htmlFor="join-id" className="text-zinc-400">Meeting ID or Link</Label>
                <Input
                  id="join-id"
                  placeholder="e.g. x7k2m-9pqr3"
                  value={joinId}
                  onChange={(e) => setJoinId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                  className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
                />
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setJoinDialogOpen(false)}
                  className="border-zinc-800 hover:bg-zinc-900"
                >
                  Cancel
                </Button>
                <Button onClick={handleJoin} disabled={!joinId.trim()}>
                  Join
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* ── Schedule Meet Dialog ───────────────────────────────────── */}
          <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
            <DialogContent className="sm:max-w-md bg-zinc-950 border border-zinc-800 text-zinc-100">
              <DialogHeader>
                <DialogTitle className="text-zinc-100">Schedule Team Meeting</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Plan a future meeting. It will be added to the project calendar.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleScheduleSubmit} className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="meeting-title" className="text-zinc-400">Title</Label>
                  <Input
                    id="meeting-title"
                    value="Team Meeting"
                    disabled
                    className="bg-zinc-900 border-zinc-800 text-zinc-400 cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="meeting-date" className="text-zinc-400">Date</Label>
                    <Input
                      id="meeting-date"
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      required
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 [color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meeting-time" className="text-zinc-400">Start Time</Label>
                    <Input
                      id="meeting-time"
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      required
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meeting-desc" className="text-zinc-400">Description (Optional)</Label>
                  <Textarea
                    id="meeting-desc"
                    placeholder="Agenda, notes, or details..."
                    value={scheduleDesc}
                    onChange={(e) => setScheduleDesc(e.target.value)}
                    className="resize-none h-24 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setScheduleDialogOpen(false)}
                    disabled={isScheduling}
                    className="border-zinc-800 hover:bg-zinc-900"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isScheduling}>
                    {isScheduling ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      "Schedule"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </TooltipProvider>
  );
}
