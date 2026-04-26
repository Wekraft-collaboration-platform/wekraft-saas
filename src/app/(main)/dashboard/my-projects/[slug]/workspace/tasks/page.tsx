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

const users = [
  { name: "Ritesh", img: "https://i.pravatar.cc/40?img=1" },
  { name: "Mia", img: "https://i.pravatar.cc/40?img=2" },
  { name: "Alex", img: "https://i.pravatar.cc/40?img=3" },
  { name: "John", img: "https://i.pravatar.cc/40?img=4" },
];

const TaskPage = () => {
  const params = useParams();
  const slug = params.slug as string;

  const [activeTab, setActiveTab] = useState("List");
  const [taskLimit, setTaskLimit] = useState(10);
  const { setIsOpen } = useKayaStore();

  const currentUser = useQuery(api.user.getCurrentUser);
  const project = useQuery(api.project.getProjectBySlug, { slug });
  const projectName = project?.projectName;

  const tasks = useQuery(
    api.workspace.getTasks,
    project?._id
      ? { projectId: project._id as Id<"projects">, limit: taskLimit }
      : "skip",
  );

  const hasMoreTasks = tasks && tasks.length >= taskLimit;

  if (project === undefined || project === null)
    return (
      <div className="h-screen w-full flex items-center justify-center">
        Loading...
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
          <div className="flex -space-x-3">
            {users.map((user, i) => (
              <Avatar
                key={i}
                className="w-8 h-8 border-2 border-background hover:z-10 transition"
              >
                <AvatarImage src={user.img} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
            ))}
          </div>

          {/* Invite Button */}
          <Button
            className="text-xs cursor-pointer px-4 bg-blue-600 text-white hover:bg-blue-700"
            size="sm"
          >
            <UserPlus className="w-5 h-5 mr-1" />
            Invite
          </Button>
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
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search ..."
              className="pl-9 h-9 w-[240px] border-muted"
            />
          </div>
          <Button variant="outline" size="sm" className="h-9 text-xs">
            <Filter className="w-5 h-5 mr-2" />
            Filter
          </Button>
          {/* AI button */}
          <Button
            size="sm"
            variant={"outline"}
            onClick={() => setIsOpen(true)}
            className="bg-linear-to-t from-indigo-600/30 via-purple-600/10 to-transparent text-xs cursor-pointer"
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
              <Button size="sm" className="text-xs">
                <Plus className="w-5 h-5 mr-2" />
                New Task
              </Button>
            }
          />
        </div>
      </div>

      {/* BODY PART */}
      <div className="mt-6 max-w-full">
        <ViewTransition key={activeTab} name="tab-content">
          <>
            {activeTab === "List" && <ListTab tasks={tasks || []} />}
            {activeTab === "Table" && (
              <TableTab
                tasks={tasks || []}
                onLoadMore={() => setTaskLimit((p) => p + 10)}
                hasMore={!!hasMoreTasks}
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
