"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Id } from "../../../../../../../../convex/_generated/dataModel";
import { api } from "../../../../../../../../convex/_generated/api";
import { useQuery } from "convex/react";
import {
  UserPlus,
  Search,
  Filter,
  Plus,
  Layers3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreateTaskDialog } from "@/modules/workspace/CreateTaskDialog";
import { TABS } from "@/lib/static-store";
import { ListTab, Task } from "@/modules/workspace/ListTab";



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
  
  const tasks = useQuery(api.workspace.getTasks, { 
    projectId: project?._id as Id<"projects"> 
  });

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
        <Layers3 className="w-6 h-6 ml-1 text-primary inline" />  {projectName} 
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
      <div className="mt-6">
        {activeTab === "List" && <ListTab tasks={tasks || []} />}
      </div>
    </div>
  );
};



export default TaskPage;
