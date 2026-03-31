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
  Network,
  Inbox,
  MessageCircleQuestionMark,
  Clover,
  Bot,
  Link2,
  FileText,
  Stars,
  Calendar,
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
import Image from "next/image";
import { Button } from "@/components/ui/button";

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
    label: "Calendar",
    path: "workspace/calendar",
    icon: Calendar,
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
  const slug = params.slug as string;

  const user: Doc<"users"> | undefined | null = useQuery(
    api.user.getCurrentUser,
  );

  const project = useQuery(api.project.getProjectBySlug, { slug });

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

          <Button
            size="icon-sm"
            variant={"ghost"}
            className="group-data-[collapsible=icon]:hidden"
          >
            <ChevronsUpDown />
          </Button>
        </div>
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
              href={`/dashboard/my-projects/${slug}/inbox`}
              className="relative z-10 flex items-center gap-3 px-3 py-2 dark:data-[active=true]:text-white data-[active=true]:text-gray-700"
            >
              <Inbox className="h-5 w-5" />
              <span className="text-sm group-data-[collapsible=icon]:hidden">
                Inbox
              </span>
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
        {/* MANAGE PROJECT */}
        <div className="flex items-center justify-center gap-2 mt-2 group-data-[collapsible=icon]:hidden">
          <hr className="w-12 border border-accent" />
          <p className="text-sm text-center">Manage Project</p>
          <hr className="w-12 border border-accent" />
        </div>
        <SidebarMenu className="flex flex-col space-y-1 py-1.5 ">
          {workspaceMenu.map((item) => {
            const Icon = item.icon;
            const href = `/dashboard/my-projects/${slug}/${item.path}`;

            return (
              <SidebarMenuButton
                key={item.path}
                asChild
                data-active={isActive(href)}
                className="group relative overflow-hidden"
              >
                <Link
                  href={href}
                  className="relative z-10 flex items-center gap-3 px-2 py-2 dark:data-[active=true]:text-white data-[active=true]:text-primary text-primary"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm group-data-[collapsible=icon]:hidden">
                    {item.label}
                  </span>

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
      <SidebarFooter className="border-t border-accent px-2 group-data-[collapsible=icon]:hidden">
          {/* =========AI ASSISTANT====== */}
        {/* <Popover>
          <PopoverTrigger asChild>
            <SidebarMenuButton
              data-active={isActive("/dashboard/ai")}
              className="group relative overflow-hidden"
            >
              <div className="relative z-10 flex items-center gap-3 px-1 w-full text-sm text-primary">
                <Stars className="h-4.5 w-4.5" />
                <span className="group-data-[collapsible=icon]:hidden">
                  AI Assistant
                </span>
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
                href="/dashboard/ai/project"
                className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent"
              >
                <FileText className="h-4 w-4" />
                Get Project Details
              </Link>
            </div>
          </PopoverContent>
        </Popover> */}

        {/* ==========Help========== */}
        {/* <SidebarMenuButton
          data-active={isActive("/dashboard/help")}
          className="group relative overflow-hidden"
        >
          <div className="relative z-10 flex items-center gap-3 px-1 w-full text-sm text-primary">
            <MessageCircleQuestionMark className="h-4 w-4" />
            <span className="group-data-[collapsible=icon]:hidden">
              Help
            </span>

            <span
              className="
              pointer-events-none absolute inset-0 -z-10
              opacity-0 transition-opacity
              group-data-[active=true]:opacity-100
              bg-gradient-to-r from-blue-600/20 via-blue-600/5 to-transparent
            "
            />
          </div>
        </SidebarMenuButton> */}

        {/* =======USER PLAN========= */}
        <div className="my-2 border p-3 rounded-md bg-linear-to-br from-card via-card to-blue-600/70">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-blue-600/20 flex items-center justify-center">
              <Clover className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-medium">Current Plan</h3>
              <p className="text-xs text-muted-foreground">Free</p>
            </div>
          </div>
           <p className="text-xs text-muted-foreground text-left my-1.5">Upgrade to Pro to unlock AI to boost productivity.</p>
           <Button className="text-[10px] cursor-pointer w-full my-1.5 font-medium" size='xs'>Upgrade to Pro</Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
