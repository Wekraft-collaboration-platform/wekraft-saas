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
  ChevronsUpDown,
  ChevronRight,
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
  FolderEdit,
  MessageSquare,
  MessagesSquare,
  MessageCircleWarning,
  ContactRound,
  Users2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";

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
import { AiAssistantSheet } from "../ai/AiAssistantSheet";
import { Kbd } from "@/components/ui/kbd";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
    label: "Manage Team",
    path: "workspace/team",
    icon: Users2,
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
  const router = useRouter();
  const [assistantOpen, setAssistantOpen] = useState(false);

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
    <Sidebar collapsible="icon" className="border-r-0">
      {/* ───────── HEADER ───────── */}
      <SidebarHeader
        style={{ viewTransitionName: "site-header" }}
        className="h-18 justify-center flex-none border-b"
      >
        <div className="flex items-center justify-between gap-4 px-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={28}
              height={28}
              className="cursor-pointer"
            />
          </Link>

          <h1 className="font-semibold text-xl truncate group-data-[collapsible=icon]:hidden">
            {project?.projectName}
          </h1>

          <Button
            size="icon-xs"
            variant={"outline"}
            className="group-data-[collapsible=icon]:hidden"
          >
            <ChevronsUpDown />
          </Button>
        </div>
      </SidebarHeader>

      {/* ───────── CONTENT ───────── */}
      <SidebarContent className="px-2 py-5 group-data-[collapsible=icon]:px-0">
        <SidebarMenu className="mb-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Inbox"
              variant="outline"
              isActive={isActive(`/dashboard/my-projects/${slug}/inbox`)}
              className="group relative overflow-hidden cursor-pointer"
            >
              <Link
                href={`/dashboard/my-projects/${slug}/inbox`}
                className="relative z-10 flex items-center justify-center gap-3 w-full bg-secondary border border-primary/30 dark:data-[active=true]:text-white data-[active=true]:text-gray-700 group-data-[collapsible=icon]:justify-center"
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
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          {/* =========AI ASSISTANT====== */}
          <SidebarMenuItem>
            <Popover>
              <PopoverTrigger asChild>
                <SidebarMenuButton
                  asChild
                  tooltip="AI Assistant"
                  isActive={isActiveExact("/dashboard/ai")}
                  className="group relative overflow-hidden cursor-pointer"
                >
                  <div className="relative z-10 flex items-center gap-3 w-full text-sm group-data-[collapsible=icon]:justify-center">
                    <Image src="/kaya.svg" alt="Logo" width={24} height={24} />

                    <span
                      className={cn(
                        "group-data-[collapsible=icon]:hidden transition-colors",
                        isActiveExact("/dashboard/ai")
                          ? "text-foreground font-medium"
                          : "text-foreground",
                      )}
                    >
                      AI Assistant
                    </span>
                    <ChevronRight className="h-4 w-4 ml-auto group-data-[collapsible=icon]:hidden text-primary!" />

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

              <PopoverContent side="right" className="w-68 p-1">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between px-2 py-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Toggle AI Assistant
                    </span>
                    <div className="flex items-center gap-1 group">
                      <Kbd className="bg-muted/50 font-sans text-[10px] px-1.5 py-0">
                        Ctrl
                      </Kbd>
                      <span className="text-[10px] text-muted-foreground">
                        +
                      </span>
                      <Kbd className="bg-muted/50 font-sans text-[10px] px-1.5 py-0">
                        K
                      </Kbd>
                    </div>
                  </div>

                  <Separator className="mb-1" />

                  <div className="p-1 flex flex-col gap-0.5">
                    <Link
                      href={`/dashboard/my-projects/${slug}/workspace/ai`}
                      className="flex items-center justify-between gap-2 rounded-sm px-2 py-2 text-xs hover:bg-accent transition-colors group/item"
                    >
                      <div className="flex items-center gap-2">
                        <MessagesSquare className="h-4 w-4" />
                        <span>Open full Chatspace</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover/item:translate-x-0.5 transition-transform" />
                    </Link>
                    <p
                      onClick={() => setAssistantOpen(true)}
                      className="flex items-center justify-between gap-2 cursor-pointer rounded-sm px-2 py-2 text-xs hover:bg-accent transition-colors group/item"
                    >
                      <div className="flex items-center gap-2">
                        <MessageCircleWarning className="h-4 w-4 text-primary" />
                        <span>Ask AI assistant</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover/item:translate-x-0.5 transition-transform" />
                    </p>

                    <p className="flex items-center justify-between gap-2 cursor-pointer rounded-sm px-2 py-2 text-xs hover:bg-accent transition-colors group/item">
                      <div className="flex items-center gap-2">
                        <FolderEdit className="h-4 w-4" />
                        <span>Review bottlenecks</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover/item:translate-x-0.5 transition-transform" />
                    </p>
                  </div>
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
              tooltip="Workspace"
              isActive={isActiveExact(
                `/dashboard/my-projects/${slug}/workspace`,
              )}
              className="group relative overflow-hidden cursor-pointer"
            >
              <Link
                href={`/dashboard/my-projects/${slug}/workspace`}
                className="relative z-10 flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center"
              >
                <Layers
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActiveExact(`/dashboard/my-projects/${slug}/workspace`)
                      ? "text-foreground"
                      : "text-foreground",
                  )}
                />
                <span
                  className={cn(
                    "text-sm font-medium transition-colors group-data-[collapsible=icon]:hidden",
                    isActiveExact(`/dashboard/my-projects/${slug}/workspace`)
                      ? "text-foreground"
                      : "text-foreground",
                  )}
                >
                  Workspace
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
        </SidebarMenu>

        <SidebarMenu className="flex flex-col space-y-1.5">
          {/*  PROJECT MANAGE COLLAPSIBLE */}
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  asChild
                  tooltip="Manage Projects"
                  className="group relative overflow-hidden group-data-[collapsible=icon]:bg-transparent! cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/dashboard/my-projects/${slug}/workspace/tasks`,
                    )
                  }
                >
                  <Link
                    href={`/dashboard/my-projects/${slug}/workspace/tasks`}
                    className="relative z-10 flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center"
                  >
                    <ListTree className="h-5 w-5" />
                    <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">
                      Manage
                    </span>
                    <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                  </Link>
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
                  tooltip={item.label}
                  isActive={isActive(href)}
                  className="group relative overflow-hidden cursor-pointer"
                >
                  <Link
                    href={href}
                    className="relative z-10 flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center"
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-colors",
                        isActive(href) ? "text-foreground" : "text-foreground",
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm group-data-[collapsible=icon]:hidden transition-colors",
                        isActive(href)
                          ? "text-foreground font-medium"
                          : "text-foreground",
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
        </SidebarMenu>

        <SidebarSeparator className="my-2 mx-0 w-full" />

        <SidebarMenu className="flex flex-col space-y-1.5">
          {/* HELP & SUPPORT */}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Help and Support"
              className="group relative overflow-hidden cursor-pointer"
            >
              <Link
                href={`/dashboard/my-projects/${slug}/help`}
                className="relative z-10 flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center"
              >
                <MessageCircleQuestionMark className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
                <span className="text-sm text-muted-foreground transition-colors group-hover:text-foreground group-data-[collapsible=icon]:hidden">
                  Help and Support
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* DELETE */}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Delete Project"
              className="group relative overflow-hidden cursor-pointer"
            >
              <Link
                href={`/dashboard/my-projects/${slug}/settings/delete`}
                className="relative z-10 flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center"
              >
                <Trash2 className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                <span className="text-sm text-muted-foreground transition-colors group-hover:text-primary group-data-[collapsible=icon]:hidden">
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
      {/* <AiAssistantSheet open={assistantOpen} onOpenChange={setAssistantOpen} /> */}
    </Sidebar>
  );
}
