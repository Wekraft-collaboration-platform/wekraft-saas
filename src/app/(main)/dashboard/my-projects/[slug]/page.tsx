"use client";

import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import {
  ArrowUpRight,
  Calendar,
  ChevronLeft,
  Clock,
  CopyPlus,
  ExternalLink,
  Globe,
  Globe2,
  GlobeLock,
  ImageIcon,
  Link2,
  Loader2,
  LucideExternalLink,
  LucideLayers3,
  Settings2,
  UploadCloud,
  UserPlus,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { InviteDialog } from "@/modules/project/inviteDilogag";
import ProjectInfo from "@/modules/project/ProjectInfo";
import { ProjectJoinRequests } from "@/modules/project/project-join-requests";
import SettingTab from "@/modules/project/SettingsTab";
import { useSidebar } from "@/components/ui/sidebar";

const ProjectPage = () => {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const { open: isSidebarOpen } = useSidebar();

  const project = useQuery(api.project.getProjectBySlug, { slug });
  const projectInviteLink = project?.inviteLink;
  const user = useQuery(api.user.getCurrentUser);
  const members = useQuery(
    api.project.getProjectMembers,
    project?._id ? { projectId: project._id as Id<"projects"> } : "skip",
  );
  const requests = useQuery(
    api.project.getProjectJoinRequests,
    project?._id ? { projectId: project._id as Id<"projects"> } : "skip",
  );
  const pendingRequestsCount = requests
    ? requests.filter((r) => r.status === "pending").length
    : 0;

  const [isUploading, setIsUploading] = useState(false);
  const [homeTab, setHomeTab] = useState("settings");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [showWorkspaceTour, setShowWorkspaceTour] = useState(false);
  const [showInviteTour, setShowInviteTour] = useState(false);
  const visitBtnRef = useRef<HTMLAnchorElement>(null);
  const markWorkspaceVisited = useMutation(api.user.markWorkspaceVisited);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const tab = searchParams.get("tab");
      if (tab) {
        setHomeTab(tab);
      }

      let t1: ReturnType<typeof setTimeout> | undefined;
      let t2: ReturnType<typeof setTimeout> | undefined;

      if (searchParams.get("invite") === "true") {
        t1 = setTimeout(() => {
          setInviteOpen(true);
          if (sessionStorage.getItem("wekraft_tour_active") === "true") {
            setTimeout(() => setShowInviteTour(true), 400);
          }
        }, 300);
      }
      if (searchParams.get("tour") === "workspace") {
        t2 = setTimeout(() => setShowWorkspaceTour(true), 400);
      }

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, []);

  const isOwner = !!project && !!user && project.ownerId === user._id;

  const updateThumbnail = useMutation(api.project.updateProjectThumbnail);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (file.size > 1 * 1024 * 1024) {
      toast.error("File too large. Max 1MB allowed.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }

    const toastId = toast.loading("Uploading thumbnail...");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (project?.thumbnailUrl) {
        formData.append("oldUrl", project.thumbnailUrl);
      }

      const response = await fetch("/api/objects", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      await updateThumbnail({
        projectId: project?._id as Id<"projects">,
        thumbnailUrl: data.url,
      });

      toast.success("Thumbnail updated successfully!", { id: toastId });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload thumbnail", {
        id: toastId,
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (project === undefined || user === undefined) {
    return <ProjectSkeleton />;
  }

  if (project === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 p-6">
        <h2 className="text-2xl font-bold">Project not found</h2>
        <Link href="/dashboard">
          <Button variant="default">Go Back Dashboard</Button>
        </Link>
      </div>
    );
  }
  return (
    <div className="w-full min-h-screen animate-in fade-in duration-700 p-6">
      <header className="flex justify-between items-center mb-5">
        <div className="flex flex-col space-y-1.5">
          <div className="flex items-center gap-5">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <LucideLayers3 className="w-6 h-6 text-primary" />{" "}
              {project.projectName}
            </h1>
            <Badge
              variant={"outline"}
              className="px-3! py-0.5 text-[10px] bg-transparent"
            >
              {project?.isPublic ? (
                <span className="flex items-center gap-2">
                  <Globe className="w-3 h-3 text-blue-500" /> Public
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <GlobeLock className="w-3 h-3 text-muted-foreground" />{" "}
                  Private
                </span>
              )}
            </Badge>
          </div>
          {project?.repoFullName && project?.repositoryId ? (
            <Link href={`/dashboard/my-projects/${project?.slug}/workspace`}>
              <p className="text-muted-foreground text-sm cursor-pointer hover:text-primary/90">
                <Link2 className="inline w-5 h-5" /> {project.repoFullName}
              </p>
            </Link>
          ) : (
            <p className="text-muted-foreground text-sm cursor-pointer hover:text-primary/90">
              No repository connected{" "}
              <span
                className="text-primary hover:underline"
                onClick={() => {
                  router.push(`/dashboard/repositories`);
                }}
              >
                Click here to connect{" "}
                <ExternalLink className="inline w-3 h-3 ml-0.5 -mt-1" />
              </span>
            </p>
          )}
        </div>
        <div className="flex gap-5">
          <Link href={`/dashboard/`}>
            <Button
              size="sm"
              variant={"outline"}
              className="px-6 text-xs cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 inline mr-2" /> Back
            </Button>
          </Link>

          <Link
            href={`/dashboard/my-projects/${project?.slug}/workspace`}
            ref={visitBtnRef}
            id="visit-workspace-btn"
          >
            <Button size="sm" className="px-6! text-xs" variant={"default"}
              onClick={async () => {
                try { await markWorkspaceVisited(); } catch {}
              }}
            >
              Visit workspace{" "}
              <LucideExternalLink className="ml-2 w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* ----------------------------------------------- */}
      {/* -------------------AWS SETUP HERE ------------- */}
      <div className={`${isSidebarOpen ? "w-[1080px]" : "w-[1240px]"} h-[300px] mx-auto bg-primary/10 rounded-lg overflow-hidden my-8 relative group border border-border`}>
        {project.thumbnailUrl ? (
          <Image
            src={project.thumbnailUrl}
            alt="Project Thumbnail"
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
            <p>No thumbnail uploaded</p>
          </div>
        )}

        {/* Overlay for upload */}
        {isOwner && (
          <div
            className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isUploading ? "opacity-100" : ""
              }`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center text-white">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p>Uploading...</p>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-white">
                <UploadCloud className="w-10 h-10 mb-2" />
                <span className="font-semibold">Click to Upload Thumbnail</span>
                <span className="text-xs text-white/70 mt-1">
                  1280 x 300 Recommended (Max 1MB)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>
        )}
      </div>

      {/* WORKSPACE TOUR TOOLTIP */}
      {showWorkspaceTour && (
        <div
          className="fixed inset-0 z-50 pointer-events-none"
          onClick={() => setShowWorkspaceTour(false)}
        >
          <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] pointer-events-auto" onClick={() => setShowWorkspaceTour(false)} />
          <WorkspaceTourTooltip
            targetId="visit-workspace-btn"
            onDismiss={() => setShowWorkspaceTour(false)}
            onNext={() => {
              setShowWorkspaceTour(false);
              router.push(`/dashboard/my-projects/${project?.slug}/workspace/tasks?tour=create-task`);
            }}
            onVisit={async () => {
              try { await markWorkspaceVisited(); } catch {}
              setShowWorkspaceTour(false);
              router.push(`/dashboard/my-projects/${project?.slug}/workspace`);
            }}
          />
        </div>
      )}

      {/* INVITE TOUR TOOLTIP */}
      {showInviteTour && inviteOpen && (
        <div
          className="fixed inset-0 z-[100] pointer-events-none"
          onClick={() => setShowInviteTour(false)}
        >
          <InviteTourTooltip
            targetId="copy-invite-link-btn"
            onDismiss={() => setShowInviteTour(false)}
            onNext={() => {
              // Resume tour for Step 7 (Install extension) on dashboard
              router.push("/dashboard?tour=resume&resumeAfter=6");
            }}
          />
        </div>
      )}

      {/* ---------------------TABS / SETTINGS BELOW---------------- */}
      <div className="w-full flex items-center justify-end mb-10">
        <div className="flex items-center gap-5">
          {/* <Button
            className="px-3! text-xs cursor-pointer"
            size="sm"
            variant={"outline"}
          >
            View Public Page <Globe className="ml-2 w-3.5 h-3.5" />
          </Button> */}

          <Link href={`/dashboard/my-projects/${project?.slug}/workspace`}>
            <Button size="sm" className=" px-4! text-xs" variant={"outline"}>
              Share Project
              <LucideExternalLink className="ml-2 w-3.5 h-3.5" />
            </Button>
          </Link>

          <InviteDialog
            inviteLink={projectInviteLink}
            projectName={project.projectName}
            open={inviteOpen}
            onOpenChange={setInviteOpen}
            trigger={
              <Button
                className="px-5! h-7! rounded-md text-xs cursor-pointer bg-blue-500 text-white hover:bg-blue-600"
                size="sm"
                onClick={() => setInviteOpen(true)}
              >
                Invite <CopyPlus className="ml-2 w-3.5 h-3.5" />
              </Button>
            }
          />
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* PARENT CONTAINER LEFT SIDE TABS || RIGHT SIDE PROJECT INFO */}
      <div className="flex items-stretch">
        {/* LEFT SIDE 3 TABS */}
        <div className="w-[65%] h-full">
          {/* TABS */}
          <div className="flex items-center justify-center gap-6  px-4 border-b border-accent pb-4">
            <Button
              size="sm"
              className="rounded-full px-4! text-[10px]"
              variant={homeTab === "settings" ? "default" : "outline"}
              onClick={() => setHomeTab("settings")}
            >
              Settings <Settings2 />
            </Button>

            <Button
              size="sm"
              className="rounded-full px-4! text-[10px] flex items-center gap-1.5"
              variant={homeTab === "requests" ? "default" : "outline"}
              onClick={() => setHomeTab("requests")}
            >
              <span>Requests</span>
              <UserPlus className="w-3.5 h-3.5" />
              {pendingRequestsCount > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold transition-colors ${homeTab === "requests"
                    ? "bg-background text-foreground"
                    : "bg-primary text-primary-foreground"
                    }`}
                >
                  {pendingRequestsCount}
                </span>
              )}
            </Button>

            <Button
              size="sm"
              className="rounded-full px-4! text-[10px]"
              variant={homeTab === "community" ? "default" : "outline"}
              onClick={() => setHomeTab("community")}
            >
              Community <Globe />
            </Button>
          </div>

          <div className="px-4">
            {homeTab === "settings" && (
              <div className="py-10">
                {isOwner ? (
                  <SettingTab project={project as any} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border border-dashed border-border rounded-xl bg-accent/20">
                    <div className="bg-accent/70 p-4 rounded-full">
                      <GlobeLock className="w-7 h-7" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-base font-bold">
                        Settings Restricted
                      </h3>
                      <p className="text-muted-foreground max-w-xs mx-auto text-sm">
                        Only the project owner has the power to update settings.
                        Please contact the owner for any modifications.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            {homeTab === "requests" && (
              <ProjectJoinRequests
                projectId={project._id}
                projectName={project.projectName}
                currentMemberCount={(project as any).totalMemberCount}
                memberLimit={(project as any).memberLimit}
              />
            )}
            {homeTab === "community" && (
              <div className="py-10 text-center text-muted-foreground text-sm">
                Community features coming soon...
              </div>
            )}
          </div>
        </div>
        <Separator orientation="vertical" className="h-auto! mx-2" />
        {/* RIGHT SIDE , Info */}
        <div className="w-[30%] h-full pl-6 mt-4">
          <ProjectInfo project={project as any} members={members} />
        </div>
      </div>
    </div>
  );
};

const ProjectSkeleton = () => {
  return (
    <div className="w-full h-full p-6 lg:p-10 space-y-8">
      <Skeleton className="w-40 h-6" />

      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-4 w-full max-w-2xl">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-full" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="md:col-span-2 h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
};

export default ProjectPage;

// ─── Workspace Tour Tooltip ─────────────────────────────────────────────────
function WorkspaceTourTooltip({
  targetId,
  onDismiss,
  onNext,
  onVisit,
}: {
  targetId: string;
  onDismiss: () => void;
  onNext: () => void;
  onVisit: () => void;
}) {
  const [pos, setPos] = useState<{ top: number; left: number; arrowOffset?: number } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const calculate = () => {
      const el = document.getElementById(targetId);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const tooltipWidth = 320;
      const margin = 12;
      const targetCenter = rect.left + rect.width / 2;
      const rawLeft = targetCenter - tooltipWidth / 2;
      const clampedLeft = Math.min(
        Math.max(margin, rawLeft),
        window.innerWidth - tooltipWidth - margin
      );
      setPos({
        top: rect.bottom + 20,
        left: clampedLeft,
        arrowOffset: targetCenter - clampedLeft,
      });
    };
    calculate();
    const timer = setTimeout(calculate, 150);
    window.addEventListener("resize", calculate);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculate);
    };
  }, [targetId]);

  if (!pos) return null;

  return (
    <div
      className="fixed z-[60] pointer-events-auto animate-in fade-in duration-200 flex flex-col items-center"
      style={{ top: pos.top, left: pos.left, width: 320 }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Curvy arrow pointing up */}
      <div 
        className="mb-1 -mt-5"
        style={{ transform: `translateX(${pos.arrowOffset ? pos.arrowOffset - 160 : 0}px)` }}
      >
        <svg width="60" height="80" viewBox="0 0 60 80" fill="none" className="text-white drop-shadow-md rotate-180">
          <path
            d="M 30 5 C 45 30, 15 50, 30 75 M 30 75 L 22 65 M 30 75 L 38 65"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="flex flex-col w-full">
        {/* Tooltip Card — matches WelcomeDialog exactly */}
        <div className="bg-linear-to-br from-neutral-800 to-neutral-950 text-card-foreground border border-border shadow-2xl rounded-lg p-5">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full shrink-0">
              3
            </span>
            <h3 className="text-sm font-semibold text-foreground">Visit your workspace</h3>
          </div>

          <div className="h-px w-full bg-accent my-3" />

          <p className="text-xs text-muted-foreground leading-relaxed">
            Click the &quot;Visit workspace&quot; button above to enter your workspace and explore tasks, sprints, issues, and your team.
          </p>
        </div>

        {/* Buttons outside the box — matches WelcomeDialog layout */}
        <div className="mt-3 flex items-center justify-between gap-3 px-1 w-full">
          <Button
            variant="ghost"
            onClick={() => {
              sessionStorage.removeItem("wekraft_tour_active");
              onDismiss();
            }}
            className="h-8 px-3 text-xs text-muted-foreground hover:text-white"
          >
            Skip Tour
          </Button>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={onNext}
              className="h-8 px-3 text-xs"
            >
              Next
            </Button>
            <Button
              onClick={onVisit}
              className="h-8 px-4 text-xs"
            >
              Visit Workspace
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Invite Tour Tooltip ─────────────────────────────────────────────────
function InviteTourTooltip({
  targetId,
  onDismiss,
  onNext,
}: {
  targetId: string;
  onDismiss: () => void;
  onNext: () => void;
}) {
  const [pos, setPos] = useState<{ top: number; left: number; arrowOffset?: number } | null>(null);

  useEffect(() => {
    const calculate = () => {
      const el = document.getElementById(targetId);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const tooltipWidth = 320;
      const margin = 12;
      const targetCenter = rect.left + rect.width / 2;
      const rawLeft = targetCenter - tooltipWidth / 2;
      const clampedLeft = Math.min(
        Math.max(margin, rawLeft),
        window.innerWidth - tooltipWidth - margin
      );
      setPos({
        top: rect.bottom + 20,
        left: clampedLeft,
        arrowOffset: targetCenter - clampedLeft,
      });
    };
    calculate();
    // Re-calculate shortly after mount in case dialog animation shifts layout
    const timer = setTimeout(calculate, 150);
    window.addEventListener("resize", calculate);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculate);
    }
  }, [targetId]);

  if (!pos) return null;

  return (
    <div
      className="fixed z-[100] pointer-events-auto animate-in fade-in duration-200 flex flex-col items-center"
      style={{ top: pos.top, left: pos.left, width: 320 }}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div 
        className="mb-1 -mt-5"
        style={{ transform: `translateX(${pos.arrowOffset ? pos.arrowOffset - 160 : 0}px)` }}
      >
        <svg width="60" height="80" viewBox="0 0 60 80" fill="none" className="text-white drop-shadow-md rotate-180">
          <path
            d="M 30 5 C 45 30, 15 50, 30 75 M 30 75 L 22 65 M 30 75 L 38 65"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="flex flex-col w-full">
        {/* Tooltip Card — matches WelcomeDialog exactly */}
        <div className="bg-linear-to-br from-neutral-800 to-neutral-950 text-card-foreground border border-border shadow-2xl rounded-lg p-5">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full shrink-0">
              6
            </span>
            <h3 className="text-sm font-semibold text-foreground">Invite your teammates</h3>
          </div>

          <div className="h-px w-full bg-accent my-3" />

          <p className="text-xs text-muted-foreground leading-relaxed">
            Bring your whole team in. Assign roles, control permissions, and collaborate in real time
          </p>
        </div>

        {/* Buttons outside the box */}
        <div className="mt-3 flex items-center justify-between gap-3 px-1 w-full">
          <Button
            variant="ghost"
            onPointerDown={(e) => {
              e.preventDefault();
              sessionStorage.removeItem("wekraft_tour_active");
              onDismiss();
            }}
            className="h-8 px-3 text-xs text-muted-foreground hover:text-white"
          >
            Skip Tour
          </Button>

          <div className="flex gap-2">
            <Button
              className="h-8 px-4 text-xs bg-white text-black hover:bg-white/90"
              onPointerDown={(e) => {
                e.preventDefault();
                onNext();
              }}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
