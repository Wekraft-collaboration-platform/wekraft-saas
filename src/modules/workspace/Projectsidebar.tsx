"use client";

import Link from "next/link";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  CheckSquare,
  Clock,
  Activity,
  Settings,
  ArrowLeft,
  ChevronsUpDown,
  Github,
  ChevronLeft,
  ChevronRight,
  Store,
  Layers,
  PenTool,
  ClipboardList,
  AudioWaveform,
  PlaneTakeoff,
  SparklesIcon,
  Brain,
  Code2,
  Network,
  FileText,
  Bot,
  Link2,
  Mic,
  Code,
  Inbox,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const workspaceMenu = [
  {
    label: "Workspace",
    path: "workspace",
    icon: Layers,
  },
  {
    label: "Tasks",
    path: "workspace/tasks",
    icon: ClipboardList,
  },
  {
    label: "Time Logs",
    path: "workspace/time-logs",
    icon: AudioWaveform,
  },
  {
    label: "Teamspace",
    path: "workspace/teamspace",
    icon: PlaneTakeoff,
  },
  {
    label: "Activity feed",
    path: "workspace/activity",
    icon: Activity,
  },
  {
    label: "Heatmap",
    path: "workspace/heatmap",
    icon: Network,
  },
];

export default function ProjectSidebar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const params = useParams();
  const projectId = params.id as Id<"projects">;

  const user: Doc<"users"> | undefined | null = useQuery(
    api.user.getCurrentUser,
  );

  const project = useQuery(api.project.getProjectById, { projectId });

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (url: string) => {
    return pathname === url || pathname.startsWith(url + "/dashboard");
  };
  return (
    <Sidebar collapsible="icon" className="">
      {/* ───────── HEADER ───────── */}
      <SidebarHeader className="border-b ">
        <div className="flex items-center justify-between gap-4 px-3 py-2">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={30}
            height={30}
            className="cursor-pointer"
          />
          <h1 className="font-semibold text-xl truncate group-data-[collapsible=icon]:hidden">
            {project?.projectName}
          </h1>

          <Button size="icon-sm" variant={"ghost"} className="group-data-[collapsible=icon]:hidden">
            <ChevronsUpDown />
          </Button>
        </div>
        {/* SHOWING GITHUB CONNECTED ACCOUNT */}
        {user === undefined ? (
          <div className="flex items-center gap-4 my-1 mx-auto border px-6 py-2 bg-sidebar-accent/30 rounded-md w-full">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-col space-y-2 group-data-[collapsible=icon]:hidden">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 my-0.5 mx-auto border px-6 py-2 bg-sidebar-accent/30 rounded-md group-data-[collapsible=icon]:hidden">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>

            <div className="flex flex-col space-y-0.5 group-data-[collapsible=icon]:hidden">
              <h2 className="flex gap-2 text-sm items-center truncate">
                <Github className="h-4 w-4" /> {user?.githubUsername}
              </h2>
              <p className="text-xs text-muted-foreground ml-3">
                Account Synced
              </p>
            </div>
          </div>
        )}
      </SidebarHeader>

      {/* ───────── CONTENT ───────── */}
      <SidebarContent className="px-2 py-4">
        {/* INBOX */}
        <SidebarMenuButton
          asChild
          data-active={isActive("/dashboard/inbox")}
          className="group relative overflow-hidden"
        >
          <Button
            className="cursor-pointer text-xs"
            size="sm"
            variant={"outline"}
          >
            <Link
              href={`/dashboard/my-projects/${projectId}/inbox`}
              className="relative z-10 flex items-center gap-3 px-3 py-2 dark:data-[active=true]:text-white data-[active=true]:text-gray-700"
            >
              <Inbox className="h-5 w-5" />
              <span className="text-sm group-data-[collapsible=icon]:hidden">Inbox</span>
              <span
                className="
        pointer-events-none absolute inset-0 -z-10
        opacity-0 transition-opacity
        group-data-[active=true]:opacity-100
        bg-linear-to-l from-blue-600/80 dark:from-blue-600/50 via-blue-600/10  to-transparent
      "
              />
            </Link>
          </Button>
        </SidebarMenuButton>
        {/* =========AI ASSISTANT====== */}
        <Popover>
          <PopoverTrigger asChild>
            <SidebarMenuButton
              data-active={isActive("/dashboard/ai")}
              className="group relative overflow-hidden"
            >
              <div className="relative z-10 flex items-center gap-3 px-1 w-full text-sm text-primary">
                <Bot className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">AI Assistant</span>
                <ChevronRight className="h-4 w-4 ml-auto group-data-[collapsible=icon]:hidden" />

                <span
                  className="
              pointer-events-none absolute inset-0 -z-10
              opacity-0 transition-opacity
              group-data-[active=true]:opacity-100
              bg-gradient-to-r from-blue-600/20 via-blue-600/5 to-transparent
            "
                />
              </div>
            </SidebarMenuButton>
          </PopoverTrigger>

          <PopoverContent side="right" className="w-64 p-2">
            <div className="flex flex-col gap-1">
              <Link
                href="/dashboard/ai/notion"
                className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent"
              >
                <Link2 className="h-4 w-4" />
                Connect to Notion
              </Link>

              <Link
                href="/dashboard/ai/voice"
                className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent"
              >
                <Mic className="h-4 w-4" />
                Ask via Voice
              </Link>

              <Link
                href="/dashboard/ai/project"
                className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent"
              >
                <FileText className="h-4 w-4" />
                Get Project Details
              </Link>
            </div>
          </PopoverContent>
        </Popover>

        {/* MANAGE PROJECT */}
        <div className="flex items-center justify-center gap-2 my-2 group-data-[collapsible=icon]:hidden">
          <hr className="w-12 border border-accent" />
          <p className="text-sm text-center">Manage Project</p>
          <hr className="w-12 border border-accent" />
        </div>
        <SidebarMenu className="flex flex-col space-y-2 py-2 ">
          {workspaceMenu.map((item) => {
            const Icon = item.icon;
            const href = `/dashboard/my-projects/${projectId}/${item.path}`;

            return (
              <SidebarMenuButton
                key={item.path}
                asChild
                data-active={isActive(href)}
                className="group relative overflow-hidden"
              >
                <Link
                  href={href}
                  className="relative z-10 flex items-center gap-3 px-3 py-2 dark:data-[active=true]:text-white data-[active=true]:text-primary text-primary"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm group-data-[collapsible=icon]:hidden">{item.label}</span>

                  <span
                    className="
            pointer-events-none absolute inset-0 -z-10
            opacity-0 transition-opacity
            group-data-[active=true]:opacity-100
            bg-linear-to-l from-blue-600/70 via-blue-600/10 to-transparent
          "
                  />
                </Link>
              </SidebarMenuButton>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* ───────── FOOTER ───────── */}
      <SidebarFooter className="border-t px-2 py-2 group-data-[collapsible=icon]:hidden"></SidebarFooter>
    </Sidebar>
  );
}
