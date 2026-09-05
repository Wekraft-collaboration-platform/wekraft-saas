"use client";

import { useMutation } from "convex/react";
import {
  ChevronDown,
  ExternalLink,
  FolderCode,
  Keyboard,
  Loader2,
  Minus,
  Plus,
  Settings2,
  Layers3,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import CreateProjectDialog from "@/modules/project/CreateProjectDialog";
import { api } from "../../../../convex/_generated/api";
import { useSidebar } from "@/components/ui/sidebar";
import { LuGitBranch } from "react-icons/lu";
import Image from "next/image";


interface DashboardProject {
  _id: string;
  projectName: string;
  isPublic: boolean;
  thumbnailUrl?: string;
  repoId?: string;
  repoName?: string;
  projectWorkStatus?: string;
  slug: string;
  createdAt?: number;
  role: "owned" | "joined";
  shortcut?: string;
  members?: {
    userId: string;
    userImage?: string;
    userName: string;
  }[];
  totalMembers: number;
}

interface DashboardProjectsProps {
  projects: DashboardProject[] | undefined;
  isRightSidebarExpanded: boolean;
}

const formatRelativeTime = (ts: number): string => {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60_000);
  const h = Math.floor(diff / 3_600_000);
  const d = Math.floor(diff / 86_400_000);
  if (d < 1) {
    if (h < 1) {
      if (m < 1) return "just now";
      return m === 1 ? "1 minute ago" : `${m} minutes ago`;
    }
    return h === 1 ? "1 hour ago" : `${h} hours ago`;
  }
  return d === 1 ? "1 day ago" : `${d} days ago`;
};

