"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Id } from "../../../../../../../../convex/_generated/dataModel";
import { api } from "../../../../../../../../convex/_generated/api";
import { useQuery } from "convex/react";
import {
  Layers2,
  UserPlus,
  Search,
  Filter,
  Plus,
  ChevronDown,
  MoreHorizontal,
  Layout,
  Smartphone,
  Server,
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  AlertCircle,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreateTaskDialog } from "@/modules/workspace/CreateTaskDialog";
import { TABS } from "@/lib/static-store";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string;
  estimation: string;
  type: string;
  assignedTo: { name: string; img: string }[];
  priority: string;
  status: string;
}

const users = [
  { name: "Ritesh", img: "https://i.pravatar.cc/40?img=1" },
  { name: "Mia", img: "https://i.pravatar.cc/40?img=2" },
  { name: "Alex", img: "https://i.pravatar.cc/40?img=3" },
  { name: "John", img: "https://i.pravatar.cc/40?img=4" },
];

const mockTasks: Task[] = [];

const TaskPage = () => {
  const params = useParams();
  const slug = params.slug as string;

  const [activeTab, setActiveTab] = useState("List");

  const currentUser = useQuery(api.user.getCurrentUser);
  const project = useQuery(api.project.getProjectBySlug, { slug });
  const projectName = project?.projectName;
  const repoId = project?.repositoryId;

  if (project === undefined || project === null)
    return (
      <div className="h-screen w-full flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="p-6 min-h-screen w-full">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">
          {projectName} <Layers2 className="w-6 h-6 ml-1 text-primary inline" />
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

      <div className="flex items-center justify-between border-b mt-6 pb-2 gap-4 sm:gap-0">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <Button
                key={tab.id}
                variant={isActive ? "ghost" : "ghost"}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 transition pb-2 -mb-px ${
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
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="w-5 h-5 mr-2" />
            Filter
          </Button>
          <CreateTaskDialog
            projectName={projectName || "Project"}
            projectId={project._id}
            repoFullName={project.repoFullName}
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
      <div className="mt-8">
        {activeTab === "List" ? (
          <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
            <TaskGroup
              title="To-do"
              status="not started"
              tasks={mockTasks.filter((t) => t.status === "not started")}
              accentColor="bg-slate-400"
            />
            <TaskGroup
              title="On Progress"
              status="inprogress"
              tasks={mockTasks.filter((t) => t.status === "inprogress")}
              accentColor="bg-blue-500"
            />
            <TaskGroup
              title="Reviewing"
              status="reviewing"
              tasks={mockTasks.filter((t) => t.status === "reviewing")}
              accentColor="bg-amber-500"
            />
            <TaskGroup
              title="Testing"
              status="testing"
              tasks={mockTasks.filter((t) => t.status === "testing")}
              accentColor="bg-purple-500"
            />
            <TaskGroup
              title="Completed"
              status="completed"
              tasks={mockTasks.filter((t) => t.status === "completed")}
              accentColor="bg-emerald-500"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-3xl bg-muted/30">
            <div className="p-4 rounded-2xl bg-muted mb-4">
              <Layout className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">
              {activeTab} view is coming soon
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const TaskGroup = ({
  title,
  tasks,
  accentColor,
}: {
  title: string;
  status: string;
  tasks: Task[];
  accentColor: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="group/container">
      {/* Group Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div
          className="flex items-center gap-3 cursor-pointer bg-accent/30 py-1.5 rounded-md px-3 w-full select-none"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <ChevronDown
            className={cn(
              "w-4 h-4 text-muted-foreground bg-muted rounded transition-transform duration-200",
              !isExpanded && "-rotate-90"
            )}
          />
          <div className={cn("w-1 h-5 rounded-full", accentColor)} />
          <h2 className="text-sm font-bold tracking-tight flex items-center gap-2">
            {title}
            <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {tasks.length}
            </span>
          </h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-xl opacity-0 group-hover/container:opacity-100 transition-all hover:bg-primary/10 hover:text-primary"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {isExpanded && (
        <div className="overflow-hidden border rounded-2xl bg-background shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-muted/50">
                <th className="py-3 px-4 w-[50px]">
                  <Checkbox className="rounded-md border-muted-foreground/30 data-[state=checked]:bg-primary" />
                </th>
                <th className="py-3 px-1 w-[40px]"></th>
                <th className="py-3 px-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest min-w-[200px]">
                  Task Name
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest min-w-[250px]">
                  Description
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest w-[180px]">
                  Estimation
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest w-[140px]">
                  Type
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest w-[120px]">
                  Assigned
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest w-[140px]">
                  Priority
                </th>
                <th className="py-3 px-4 w-[50px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted/30">
              {tasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center text-sm text-muted-foreground italic"
                  >
                    No tasks found in this section
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="group border-none hover:bg-muted/40 transition-all duration-200"
                  >
                    <td className="py-4 px-4 whitespace-nowrap">
                      <Checkbox className="rounded-md border-muted-foreground/30 data-[state=checked]:bg-primary" />
                    </td>
                    <td className="py-4 px-1 whitespace-nowrap">
                      <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center">
                        <TaskIcon type={task.type} />
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-semibold text-foreground/90">
                        {task.title}
                      </span>
                    </td>
                    <td className="py-4 px-4 overflow-hidden">
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {task.description}
                      </p>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        {task.estimation}
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <Badge
                        variant="secondary"
                        className="font-medium text-[10px] px-2 py-0.5 rounded-lg bg-opacity-20"
                        style={{
                          backgroundColor: getTypeColors(task.type).bg,
                          color: getTypeColors(task.type).text,
                        }}
                      >
                        {task.type}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex -space-x-2">
                        {task.assignedTo.map((person, i) => (
                          <Avatar
                            key={i}
                            className="w-7 h-7 border-2 border-background shadow-sm hover:z-10 transition-transform hover:scale-110"
                          >
                            <AvatarImage src={person.img} />
                            <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                              {person.name[0]}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-muted/50">
                          <DropdownMenuItem className="gap-2 focus:bg-primary/5 cursor-pointer">
                            <Plus className="w-4 h-4" /> Add Subtask
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 focus:bg-primary/5 cursor-pointer">
                            <Layout className="w-4 h-4" /> Move to Sprint
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-rose-600 focus:text-rose-600 focus:bg-rose-50 cursor-pointer">
                            <AlertCircle className="w-4 h-4" /> Delete Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const TaskIcon = ({ type }: { type: string }) => {
  const iconClass = "w-4 h-4 text-primary";
  switch (type.toLowerCase()) {
    case "dashboard":
      return <Layout className={iconClass} />;
    case "mobile app":
      return <Smartphone className={iconClass} />;
    case "backend":
      return <Server className={iconClass} />;
    case "testing":
      return <AlertCircle className={iconClass} />;
    default:
      return <Layers2 className={iconClass} />;
  }
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  let config = {
    bg: "bg-blue-500/10",
    text: "text-blue-600",
    dot: "bg-blue-500",
  };

  if (priority === "high") {
    config = {
      bg: "bg-rose-500/10",
      text: "text-rose-600",
      dot: "bg-rose-500",
    };
  } else if (priority === "medium") {
    config = {
      bg: "bg-amber-500/10",
      text: "text-amber-600",
      dot: "bg-amber-500",
    };
  } else if (priority === "low") {
    config = {
      bg: "bg-emerald-500/10",
      text: "text-emerald-600",
      dot: "bg-emerald-500",
    };
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2.5 py-1 rounded-full w-fit border border-transparent",
        config.bg
      )}
    >
      <div className={cn("w-1.5 h-1.5 rounded-full shadow-sm", config.dot)} />
      <span className={cn("text-[10px] font-bold uppercase", config.text)}>
        {priority}
      </span>
    </div>
  );
};

const getTypeColors = (type: string) => {
  switch (type.toLowerCase()) {
    case "dashboard":
      return { bg: "#f3e8ff", text: "#7c3aed" }; // Purple
    case "mobile app":
      return { bg: "#ffedd5", text: "#ea580c" }; // Orange
    case "backend":
      return { bg: "#dcfce7", text: "#16a34a" }; // Green
    case "testing":
      return { bg: "#fee2e2", text: "#dc2626" }; // Red
    default:
      return { bg: "#f1f5f9", text: "#475569" }; // Slate
  }
};

export default TaskPage;
