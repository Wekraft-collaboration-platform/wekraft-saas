"use client";

import { useParams } from "next/navigation";
import { useState, startTransition, ViewTransition } from "react";
import { Id } from "../../../../../../../../convex/_generated/dataModel";
import { api } from "../../../../../../../../convex/_generated/api";
import { useQuery } from "convex/react";
import {
  UserPlus,
  Search,
  Filter,
  Plus,
  Layers3,
  Sparkle,
  Sparkles,
  Trash2,
  LucideLoader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreateTaskDialog } from "@/modules/workspace/CreateTaskDialog";
import { TABS } from "@/lib/static-store";
import { ListTab } from "@/modules/workspace/ListTab";
import { TableTab } from "@/modules/workspace/TableTab";
import { KanbanTask } from "@/modules/workspace/KanbanTask";
import Image from "next/image";
import { useKayaStore } from "@/store/useKayaStore";
import { useMutation } from "convex/react";
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
import { toast } from "sonner";
import { SortConfig, applyTaskFilters } from "@/modules/workspace/function/taskFilters";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { InviteDialog } from "@/modules/project/inviteDilogag";

const TaskPage = () => {
  const params = useParams();
  const slug = params.slug as string;

  const [activeTab, setActiveTab] = useState("List");
  const [taskLimit, setTaskLimit] = useState(10);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Id<"tasks">[]>([]);
  const { setIsOpen } = useKayaStore();
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  const currentUser = useQuery(api.user.getCurrentUser);
  const project = useQuery(api.project.getProjectBySlug, { slug });
  const projectName = project?.projectName;
  const projectInviteLink = project?.inviteLink;

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
  
  const canCreate = isOwner || isAdmin || projectDetails?.memberCanCreate !== false;

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
    <div className="w-full h-full p-6 2xl:p-8">
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
                className={`flex items-center gap-2 transition pb-2 -mb-px text-base ${
                  isActive
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
            Ask Kaya
          </Button>
          <CreateTaskDialog
            projectName={projectName || "Project"}
            projectId={project._id}
            repoFullName={project.repoFullName}
            ownerClerkId={(project as any).ownerClerkId}
            trigger={
              canCreate ? (
                <Button size="sm" className="text-xs">
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
              />
            )}
            {activeTab === "Table" && (
              <TableTab
                tasks={filteredTasks}
                allTasks={tasks || []}
                onLoadMore={() => setTaskLimit((p) => p + 10)}
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
              />
            )}
            {activeTab === "Kanban" && (
              <div className="w-full">
                <KanbanTask
                  tasks={tasks || []}
                  projectId={project._id as Id<"projects">}
                  taskLimit={taskLimit}
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
              onClick={() => setTaskLimit((prev) => prev + 10)}
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