const ShortcutSelector = ({
  projectId,
  currentShortcut,
  projects,
  onSave,
}: {
  projectId: string;
  currentShortcut?: string;
  projects: DashboardProject[] | undefined;
  onSave: (shortcut?: string) => Promise<void>;
}) => {
  const [open, setOpen] = React.useState(false);
  const [modifier, setModifier] = React.useState<"Alt" | "Alt+Shift">("Alt");
  const [key, setKey] = React.useState<string>("1");
  const [saving, setSaving] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open && currentShortcut) {
      if (currentShortcut.startsWith("Alt+Shift+")) {
        setModifier("Alt+Shift");
        setKey(currentShortcut.replace("Alt+Shift+", ""));
      } else if (currentShortcut.startsWith("Alt+")) {
        setModifier("Alt");
        setKey(currentShortcut.replace("Alt+", ""));
      }
    }
  }, [currentShortcut, open]);

  React.useEffect(() => {
    setErrorMsg(null);
    if (!key) {
      setErrorMsg("Enter a key");
      return;
    }

    const candidate = `${modifier}+${key}`;
    const normalizedCandidate = candidate.toLowerCase();

    if (projects) {
      const conflictingProject = projects.find(
        (p) =>
          p._id !== projectId &&
          p.shortcut?.toLowerCase() === normalizedCandidate,
      );
      if (conflictingProject) {
        setErrorMsg(`Already in use in "${conflictingProject.projectName}"`);
        return;
      }
    }

    if (modifier === "Alt") {
      const browserDefaults = ["D", "F", "E", "V", "H", "T"];
      if (browserDefaults.includes(key.toUpperCase())) {
        setErrorMsg(`"${candidate}" is reserved in some browsers`);
        return;
      }
    }
  }, [modifier, key, projects, projectId]);

  const handleSave = async () => {
    if (errorMsg) return;
    setSaving(true);
    try {
      const shortcutStr = `${modifier}+${key}`;
      await onSave(shortcutStr);
      setOpen(false);
    } catch (_err) {
      // Error is handled by parent toast
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setSaving(true);
    try {
      await onSave(undefined);
      setOpen(false);
    } catch (_err) {
      // Error is handled by parent toast
    } finally {
      setSaving(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {currentShortcut ? (
          <button
            type="button"
            className="flex items-center gap-1 text-[10px] font-semibold font-mono bg-blue-500/10 hover:bg-blue-500/20 text-primary/80 dark:text-primary border border-primary/15 border-dashed rounded px-2.5 py-1 transition-all shadow-xs cursor-pointer select-none"
            title="Click to edit shortcut"
          >
            <Keyboard className="size-3" />
            <span>{currentShortcut}</span>
          </button>
        ) : (
          <button
            type="button"
            className="flex items-center gap-1 text-[10px] font-medium bg-accent/70 border border-primary/20 border-dashed rounded px-2.5 py-0.5 transition-all cursor-pointer select-none"
            title="Assign keyboard shortcut"
          >
            <Keyboard className="size-3 " />
            <span>Shortcut</span>
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent
        className="w-56 p-3 bg-popover border border-border rounded-xl shadow-xl z-50"
        align="start"
      >
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Keyboard className="size-3.5 text-primary" />
              Keyboard Shortcut
            </h4>
            <p className="text-[10px] text-muted-foreground leading-snug">
              Choose Alt or Alt+Shift combination to open this workspace.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                Modifier
              </span>
              <select
                value={modifier}
                onChange={(e) =>
                  setModifier(e.target.value as "Alt" | "Alt+Shift")
                }
                className="text-xs border border-border bg-card text-foreground rounded-md p-1 outline-hidden"
              >
                <option value="Alt">Alt</option>
                <option value="Alt+Shift">Alt + Shift</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                Key
              </span>
              <input
                type="text"
                value={key}
                onChange={(e) => {
                  const val = e.target.value.trim().slice(-1).toUpperCase();
                  if (val === "" || val.match(/^[A-Z0-9]$/)) {
                    setKey(val);
                  }
                }}
                placeholder="e.g. A"
                className="text-xs text-center border border-border bg-card text-foreground rounded-md p-1 outline-hidden uppercase"
                maxLength={1}
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-[10px] text-red-500 font-medium leading-tight">
              {errorMsg}
            </p>
          )}

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50">
            {currentShortcut ? (
              <Button
                variant="ghost"
                size="xs"
                onClick={handleClear}
                disabled={saving}
                className="text-[10px] h-7 text-red-500 hover:text-red-600 hover:bg-red-500/10 cursor-pointer"
              >
                Clear
              </Button>
            ) : (
              <div />
            )}
            <Button
              size="xs"
              onClick={handleSave}
              disabled={saving || !!errorMsg}
              className="text-[10px] h-7 cursor-pointer"
            >
              {saving ? <Loader2 className="size-3 animate-spin" /> : "Save"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const DashboardProjects = ({
  projects,
  isRightSidebarExpanded,
}: DashboardProjectsProps) => {
  const router = useRouter();
  const { open: isLeftSidebarOpen } = useSidebar();
  const updateShortcut = useMutation(api.project.updateProjectShortcut);
  const [filter, setFilter] = React.useState<"all" | "owned" | "joined">("all");

  // Use 3 columns when both sidebars are open to prevent cards from being too small
  const gridCols = isLeftSidebarOpen && isRightSidebarExpanded ? "grid-cols-3" : "grid-cols-4";


  const filteredProjects = React.useMemo(() => {
    if (!projects) return [];
    if (filter === "owned") {
      return projects.filter((p) => p.role === "owned");
    }
    if (filter === "joined") {
      return projects.filter((p) => p.role === "joined");
    }
    return projects;
  }, [projects, filter]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (!projects) return;

      for (const project of projects) {
        if (!project.shortcut) continue;

        const keys = project.shortcut.toLowerCase().split("+");
        const hasAlt = keys.includes("alt");
        const hasShift = keys.includes("shift");
        const hasCtrl = keys.includes("ctrl");
        const keyChar = keys[keys.length - 1];

        const matchAlt = e.altKey === hasAlt;
        const matchShift = e.shiftKey === hasShift;
        const matchCtrl = e.ctrlKey === hasCtrl;
        const matchKey = e.key.toLowerCase() === keyChar;

        if (matchAlt && matchShift && matchCtrl && matchKey) {
          e.preventDefault();
          toast.success(
            `Opening workspace for ${project.projectName} (${project.shortcut})`,
          );
          router.push(`/dashboard/my-projects/${project.slug}/workspace`);
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [projects, router]);

  return (
    <div className="space-y-5 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Projects Tab Header */}
      <div className="flex items-center justify-between pb-4">
        <div>
          <h2 className="text-lg tracking-tight text-foreground flex items-center gap-2">
            {filter === "all"
              ? "Your All Projects"
              : filter === "owned"
                ? "Your Created Projects"
                : "Your Joined Projects"}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your creations and team collaboration workspaces.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Dropdown for filtering */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-2 cursor-pointer select-none"
              >
                <span>
                  Show:{" "}
                  {filter === "all"
                    ? "All Projects"
                    : filter === "owned"
                      ? "My Projects"
                      : "Team Projects"}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px] z-50">
              <DropdownMenuItem
                onClick={() => setFilter("all")}
                className="text-xs cursor-pointer"
              >
                All Projects
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilter("owned")}
                className="text-xs cursor-pointer"
              >
                My Projects
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilter("joined")}
                className="text-xs cursor-pointer"
              >
                Team Projects
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <CreateProjectDialog
            trigger={
              <Button
                id="create-project-btn"
                size="sm"
                className="h-8 text-xs gap-1.5 cursor-pointer shadow-xs hover:shadow-md transition-all duration-200"
              >
                <Plus className="h-3.5 w-3.5" /> Create Project
              </Button>
            }
          />
        </div>
      </div>

      {/* Projects Grid */}
      {projects === undefined ? (
        <div
          className={cn(
            "grid gap-4",
            isRightSidebarExpanded
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
          )}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-sidebar p-3 h-[250px] animate-pulse"
            >
              <div className="aspect-video w-full bg-muted/40 rounded-xl" />
              <div className="h-3.5 bg-muted/40 rounded w-3/4 mt-2" />
              <div className="h-2.5 bg-muted/20 rounded w-1/2" />
              <div className="mt-auto h-7 bg-muted/30 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-border border-dashed rounded-xl bg-muted/80 text-center h-[260px] transition-all">

          <Image
            src="/project.svg"
            alt="Empty"
            width={100}
            height={100}
            className="mb-2 opacity-80"
          />

          <h4 className="text-base mb-2 text-foreground tracking-tight">
            No Projects Found
          </h4>
          <p className="text-sm text-muted-foreground max-w-sm mt-1.5 leading-relaxed">
            {filter === "all"
              ? "Start a new workspace to collaborate, track stats, and manage tasks."
              : filter === "owned"
                ? "You haven't created any projects yet."
                : "You haven't joined any team projects yet."}
          </p>
          {filter === "owned" && (
            <CreateProjectDialog
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 h-8 text-xs gap-1.5 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Create First Project
                </Button>
              }
            />
          )}
        </div>
      ) : (
        <div className={cn("grid gap-3", gridCols)}>


          {filteredProjects.map((project) => (
            <div
              key={project._id}
              className="relative w-full aspect-[4/3.6] min-h-[225px] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-[#0c0c0e] overflow-hidden group transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-700/80 shadow-xs"
            >
              {/* Full-size Cover Thumbnail or Fallback */}
              <div className="absolute inset-0 w-full h-full overflow-hidden">
                {project.thumbnailUrl ? (
                  <img
                    src={project.thumbnailUrl}
                    alt={project.projectName}
                    className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500 ease-out"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-900/40 dark:bg-[#0c0c0f] flex justify-center pt-5">
                    <Layers3 className="size-10 text-zinc-700 dark:text-zinc-650" />
                  </div>
                )}
              </div>

              {/* Folder-like Flap SVG Background */}
              <svg
                viewBox="0 0 100 100"
                className="absolute bottom-0 left-0 w-full h-[70%] filter drop-shadow-[0_-4px_12px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_-4px_12px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover:scale-[1.01]"
                preserveAspectRatio="none"
              >
                <path
                  className="fill-white dark:fill-[#131317] stroke-black/5 dark:stroke-white/5"
                  strokeWidth="0.5"
                  d="M 0 100 L 0 12 Q 0 4, 8 4 L 56 4 C 64 4, 65 32, 73 32 L 94 32 Q 100 32, 100 38 L 100 100 Z"
                />
              </svg>



              {/* Folder Content Overlay */}
              <div className="absolute bottom-0 left-0 w-full h-[70%] z-10 flex flex-col justify-between p-4.5 select-none text-left">
                {/* Top Section - inside folder tab */}
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>
                    {project.createdAt
                      ? formatRelativeTime(project.createdAt)
                      : "some time ago"}
                  </span>
                </div>

                {/* Middle Section - Pocket Top */}
                <div className="flex flex-col gap-1.5 flex-1 justify-center mt-3.5">
                  <div className="flex items-center gap-2">
                    <h3
                      className="text-sm font-bold capitalize text-foreground truncate tracking-tight hover:text-primary transition-colors cursor-pointer"
                      onClick={() =>
                        router.push(`/dashboard/my-projects/${project.slug}`)
                      }
                    >
                      {project.projectName}
                    </h3>
                    <span
                      className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded-full border backdrop-blur-md shrink-0 capitalize",
                        project.role === "owned"
                          ? "border-primary/20 bg-primary/10 text-primary font-medium"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      {project.role}
                    </span>

                    {/* ShortcutSelector replaces repo name here */}
                    <div className="ml-auto">
                      <ShortcutSelector
                        projectId={project._id}
                        currentShortcut={project.shortcut}
                        projects={projects}
                        onSave={async (shortcut) => {
                          try {
                            await updateShortcut({
                              // @ts-expect-error
                              projectId: project._id,
                              shortcut,
                            });
                            toast.success(
                              shortcut
                                ? `Shortcut updated to ${shortcut}`
                                : "Shortcut cleared",
                            );
                          } catch (err: any) {
                            toast.error(err.message || "Failed to update shortcut");
                            throw err;
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-1">
                    {/* Avatars Stack */}
                    {project.totalMembers > 0 ? (
                      <div className="flex -space-x-1.5">
                        {project.members?.slice(0, 3).map((member, i) => (
                          <div
                            key={i}
                            className="size-6.5 rounded-full border border-sidebar bg-accent overflow-hidden shadow-xs"
                            title={member.userName}
                          >
                            {member.userImage ? (
                              <img
                                src={member.userImage}
                                alt={member.userName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[8px] bg-primary/20 text-primary font-bold">
                                {member.userName.charAt(0)}
                              </div>
                            )}
                          </div>
                        ))}
                        {project.totalMembers > 3 && (
                          <div className="size-6.5 rounded-full border border-sidebar bg-accent flex items-center justify-center text-[8px] text-muted-foreground font-extrabold">
                            +{project.totalMembers - 3}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[9px] text-muted-foreground/60 font-medium">
                        0 members
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Section - Pocket Bottom */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/dashboard/my-projects/${project.slug}`)
                    }
                    className="h-7 text-xs border-accent!"
                  >
                    <Settings2 className="size-3" /> Edit
                  </Button>
                  <Button
                    id="workspace-link-btn"
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/dashboard/my-projects/${project.slug}/workspace`,
                      )
                    }
                    className="h-7 text-xs"
                  >
                    <ExternalLink className="size-3" /> Workspace
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
