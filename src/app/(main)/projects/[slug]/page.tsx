"use client";

import { use, useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";

// ── types ──────────────────────────────────────────────────────────────────
interface Member {
  userId: string;
  userName: string;
  userImage: string | null;
  AccessRole: string;
}

interface Language { name: string; percentage: number; bytes: number }

interface Health {
  openIssuesCount: number;
  closedIssuesCount: number;
  commitsLast60Days: number;
  totalPRs: number;
  mergedPRs: number;
  prMergeRate: number;
  lastCommitDate: string | null;
}

interface Profile {
  _id: Id<"projects">;
  projectName: string;
  slug: string;
  description: string | null;
  tags: string[];
  isPublic: boolean;
  isPrivate?: boolean;
  thumbnailUrl: string | null;
  projectWorkStatus: string | null;
  projectUpvotes: number;
  projectLiveLink: string | null;
  createdAt: number;
  ownerName: string;
  ownerImage: string | null;
  ownerOccupation: string | null;
  repo: { repoOwner: string; repoName: string; repoUrl: string } | null;
  members: Member[];
  totalMembers: number;
  targetDate: number | null;
  currentUser: {
    hasUpvoted: boolean;
    isMember: boolean;
    isOwner: boolean;
    hasPendingRequest: boolean;
  } | null;
}

interface PageData {
  profile: Profile;
  languages: Language[] | null;
  health: Health | null;
}

// ── helpers ────────────────────────────────────────────────────────────────
const ROLE_COLORS: Record<string, string> = {
  owner: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  admin: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  member: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  viewer: "bg-sky-500/15 text-sky-400 border-sky-500/30",
};

const LANG_COLORS = [
  "#6366f1", "#8b5cf6", "#06b6d4", "#10b981",
  "#f59e0b", "#ef4444", "#ec4899", "#84cc16",
];

function timeAgo(ms: number) {
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

// ── component ──────────────────────────────────────────────────────────────
interface Props { params: Promise<{ slug: string }> }

export default function PublicProjectPage({ params }: Props) {
  const { slug } = use(params);
  const { isSignedIn } = useUser();

  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upvotes, setUpvotes] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [joiningState, setJoiningState] = useState<"idle" | "loading" | "sent">("idle");

  const toggleUpvote = useMutation(api.project.toggleProjectUpvote);
  const createJoinRequest = useMutation(api.project.createJoinRequest);

  // Live auth-aware query — NOT cached, always reflects current user
  const liveProfile = useQuery(
    api.project.getPublicProjectProfile,
    data?.profile?.slug ? { slug: data.profile.slug } : "skip"
  );
  const currentUser = (liveProfile && !liveProfile.isPrivate) ? liveProfile.currentUser : null;

  useEffect(() => {
    fetch(`/api/public/slug?slug=${slug}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setUpvotes(d?.profile?.projectUpvotes ?? 0);
      })
      .catch(() => toast.error("Failed to load project"))
      .finally(() => setLoading(false));
  }, [slug]);

  // Sync upvote state from live query once available
  useEffect(() => {
    if (currentUser?.hasUpvoted !== undefined) setHasUpvoted(currentUser.hasUpvoted);
    if (currentUser?.hasPendingRequest) setJoiningState("sent");
  }, [currentUser?.hasUpvoted, currentUser?.hasPendingRequest]);

  // ── upvote ──────────────────────────────────────────────────────────────
  async function handleUpvote() {
    if (!isSignedIn) {
      toast.error("Sign in to upvote this project");
      return;
    }
    if (!data?.profile?._id) return;

    const optimistic = !hasUpvoted;
    setHasUpvoted(optimistic);
    setUpvotes((v) => v + (optimistic ? 1 : -1));

    try {
      await toggleUpvote({ projectId: data.profile._id });
      toast.success(optimistic ? "Upvoted!" : "Upvote removed");
    } catch {
      // revert
      setHasUpvoted(!optimistic);
      setUpvotes((v) => v + (optimistic ? -1 : 1));
      toast.error("Failed to upvote");
    }
  }

  // ── join ────────────────────────────────────────────────────────────────
  async function handleJoin() {
    if (!isSignedIn) {
      toast.error("Sign in to request joining this project");
      return;
    }
    if (!data?.profile?._id) return;
    setJoiningState("loading");
    try {
      await createJoinRequest({ projectId: data.profile._id, source: "manual" });
      setJoiningState("sent");
      toast.success("Join request sent!");
    } catch (e: any) {
      setJoiningState("idle");
      toast.error(e?.message ?? "Failed to send request");
    }
  }

  // ── states ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-muted rounded-full border-t-primary animate-spin" />
      </div>
    );
  }

  if (!data?.profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Project not found.
      </div>
    );
  }

  const { profile, languages, health } = data;

  if (profile.isPrivate) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <span className="text-4xl">🔒</span>
        <h1 className="text-xl font-semibold">{profile.projectName}</h1>
        <p className="text-muted-foreground text-sm">This project is private.</p>
      </div>
    );
  }

  const isOwner = currentUser?.isOwner ?? false;
  const isMember = currentUser?.isMember ?? false;
  const isPower = isOwner || isMember;
  const canJoin = isSignedIn && !isPower;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero thumbnail ──────────────────────────────────────────────── */}
      <div className="relative w-full" style={{ minHeight: 280 }}>
        {profile.thumbnailUrl ? (
          <img
            src={profile.thumbnailUrl}
            alt={profile.projectName}
            className="w-full object-cover"
            style={{ maxHeight: 420, minHeight: 280, width: "100%", display: "block" }}
          />
        ) : (
          <div className="w-full bg-gradient-to-br from-zinc-900 to-zinc-800" style={{ height: 280 }} />
        )}

        {/* gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.65) 70%, rgba(0,0,0,0.90) 100%)",
          }}
        />

        {/* info on top of thumbnail */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-10">
          <div className="max-w-4xl mx-auto space-y-3">
            {/* badges row */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                  profile.isPublic
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : "bg-zinc-500/20 text-zinc-300 border-zinc-500/30"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${profile.isPublic ? "bg-emerald-400" : "bg-zinc-400"}`} />
                {profile.isPublic ? "Public" : "Private"}
              </span>

              {profile.projectWorkStatus && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-sky-500/15 text-sky-300 border-sky-500/30">
                  {profile.projectWorkStatus}
                </span>
              )}

              <span className="text-white/50 text-xs">{timeAgo(profile.createdAt)}</span>
            </div>

            {/* project name */}
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
              {profile.projectName}
            </h1>

            {/* owner row + upvote */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                {profile.ownerImage && (
                  <img
                    src={profile.ownerImage}
                    alt={profile.ownerName}
                    className="w-7 h-7 rounded-full ring-2 ring-white/20 object-cover"
                  />
                )}
                <span className="text-white/80 text-sm font-medium">{profile.ownerName}</span>
                {profile.ownerOccupation && (
                  <span className="text-white/40 text-xs hidden sm:inline">· {profile.ownerOccupation}</span>
                )}
              </div>

              {/* upvote button */}
              <button
                onClick={handleUpvote}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-150 ${
                  hasUpvoted
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                    : "bg-white/10 border-white/20 text-white/80 hover:bg-white/15"
                }`}
              >
                <span>{hasUpvoted ? "▲" : "△"}</span>
                <span>{upvotes}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* description + join */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            {profile.description && (
              <p className="text-muted-foreground leading-relaxed">{profile.description}</p>
            )}

            {/* tags */}
            {profile.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-0.5 rounded-full bg-muted border border-border text-xs text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* links */}
            <div className="flex gap-3 text-sm flex-wrap">
              {profile.projectLiveLink && (
                <a
                  href={profile.projectLiveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-primary hover:underline"
                >
                  🔗 Live demo
                </a>
              )}
              {profile.repo?.repoUrl && (
                <a
                  href={profile.repo.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  ⌥ {profile.repo.repoOwner}/{profile.repo.repoName}
                </a>
              )}
            </div>
          </div>

          {/* action button */}
          {isPower ? (
            // Owner / Admin / Member → manage
            <a
              href={`/dashboard/projects`}
              className="shrink-0 px-4 py-2 rounded-lg text-sm font-medium border border-border bg-muted text-foreground hover:bg-muted/70 transition-colors"
            >
              ⚙ Manage project
            </a>
          ) : isSignedIn ? (
            // Logged in, not a member → join flow
            <button
              onClick={handleJoin}
              disabled={joiningState !== "idle"}
              className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                joiningState === "sent"
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 cursor-default"
                  : joiningState === "loading"
                  ? "opacity-60 cursor-wait bg-muted border-border text-muted-foreground"
                  : "bg-primary text-primary-foreground hover:opacity-90 border-transparent"
              }`}
            >
              {joiningState === "sent"
                ? "✓ Request in progress"
                : joiningState === "loading"
                ? "Sending…"
                : "Request to join"}
            </button>
          ) : (
            // Not logged in
            <button
              onClick={() => toast.error("Sign in to request joining this project")}
              className="shrink-0 px-4 py-2 rounded-lg text-sm font-medium border bg-primary text-primary-foreground hover:opacity-90 border-transparent"
            >
              Request to join
            </button>
          )}
        </div>

        {/* ── Members ───────────────────────────────────────────────────── */}
        {profile.members?.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Team · {profile.totalMembers}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.members.map((m) => (
                <div
                  key={m.userId}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                >
                  {m.userImage ? (
                    <img
                      src={m.userImage}
                      alt={m.userName}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium shrink-0">
                      {m.userName?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.userName}</p>
                  </div>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full border font-medium capitalize ${
                      ROLE_COLORS[m.AccessRole] ?? ROLE_COLORS.member
                    }`}
                  >
                    {m.AccessRole}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Languages ─────────────────────────────────────────────────── */}
        {languages && languages.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Languages
            </h2>
            {/* bar */}
            <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5">
              {languages.map((l, i) => (
                <div
                  key={l.name}
                  title={`${l.name} ${l.percentage}%`}
                  style={{ width: `${l.percentage}%`, background: LANG_COLORS[i % LANG_COLORS.length] }}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              {languages.map((l, i) => (
                <div key={l.name} className="flex items-center gap-1.5 text-sm">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: LANG_COLORS[i % LANG_COLORS.length] }}
                  />
                  <span className="font-medium">{l.name}</span>
                  <span className="text-muted-foreground text-xs">{l.percentage}%</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Health ────────────────────────────────────────────────────── */}
        {health && (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Repo Health
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Open Issues", value: health.openIssuesCount },
                { label: "Commits (60d)", value: health.commitsLast60Days },
                { label: "Total PRs", value: health.totalPRs },
                { label: "Merge Rate", value: `${health.prMergeRate}%` },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-xl border border-border bg-card p-4 space-y-1"
                >
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-xl font-bold">{value}</p>
                </div>
              ))}
            </div>
            {health.lastCommitDate && (
              <p className="text-xs text-muted-foreground">
                Last commit: {new Date(health.lastCommitDate).toLocaleDateString()}
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
