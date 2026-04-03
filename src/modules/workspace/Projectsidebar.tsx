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
  SidebarMenuAction,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

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
  Bug,
  FastForward,
  Home,
  LayoutGrid,
  Plus,
  VectorSquare,
  ListTree,
  Trash2,
  User2,
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

const collapsibleItems = [
  {
    label: "Tasks",
    path: "workspace/tasks",
    icon: ClipboardList,
  },
  {
    label: "Issues",
    path: "workspace/issues",
    icon: Bug,
  },
  {
    label: "Sprint",
    path: "workspace/sprint",
    icon: FastForward,
  },
  {
    label: "Time Logs",
    path: "workspace/time-logs",
    icon: AudioWaveform,
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
    return pathname === url || pathname.startsWith(url + "/");
  };

  const isActiveExact = (url: string) => {
    return pathname === url;
  };
  return (
    <Sidebar collapsible="icon" className="">
      {/* ───────── HEADER ───────── */}
      <SidebarHeader className="border-b ">
        <div className="flex items-center justify-between gap-4 px-3 py-2!">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={28}
            height={28}
            className="cursor-pointer"
          />
          <h1 className="font-semibold text-lg truncate group-data-[collapsible=icon]:hidden">
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
          data-active={isActive(`/dashboard/my-projects/${slug}/inbox`)}
          className="group relative overflow-hidden mb-1.5"
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

        <SidebarMenu>
          {/* =========AI ASSISTANT====== */}
          <SidebarMenuItem>
            <Popover>
              <PopoverTrigger asChild>
                <SidebarMenuButton
                  data-active={isActiveExact("/dashboard/ai")}
                  className="group relative overflow-hidden"
                >
                  <div className="relative z-10 flex items-center gap-3 px-1 w-full text-sm">
                    <Stars className={cn(
                      "h-4.5 w-4.5 transition-colors",
                      isActiveExact("/dashboard/ai") ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )} />
                    <span className={cn(
                      "group-data-[collapsible=icon]:hidden transition-colors",
                      isActiveExact("/dashboard/ai") ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground"
                    )}>
                      AI Assistant
                    </span>
                    <ChevronRight className="h-4 w-4 ml-auto group-data-[collapsible=icon]:hidden text-muted-foreground" />

                    <span
                      className="
                  pointer-events-none absolute inset-0 -z-10
                  opacity-0 transition-opacity
                  group-data-[active=true]:opacity-100
                  bg-linear-to-l from-blue-600 dark:from-blue-600/70 via-blue-600/20 to-transparent!
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
            </Popover>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* MANAGE PROJECT */}
        <div className="flex items-center justify-center gap-2 mt-2 group-data-[collapsible=icon]:hidden">
          <hr className="w-12 border border-accent" />
          <p className="text-sm text-center">Manage Project</p>
          <hr className="w-12 border border-accent" />
        </div>

        <SidebarMenu className="flex flex-col space-y-1.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              data-active={isActiveExact(`/dashboard/my-projects/${slug}/workspace`)}
              className="group relative overflow-hidden"
            >
              <Link
                href={`/dashboard/my-projects/${slug}/workspace`}
                className="relative z-10 flex items-center gap-3 px-3 py-2"
              >
                <Layers className={cn(
                  "h-5 w-5 transition-colors",
                  isActiveExact(`/dashboard/my-projects/${slug}/workspace`) ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                )} />
                <span className={cn(
                  "text-sm font-medium transition-colors",
                  isActiveExact(`/dashboard/my-projects/${slug}/workspace`) ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}>Workspace</span>
                <span
                  className="
            pointer-events-none absolute inset-0 -z-10
            opacity-0 transition-opacity
            group-data-[active=true]:opacity-100
            bg-linear-to-l from-blue-600 dark:from-blue-600/70 via-blue-600/20 to-transparent!
          "
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu className="flex flex-col space-y-1.5">
          {/*  PROJECT MANAGE COLLAPSIBLE */}
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip="Workspace"
                  className="group relative overflow-hidden group-data-[collapsible=icon]:bg-transparent!"
                >
                  <div className="relative z-10 flex items-center gap-3 w-full">
                    <ListTree className="h-5 w-5" />
                    <span className="text-sm font-medium">Manage</span>
                    <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </div>
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub className="border-l border-dashed border-accent ml-[21px] pl-3 gap-1.5">
                  {collapsibleItems.map((item) => {
                    const href = `/dashboard/my-projects/${slug}/${item.path}`;
                    const active = isActive(href);
                    return (
                      <SidebarMenuSubItem key={item.path}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={active}
                          className="group relative h-8 overflow-hidden"
                        >
                          <Link
                            href={href}
                            className="relative z-10 flex items-center w-full gap-2.5"
                          >
                            <item.icon
                              className={cn(
                                "h-4 w-4 shrink-0 transition-colors",
                                active
                                  ? "text-foreground"
                                  : "text-muted-foreground!",
                              )}
                            />
                            <span
                              className={cn(
                                "text-sm transition-colors",
                                active
                                  ? " text-foreground"
                                  : "text-muted-foreground hover:text-foreground",
                              )}
                            >
                              {item.label}
                            </span>

                            <span
                              className="
                      pointer-events-none absolute inset-y-0 right-0 left-[-13px] -z-10
                      opacity-0 transition-opacity
                      group-data-[active=true]:opacity-100
                      bg-linear-to-l from-blue-600 dark:from-blue-600/70 via-blue-600/20 to-transparent!
                    "
                            />
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    );
                  })}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>

          {/* OTHER ITEMS */}
          {workspaceMenu.map((item) => {
            const Icon = item.icon;
            const href = `/dashboard/my-projects/${slug}/${item.path}`;

            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  key={item.path}
                  asChild
                  data-active={isActive(href)}
                  className="group relative overflow-hidden"
                >
                  <Link
                    href={href}
                    className="relative z-10 flex items-center gap-3 px-2 py-2"
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-colors",
                        isActive(href)
                          ? "text-foreground"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm group-data-[collapsible=icon]:hidden transition-colors",
                        isActive(href)
                          ? "text-foreground font-medium"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </span>

                    <span
                      className="
              pointer-events-none absolute inset-0 -z-10
              opacity-0 transition-opacity
              group-data-[active=true]:opacity-100
              bg-linear-to-l from-blue-600 dark:from-blue-600/70 via-blue-600/20 to-transparent!
            "
                    />
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}

          <SidebarSeparator className="my-2" />
          
          {/* HELP & SUPPORT */}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="group relative overflow-hidden"
            >
              <Link
                href={`/dashboard/my-projects/${slug}/help`}
                className="relative z-10 flex items-center gap-3 px-2 py-2"
              >
                <MessageCircleQuestionMark className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
                <span className="text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                  Help and Support
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* DELETE */}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="group relative overflow-hidden"
            >
              <Link
                href={`/dashboard/my-projects/${slug}/settings/delete`}
                className="relative z-10 flex items-center gap-3 px-2 py-2"
              >
                <Trash2 className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                <span className="text-sm text-muted-foreground transition-colors group-hover:text-primary">
                  Delete Project
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

       
        </SidebarMenu>
      </SidebarContent>

      {/* ───────── FOOTER ───────── */}
      <SidebarFooter className="border-t border-accent px-2 group-data-[collapsible=icon]:hidden">
       
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
          <p className="text-xs text-muted-foreground text-left my-1.5">
            Upgrade to Pro to unlock AI to boost productivity.
          </p>
          <Button
            className="text-[10px] cursor-pointer w-full my-1.5 font-medium"
            size="xs"
          >
            Upgrade to Pro
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
