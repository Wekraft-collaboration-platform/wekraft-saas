"use client";

import { useMutation, useQuery } from "convex/react";
import {
  Filter,
  Layers3,
  LucideLoader2,
  Plus,
  Search,
  Sparkle,
  Sparkles,
  Trash2,
  UserPlus,
  BriefcaseBusiness,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { startTransition, useEffect, useState, ViewTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TABS } from "@/lib/static-store";
import { InviteDialog } from "@/modules/project/inviteDilogag";
import { CreateTaskDialog } from "@/modules/workspace/CreateTaskDialog";
import { FeatureTutorialDialog } from "@/modules/workspace/FeatureTutorialDialog";
import {
  applyTaskFilters,
  type SortConfig,
} from "@/modules/workspace/function/taskFilters";
import { KanbanTask } from "@/modules/workspace/KanbanTask";
import { ListTab } from "@/modules/workspace/ListTab";
import { TableTab } from "@/modules/workspace/TableTab";
import { useKayaStore } from "@/store/useKayaStore";
import { useMyWorkStore } from "@/store/useMyWorkStore";
import { api } from "../../../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../../../convex/_generated/dataModel";

const TaskPage = () => {
  const params = useParams();
  const slug = params.slug as string;

  const [activeTab, setActiveTab] = useState("List");
  const [taskLimit, setTaskLimit] = useState(10);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Id<"tasks">[]>([]);
  const { setIsOpen } = useKayaStore();
  const { setIsOpen: setIsWorkOpen, setActiveTab: setWorkActiveTab } = useMyWorkStore();
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [showTaskTour, setShowTaskTour] = useState(false);
  const router = useRouter();

  const currentUser = useQuery(api.user.getCurrentUser);
  const project = useQuery(api.project.getProjectBySlug, { slug });
  const projectName = project?.projectName;
  const projectInviteLink = project?.inviteLink;

  // Load persistent task limit from sessionStorage once project loaded
  useEffect(() => {
    if (typeof window !== "undefined" && project?._id) {
      const saved = sessionStorage.getItem(`taskLimit_${project._id}`);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > 0) {
          setTaskLimit(parsed);
        }
      }
    }
  }, [project?._id]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("tour") === "create-task") {
        const timer = setTimeout(() => {
          // Ensure page is at the top so the header and button are visible
          window.scrollTo({ top: 0, behavior: "instant" });
          const btn = document.getElementById("create-task-btn");
          if (btn) {
            btn.scrollIntoView({ behavior: "instant", block: "center" });
          }
          setShowTaskTour(true);
        }, 400);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleIncreaseLimit = () => {
    setTaskLimit((prev) => {
      const nextLimit = prev + 10;
      if (project?._id) {
        sessionStorage.setItem(`taskLimit_${project._id}`, String(nextLimit));
      }
      return nextLimit;
    });
  };

  const tasks = useQuery(
    api.workspace.getTasks,
    project?._id
      ? { projectId: project._id as Id<"projects">, limit: taskLimit }
      : "skip",
  );

  const members = useQuery(
    api.project.getProjectMembers,
    project?._id ? { projectId: project._id as Id<"projects"> } : "skip",
  );

  const projectDetails = useQuery(
    api.projectDetails.getProjectDetails,
    project?._id ? { projectId: project._id as Id<"projects"> } : "skip",
  );

  const isOwner = currentUser?._id === project?.ownerId;
  const userMember = members?.find((m) => m.userId === currentUser?._id);
  const isAdmin = userMember?.AccessRole === "admin";
  const isViewer = userMember?.AccessRole === "viewer";

  const canCreate =
    !isViewer && (isOwner || isAdmin || projectDetails?.memberCanCreate !== false);
  const canDelete = !isViewer && (isOwner || isAdmin);

  const deleteTasks = useMutation(api.workspace.deleteTasks);

  const handleDeleteTasks = async () => {
    try {
      await deleteTasks({ taskIds: selectedTaskIds });
      toast.success(`${selectedTaskIds.length} tasks deleted successfully`);
      setSelectedTaskIds([]);
    } catch (error) {
      toast.error("Failed to delete tasks");
    }
  };

  const hasMoreTasks = tasks && tasks.length >= taskLimit;

  const filteredTasks = applyTaskFilters(tasks || [], sortConfig, tagFilter);

  if (
    project === undefined ||
    project === null ||
    currentUser === undefined ||
    projectDetails === undefined
  )
    return (
      <div className="h-screen w-full flex items-center justify-center gap-2 text-sm font-medium">
        <LucideLoader2 className="animate-spin text-primary w-5 h-5" />
        Loading Workspace...
      </div>
    );

  return (
    <div className="w-full h-full p-6 2xl:p-8 relative">
      {/* ── One-time tutorial dialog ─────────────────── */}
      <FeatureTutorialDialog feature="task" />
      {showTaskTour && (
        <div
          className="fixed inset-0 z-[100] pointer-events-none"
          onClick={() => setShowTaskTour(false)}
        >
          <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] pointer-events-auto" onClick={() => setShowTaskTour(false)} />
          <CreateTaskTourTooltip
            targetId="create-task-btn"
            onDismiss={() => setShowTaskTour(false)}
            onNext={() => {
              setShowTaskTour(false);
              router.push("/dashboard?tour=resume&resumeAfter=4");
            }}
            onCreate={() => {
              setShowTaskTour(false);
              document.getElementById("create-task-btn")?.click();
            }}
          />
        </div>
      )}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          <Layers3 className="w-6 h-6 ml-1 text-primary inline" /> {projectName}
        </h1>

        <div className="flex items-center gap-5">
          {/* Avatar Stack */}
          <div className="flex items-center">
            {members && members.length > 0 ? (
              <div className="flex -space-x-3 mr-2">
                <TooltipProvider>
                  {members.slice(0, 6).map((member, i) => (
                    <Tooltip key={member.userId}>
                      <TooltipTrigger asChild>
                        <Avatar className="w-8 h-8 border-2 border-background hover:z-10 transition cursor-pointer">
                          <AvatarImage src={member.userImage} />
                          <AvatarFallback className="bg-neutral-800 text-[10px]">
                            {member.userName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="px-2 py-1">
                        <p className="text-[10px] font-medium">
                          {member.userName}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>

                {members.length > 6 && (
                  <div className="w-8 h-8 rounded-full border-2 border-background bg-neutral-900 flex items-center justify-center text-[10px] font-bold text-muted-foreground z-20">
                    +{members.length - 6}
                  </div>
                )}
              </div>
            ) : members && members.length === 0 ? (
              <div className="w-24 h-8 rounded-full border-2 border-dashed border-neutral-800 mr-2 flex items-center justify-center">
                <span className="text-[10px] text-muted-foreground">
                  No members
                </span>
              </div>
            ) : (
              <div className="flex -space-x-3 mr-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-background bg-neutral-800 animate-pulse"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Invite Button */}
          <InviteDialog
            inviteLink={projectInviteLink}
            projectName={projectName}
            trigger={
              <Button
                className="text-xs cursor-pointer px-4 bg-blue-600 text-white hover:bg-blue-700"
                size="sm"
              >
                <UserPlus className="w-5 h-5 mr-1" />
                Invite
              </Button>
            }
          />
        </div>
      </header>

      {/*  TOP HEADING. */}
      <div className="flex items-center justify-between border-b mt-6 pb-2 gap-4 sm:gap-0">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <Button
                key={tab.id}
                variant={isActive ? "ghost" : "ghost"}
                onClick={() => {
                  startTransition(() => {
                    setActiveTab(tab.id);
                  });
                }}
                className={`flex items-center gap-2 transition pb-2 -mb-px text-base ${isActive
                  ? "text-foreground border-b-2 border-b-primary! rounded-none rounded-t-md"
                  : "hover:text-foreground border-b-2 border-transparent"
                  }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {/* <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search ..."
              className="pl-9 h-9 w-[240px] border-border dark:bg-neutral-900! bg-card"
            />
          </div> */}
          {/* Delete Button (Visible when tasks are selected) */}
          {selectedTaskIds.length > 0 && (
            <AlertDialog>
              {canDelete ? (
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="text-xs animate-in fade-in zoom-in duration-200"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete {selectedTaskIds.length} Tasks
                  </Button>
                </AlertDialogTrigger>
              ) : (
                <Button
                  variant="destructive"
                  size="sm"
                  disabled
                  className="text-xs animate-in fade-in zoom-in duration-200 opacity-50 cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete {selectedTaskIds.length} Tasks
                </Button>
              )}
              <AlertDialogContent className="bg-neutral-900 border-neutral-800 shadow-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-primary">
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    This action cannot be undone. This will permanently delete{" "}
                    <span className="text-primary font-semibold">
                      {selectedTaskIds.length}
                    </span>{" "}
                    tasks and remove all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-neutral-800 border-neutral-700 text-primary hover:bg-neutral-700">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteTasks}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete Permanently
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button
            size="sm"
            variant={"outline"}
            onClick={() => setIsOpen(true)}
            className="bg-linear-to-t from-indigo-600/30 via-purple-600/10 to-transparent text-xs cursor-pointer px-6!"
          >
            <Image src="/kaya.svg" alt="Kaya AI" width={18} height={18} />
            Automate Tasks
          </Button>

          <Button
            size="sm"
            variant="default"
            onClick={() => {
              setWorkActiveTab("tasks");
              setIsWorkOpen(true);
            }}
            className="text-xs cursor-pointer gap-1.5"
          >
            <BriefcaseBusiness className="w-4 h-4" />
            View Your tasks
          </Button>
          <CreateTaskDialog
            projectName={projectName || "Project"}
            projectId={project._id}
            repoFullName={project.repoFullName}
            ownerClerkId={(project as any).ownerClerkId}
            trigger={
              canCreate ? (
                <Button id="create-task-btn" size="sm" className="text-xs">
                  <Plus className="w-5 h-5 mr-2" />
                  New Task
                </Button>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-not-allowed">
                        <Button size="sm" className="text-xs" disabled>
                          <Plus className="w-5 h-5 mr-2" />
                          New Task
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Task creation is restricted.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            }
          />
        </div>
      </div>

      {/* BODY PART */}
      <div className="mt-6 max-w-full">
        <ViewTransition key={activeTab} name="tab-content">
          <>
            {activeTab === "List" && (
              <ListTab
                tasks={filteredTasks}
                allTasks={tasks || []}
                selectedTaskIds={selectedTaskIds}
                setSelectedTaskIds={setSelectedTaskIds}
                projectId={project._id}
                projectName={projectName || "Project"}
                repoFullName={project.repoFullName}
                ownerClerkId={(project as any).ownerClerkId}
                sortConfig={sortConfig}
                setSortConfig={setSortConfig}
                tagFilter={tagFilter}
                setTagFilter={setTagFilter}
                canDelete={canDelete}
                hasMoreTasks={!!hasMoreTasks}
                onLoadMore={handleIncreaseLimit}
              />
            )}
            {activeTab === "Table" && (
              <TableTab
                tasks={filteredTasks}
                allTasks={tasks || []}
                onLoadMore={handleIncreaseLimit}
                hasMore={!!hasMoreTasks}
                selectedTaskIds={selectedTaskIds}
                setSelectedTaskIds={setSelectedTaskIds}
                sortConfig={sortConfig}
                setSortConfig={setSortConfig}
                tagFilter={tagFilter}
                setTagFilter={setTagFilter}
                projectId={project._id}
                projectName={projectName || "Project"}
                repoFullName={project.repoFullName}
                ownerClerkId={(project as any).ownerClerkId}
                canDelete={canDelete}
              />
            )}
            {activeTab === "Kanban" && (
              <div className="w-full">
                <KanbanTask
                  tasks={tasks || []}
                  projectId={project._id as Id<"projects">}
                  taskLimit={taskLimit}
                  isViewer={isViewer}
                />
              </div>
            )}
          </>
        </ViewTransition>

        {/* Load More — only for List & Kanban */}
        {activeTab !== "Table" && hasMoreTasks && (
          <div className="flex justify-center mt-8 pb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handleIncreaseLimit}
              className="rounded-full px-8 text-xs"
            >
              Load More
            </Button>
          </div>
        )}
        {activeTab !== "Table" &&
          tasks &&
          tasks.length > 0 &&
          !hasMoreTasks && (
            <p className="text-center mt-8 pb-6 text-xs text-muted-foreground italic">
              No more tasks to load.
            </p>
          )}
      </div>
    </div>
  );
};

export default TaskPage;

function CreateTaskTourTooltip({
  targetId,
  onDismiss,
  onNext,
  onCreate,
}: {
  targetId: string;
  onDismiss: () => void;
  onNext: () => void;
  onCreate: () => void;
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
    window.addEventListener("resize", calculate);
    window.addEventListener("scroll", calculate, true);
    return () => {
      window.removeEventListener("resize", calculate);
      window.removeEventListener("scroll", calculate, true);
    };
  }, [targetId]);

  if (!pos) return null;

  return (
    <div
      className="fixed z-[100] pointer-events-auto animate-in fade-in duration-200 flex flex-col items-center"
      style={{ top: pos.top, left: pos.left, width: 320 }}
      onClick={(e) => e.stopPropagation()}
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
        <div className="bg-linear-to-br from-neutral-800 to-neutral-950 text-card-foreground border border-border shadow-2xl rounded-lg p-5">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full shrink-0">
              4
            </span>
            <h3 className="text-sm font-semibold text-foreground">Create your first task</h3>
          </div>

          <div className="h-px w-full bg-accent my-3" />

          <p className="text-xs text-muted-foreground leading-relaxed">
            Click the &quot;New Task&quot; button above to create a task, assign it to a teammate, set priorities, and track progress.
          </p>
        </div>

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
              onClick={onCreate}
              className="h-8 text-xs px-4"
            >
              Create Task
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
