"use client";

import { useClerk } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import {
  AudioWaveform,
  Bug,
  Calendar,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ChevronsUpDown,
  ClipboardList,
  Clover,
  Compass,
  FastForward,
  Folder,
  FolderEdit,
  Home,
  Inbox,
  Layers,
  LayoutGrid,
  ListTree,
  LogOut,
  MessageCircleQuestionMark,
  MessageCircleWarning,
  MessagesSquare,
  Network,
  Palette,
  PlaneTakeoff,
  Presentation,
  Search,
  Settings2,
  Trash2,
  Users2,
  Video,
  Workflow,
  X,
  ChevronsDownUp,
  Blocks,
} from "lucide-react";
import { HelpSupportDialog } from "@/modules/dashboard/components/HelpSupportDialog";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import { ThemeButtons } from "../dashboard/components/ThemeButton";

const workspaceMenu = [
  {
    label: "Manage Team",
    path: "workspace/team",
    icon: Users2,
  },
  {
    label: "Teamspace",
    path: "workspace/teamspace",
    icon: PlaneTakeoff,
  },
  {
    label: "Customer Desk",
    path: "workspace/customer-desk",
    icon: Inbox,
  },
  {
    label: "Calendar",
    path: "workspace/calendar",
    icon: Calendar,
  },
  {
    label: "Heatmap",
    path: "workspace/heatmap",
    icon: Network,
  },
];

const moreMenu = [
  {
    label: "Meet",
    path: "workspace/meet",
    icon: Video,
  },
  {
    label: "Docs",
    path: "workspace/docs",
    icon: ClipboardList,
  },
  {
    label: "Whiteboard",
    path: "workspace/whiteboard",
    icon: Presentation,
  },
  {
    label: "Flow-Charts",
    path: "workspace/flow-charts",
    icon: Workflow,
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
  const [_mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const [_assistantOpen, setAssistantOpen] = useState(false);
  const { signOut } = useClerk();
  const { state, setOpen } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const user: Doc<"users"> | undefined | null = useQuery(
    api.user.getCurrentUser,
  );

  const project = useQuery(api.project.getProjectBySlug, { slug });
  const ownerProjects = useQuery(api.project.getUserProjects);
  const teamProjects = useQuery(api.project.getJoinedProjects);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus on slash (/) press, unless inside an input/textarea
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        if (isCollapsed) {
          setOpen(true);
          setTimeout(() => {
            searchInputRef.current?.focus();
          }, 100);
        } else {
          searchInputRef.current?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCollapsed, setOpen]);

  const isActive = (url: string) => {
    return pathname === url || pathname.startsWith(`${url}/`);
  };

  const isActiveExact = (url: string) => {
    return pathname === url;
  };

  const matchesAi =
    "ai assistant".includes(searchQuery.toLowerCase()) ||
    "kaya".includes(searchQuery.toLowerCase()) ||
    "chatspace".includes(searchQuery.toLowerCase()) ||
    "ask ai".includes(searchQuery.toLowerCase());

  const matchesWorkspace =
    "workspace".includes(searchQuery.toLowerCase()) ||
    "overview".includes(searchQuery.toLowerCase()) ||
    "home".includes(searchQuery.toLowerCase());

  const filteredCollapsibleItems = collapsibleItems.filter((item) => {
    const labelLower = item.label.toLowerCase();
    const queryLower = searchQuery.toLowerCase();
    return (
      labelLower.includes(queryLower) ||
      (labelLower === "tasks" &&
        ("to do".includes(queryLower) ||
          "kanban".includes(queryLower) ||
          "board".includes(queryLower))) ||
      (labelLower === "issues" &&
        ("bugs".includes(queryLower) || "tickets".includes(queryLower))) ||
      (labelLower === "sprint" &&
        ("agile".includes(queryLower) || "velocity".includes(queryLower))) ||
      (labelLower === "time logs" &&
        ("logs".includes(queryLower) ||
          "tracker".includes(queryLower) ||
          "timesheet".includes(queryLower)))
    );
  });

  const filteredWorkspaceMenu = workspaceMenu.filter((item) => {
    const labelLower = item.label.toLowerCase();
    const queryLower = searchQuery.toLowerCase();
    return (
      labelLower.includes(queryLower) ||
      (labelLower === "manage team" &&
        ("team".includes(queryLower) ||
          "members".includes(queryLower) ||
          "users".includes(queryLower))) ||
      (labelLower === "teamspace" && "space".includes(queryLower)) ||
      (labelLower === "calendar" &&
        ("schedule".includes(queryLower) || "events".includes(queryLower))) ||
      (labelLower === "heatmap" &&
        ("activity".includes(queryLower) ||
          "network".includes(queryLower) ||
          "commits".includes(queryLower))) ||
      (labelLower === "customer desk" &&
        ("customer".includes(queryLower) ||
          "desk".includes(queryLower) ||
          "feedback".includes(queryLower) ||
          "requests".includes(queryLower) ||
          "support".includes(queryLower)))
    );
  });

  const filteredMoreMenu = moreMenu.filter((item) => {
    const labelLower = item.label.toLowerCase();
    const queryLower = searchQuery.toLowerCase();
    return (
      labelLower.includes(queryLower) ||
      (labelLower === "meet" &&
        ("video".includes(queryLower) ||
          "call".includes(queryLower) ||
          "meet".includes(queryLower) ||
          "conference".includes(queryLower))) ||
      (labelLower === "docs" &&
        ("documents".includes(queryLower) ||
          "notes".includes(queryLower) ||
          "wiki".includes(queryLower))) ||
      (labelLower === "whiteboard" &&
        ("canvas".includes(queryLower) ||
          "draw".includes(queryLower) ||
          "board".includes(queryLower))) ||
      (labelLower === "flow-charts" &&
        ("flow".includes(queryLower) ||
          "charts".includes(queryLower) ||
          "diagram".includes(queryLower) ||
          "workflow".includes(queryLower)))
    );
  });

  const matchesHelp =
    "help and support".includes(searchQuery.toLowerCase()) ||
    "support".includes(searchQuery.toLowerCase()) ||
    "faq".includes(searchQuery.toLowerCase()) ||
    "docs".includes(searchQuery.toLowerCase());

  const matchesDelete =
    "delete project".includes(searchQuery.toLowerCase()) ||
    "remove".includes(searchQuery.toLowerCase()) ||
    "settings".includes(searchQuery.toLowerCase()) ||
    "danger zone".includes(searchQuery.toLowerCase());

  const hasNoResults =
    searchQuery.trim().length > 0 &&
    filteredCollapsibleItems.length === 0 &&
    filteredWorkspaceMenu.length === 0 &&
    filteredMoreMenu.length === 0 &&
    !matchesAi &&
    !matchesWorkspace &&
    !matchesHelp &&
    !matchesDelete;

  return (
    <Sidebar collapsible="icon" className="border bg-white! dark:bg-sidebar!">
      {/* ───────── HEADER ───────── */}
      <SidebarHeader
        style={{ viewTransitionName: "site-header" }}
        className="h-18 justify-center flex-none border-b"
      >
        {isCollapsed ? (
          <div className="flex items-center justify-center w-full">
            <Link href="/dashboard" className="flex items-center justify-center">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={28}
                height={28}
                className="cursor-pointer"
              />
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 px-3">
            <Link href="/dashboard" className="flex items-center">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={28}
                height={28}
                className="cursor-pointer"
              />
            </Link>

            <h1 className="font-semibold text-xl capitalize truncate">
              {project?.projectName}
            </h1>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  size="icon-xs"
                  variant="outline"
                  className="cursor-pointer  transition-all duration-200"
                >
                  <ChevronsDownUp className="h-4 w-4!" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                side="right"
                align="start"
                sideOffset={8}
                className="w-64 p-3 bg-sidebar backdrop-blur-md border border-accent! shadow-xl rounded-xl font-sans"
              >
                <div className="flex flex-col gap-2">

                  {/* Heading */}
                  <span className="text-xs text-center px-1.5">
                    Switch Workspace
                  </span>

                  <Separator className="bg-accent my-1" />

                  {/* Projects List */}
                  <div className="h-[140px] overflow-y-auto pr-1 flex flex-col gap-1.5">
                    {ownerProjects === undefined && teamProjects === undefined ? (
                      <div className="flex flex-col gap-1.5 p-1">
                        <Skeleton className="h-7 w-full rounded" />
                        <Skeleton className="h-7 w-full rounded" />
                        <Skeleton className="h-7 w-full rounded" />
                      </div>
                    ) : (
                      <>
                        {/* Deduplicated projects list */}
                        {Array.from(
                          new Map(
                            [
                              ...(ownerProjects || []),
                              ...(teamProjects || []),
                            ].map((p) => [p._id, p])
                          ).values()
                        ).map((p) => {
                          return (
                            <Link
                              key={p._id}
                              href={`/dashboard/my-projects/${p.slug}/workspace`}
                              className="flex items-center justify-between gap-2 p-1.5 rounded-md hover:bg-accent/40 cursor-pointer transition-all border border-transparent text-left"
                            >
                              <div className="flex items-center gap-2 max-w-[140px] truncate">
                                <Folder className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span className="text-xs font-medium truncate text-white">
                                  {p.projectName}
                                </span>
                              </div>

                              <div className="flex -space-x-1 overflow-hidden shrink-0">
                                {p.members && p.members.length > 0 ? (
                                  p.members
                                    .slice(0, 3)
                                    .map((member: any, idx: number) => (
                                      <Avatar
                                        key={idx}
                                        className="h-5 w-5 border border-primary/20 shrink-0"
                                      >
                                        <AvatarImage src={member.userImage} />
                                        <AvatarFallback className="text-[7px]">
                                          {member.userName
                                            .substring(0, 1)
                                            .toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                    ))
                                ) : (
                                  <span className="text-[9px] text-muted-foreground px-1">
                                    Empty
                                  </span>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </SidebarHeader>

      {/* ───────── CONTENT ───────── */}
      <SidebarContent className="px-2 py-5 group-data-[collapsible=icon]:px-0">
        <SidebarMenu className="mb-2">
          {isCollapsed ? (
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Search links (/)"
                onClick={() => {
                  setOpen(true);
                  setTimeout(() => {
                    searchInputRef.current?.focus();
                  }, 100);
                }}
                className="group relative overflow-hidden cursor-pointer"
              >
                <Search className="h-5 w-5 text-primary! transition-colors" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : (
            <SidebarMenuItem className="px-1.5">
              <InputGroup className="w-full bg-muted! border border-accent! hover:border-primary/40 focus-within:border-primary/50 transition-all duration-200">
                <InputGroupAddon
                  align="inline-start"
                  className="text-muted-foreground"
                >
                  <Search className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search links...."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="placeholder:text-muted-foreground text-sm h-8"
                />
                {searchQuery && (
                  <InputGroupAddon align="inline-end">
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-muted-foreground hover:text-foreground rounded-full p-0.5 hover:bg-muted/80 transition-colors cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </InputGroupAddon>
                )}
              </InputGroup>
            </SidebarMenuItem>
          )}
        </SidebarMenu>

        {(!searchQuery || matchesAi) && (
          <SidebarMenu>
            {/* =========AI ASSISTANT COLLAPSIBLE====== */}
            {!isCollapsed ? (
              <Collapsible defaultOpen={false} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip="AI Assistant"
                      className="group relative overflow-hidden group-data-[collapsible=icon]:bg-transparent! cursor-pointer"
                    >
                      <div className="relative z-10 flex items-center gap-3 w-full text-sm group-data-[collapsible=icon]:justify-center">
                        <Image
                          src="/kaya.svg"
                          alt="Logo"
                          width={24}
                          height={24}
                        />

                        <span
                          className={cn(
                            "group-data-[collapsible=icon]:hidden transition-colors text-foreground",
                          )}
                        >
                          AI Assistant
                        </span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden text-primary!" />
                      </div>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="border-l border-dashed dark:border-neutral-400! border-muted-foreground ml-[21px] pl-3 gap-1.5">
                      {/* Keyboard shortcut indicator */}
                      <div className="flex items-center justify-between px-2.5 py-1 text-[10px] bg-muted rounded-md text-muted-foreground select-none">
                        <span>Toggle AI Assistant</span>
                        <div className="flex items-center gap-1">
                          <Kbd className="bg-muted/50 font-sans text-[8px] px-1 py-0">
                            Ctrl
                          </Kbd>
                          <span>+</span>
                          <Kbd className="bg-muted/50 font-sans text-[8px] px-1 py-0">
                            K
                          </Kbd>
                        </div>
                      </div>

                      {/* Kaya PM Agent */}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname.includes("/workspace/ai") && pathname.includes("kaya=true")}
                          className="group relative h-8 overflow-hidden"
                        >
                          <Link
                            href={`/dashboard/my-projects/${slug}/workspace/ai?kaya=true`}
                            className="relative z-10 flex items-center w-full gap-2.5"
                          >
                            <Image
                              src="/kaya.svg"
                              alt="Kaya PM"
                              width={16}
                              height={16}
                              className="shrink-0"
                            />
                            <span className="text-sm text-muted-foreground hover:text-foreground">
                              Kaya PM Agent
                            </span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>

                      {/* Harry Dev Agent */}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname.includes("/workspace/ai") && pathname.includes("harry=true")}
                          className="group relative h-8 overflow-hidden"
                        >
                          <Link
                            href={`/dashboard/my-projects/${slug}/workspace/ai?harry=true`}
                            className="relative z-10 flex items-center w-full gap-2.5"
                          >
                            <Image
                              src="/harry.svg"
                              alt="Harry Dev"
                              width={16}
                              height={16}
                              className="shrink-0"
                            />
                            <span className="text-sm text-muted-foreground hover:text-foreground">
                              Harry Dev Agent
                            </span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ) : (
              // Collapsed to icon view
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Kaya PM Agent"
                    isActive={pathname.includes("/workspace/ai") && pathname.includes("kaya=true")}
                    className="group relative overflow-hidden cursor-pointer"
                  >
                    <Link
                      href={`/dashboard/my-projects/${slug}/workspace/ai?kaya=true`}
                      className="relative z-10 flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center"
                    >
                      <Image
                        src="/kaya.svg"
                        alt="Kaya PM"
                        width={24}
                        height={24}
                      />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Harry Dev Agent"
                    isActive={pathname.includes("/workspace/ai") && pathname.includes("harry=true")}
                    className="group relative overflow-hidden cursor-pointer"
                  >
                    <Link
                      href={`/dashboard/my-projects/${slug}/workspace/ai?harry=true`}
                      className="relative z-10 flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center"
                    >
                      <Image
                        src="/harry.svg"
                        alt="Harry Dev"
                        width={24}
                        height={24}
                      />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}
          </SidebarMenu>
        )}

        {/* MANAGE PROJECT */}
        {!searchQuery && (
          <div className="flex items-center justify-center gap-2 mt-2 group-data-[collapsible=icon]:hidden">
            <hr className="w-12 border border-accent" />
            <p className="text-sm text-center">Manage Project</p>
            <hr className="w-12 border border-accent" />
          </div>
        )}

        {(!searchQuery || matchesWorkspace) && (
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
        )}

        {(filteredCollapsibleItems.length > 0 ||
          filteredWorkspaceMenu.length > 0 ||
          (searchQuery && filteredMoreMenu.length > 0)) && (
            <SidebarMenu className="flex flex-col space-y-1.5">
              {/*  PROJECT MANAGE COLLAPSIBLE */}
              {filteredCollapsibleItems.length > 0 &&
                (!isCollapsed ? (
                  <Collapsible
                    defaultOpen
                    open={searchQuery ? true : undefined}
                    className="group/collapsible"
                  >
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
                        <SidebarMenuSub className="border-l border-dashed dark:border-neautral-400! border-muted-foreground ml-[21px] pl-3 gap-1.5">
                          {filteredCollapsibleItems.map((item) => {
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
                ) : (
                  filteredCollapsibleItems.map((item) => {
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
                                isActive(href)
                                  ? "text-foreground"
                                  : "text-foreground",
                              )}
                            />
                            <span className="text-sm group-data-[collapsible=icon]:hidden">
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
                  })
                ))}

              {/* OTHER ITEMS */}
              {filteredWorkspaceMenu.map((item) => {
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
                            isActive(href)
                              ? "text-foreground"
                              : "text-foreground",
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

              {/* FILTERED MORE MENU ITEMS IF SEARCHING */}
              {searchQuery && filteredMoreMenu.map((item) => {
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
                            isActive(href)
                              ? "text-foreground"
                              : "text-foreground",
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

              {/* MORE LINK (only when not searching) */}
              {!searchQuery && (
                <SidebarMenuItem>
                  <Popover>
                    <PopoverTrigger asChild>
                      <SidebarMenuButton
                        tooltip="More"
                        className="group relative overflow-hidden cursor-pointer"
                      >
                        <div className="relative z-10 flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center">
                          <Blocks className="h-5 w-5 text-foreground" />
                          <span className="text-sm text-foreground group-data-[collapsible=icon]:hidden">
                            More
                          </span>
                          <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                        </div>
                      </SidebarMenuButton>
                    </PopoverTrigger>
                    <PopoverContent
                      side="right"
                      align="center"
                      sideOffset={6}
                      className="w-64 p-4 bg-sidebar backdrop-blur-md border border-accent! shadow-xl rounded-lg animate-in fade-in-50 zoom-in-95 duration-100"
                    >

                      <div className="grid grid-cols-3 gap-x-4 gap-y-5 justify-items-center py-1">
                        {moreMenu.map((item) => (
                          <Link
                            key={item.label}
                            href={`/dashboard/my-projects/${slug}/${item.path}`}
                            className="flex flex-col items-center gap-2 group cursor-pointer"
                          >
                            <div className="h-9 w-9 rounded flex items-center justify-center bg-muted border border-accent! text-white transition-all duration-300 shadow-sm group-hover:bg-muted/90 group-hover:border-accent-foreground/30">
                              <item.icon className="h-4! w-4!" />
                            </div>
                            <span className="text-xs whitespace-nowrap">
                              {item.label}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          )}

        {(!searchQuery || matchesHelp || matchesDelete) && (
          <>
            <SidebarSeparator className="my-2 mx-0 w-full" />
            <SidebarMenu className="flex flex-col space-y-1.5">


              {/* HELP & SUPPORT */}
              {(!searchQuery || matchesHelp) && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Help and Support"
                    className="group relative overflow-hidden cursor-pointer group-data-[collapsible=icon]:hidden"
                    onClick={() => setIsHelpOpen(true)}
                  >
                    <div className="relative z-10 flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center">
                      <MessageCircleQuestionMark className="h-5 w-5 text-foreground" />
                      <span className="text-sm text-foreground group-data-[collapsible=icon]:hidden">
                        Help and Support
                      </span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}


              {/* DELETE */}
              {(!searchQuery || matchesDelete) && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Delete Project"
                    className="group relative overflow-hidden cursor-pointer  group-data-[collapsible=icon]:hidden"
                  >
                    <Link
                      href={`/dashboard/my-projects/${slug}/workspace/delete`}
                      className="relative z-10 flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center"
                    >
                      <Trash2 className="h-5 w-5 text-destructive" />
                      <span className="text-sm  group-data-[collapsible=icon]:hidden">
                        Delete Project
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </>
        )}

        {hasNoResults && (
          <div className="flex flex-col items-center justify-center px-4 py-8 text-center animate-in fade-in-50 slide-in-from-bottom-2 duration-200">
            <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <Search className="h-5 w-5 text-muted-foreground/60" />
            </div>
            <p className="text-sm font-medium text-foreground">
              No links found
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[180px]">
              No sidebar links match &ldquo;{searchQuery}&rdquo;
            </p>
            <Button
              variant="link"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="mt-2 text-xs font-semibold text-primary p-0 h-auto cursor-pointer"
            >
              Clear search
            </Button>
          </div>
        )}
      </SidebarContent>

      {/* ───────── FOOTER ───────── */}
      <SidebarFooter className="border-t border-accent px-2 group-data-[collapsible=icon]:hidden">
        {/* =======USER PLAN========= */}
        {user && (
          <div className="flex flex-col gap-2">
            <div className="my-2 border p-3 rounded-md bg-linear-to-br from-card via-card to-blue-600/70">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-blue-600/20 flex items-center justify-center">
                  <Clover className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-sm font-medium">Current Plan</h3>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user.accountType || "Free"}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground text-left my-1.5 leading-relaxed">
                {user.accountType === "pro"
                  ? "You have full access to all premium features."
                  : user.accountType === "plus"
                    ? "Upgrade to Pro to unlock Kaya and Other AI features."
                    : "Upgrade to Plus to unlock AI and boost your productivity."}
              </p>
              {user.accountType !== "pro" && (
                <Link href="/web/pricing">
                  <Button
                    className="text-[10px] cursor-pointer w-full my-1.5 font-medium"
                    size="xs"
                  >
                    {user.accountType === "plus"
                      ? "Upgrade to Pro"
                      : "Upgrade Now"}
                  </Button>
                </Link>
              )}
            </div>

            {user.accountType === "pro" && (
              <div className="flex items-center gap-3 p-2 rounded-md border border-accent bg-muted transition-all cursor-pointer group">
                <Avatar className="h-8 w-8 shrink-0 border border-primary/20">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback className="text-[10px]">
                    {user.name?.substring(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-semibold truncate leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate leading-tight">
                    {user.email}
                  </span>
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="h-7 w-7 shrink-0"
                    >
                      <ChevronsUpDown className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    side="right"
                    align="end"
                    className="w-56 p-1 bg-card/95 backdrop-blur-md border-primary/10 shadow-xl"
                  >
                    <div className="flex flex-col gap-0.5">
                      <p className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Quick Actions
                      </p>
                      <Separator className="mb-1 opacity-50" />

                      <Link
                        href="/dashboard/my-profile"
                        className="flex items-center gap-2 px-2 py-2 rounded-sm text-xs hover:bg-accent transition-colors"
                      >
                        <Settings2 className="h-3.5 w-3.5" />
                        <span>Settings</span>
                      </Link>

                      <Link
                        href="/dashboard/support"
                        className="flex items-center gap-2 px-2 py-2 rounded-sm text-xs hover:bg-accent transition-colors"
                      >
                        <Compass className="h-3.5 w-3.5" />
                        <span>Support</span>
                      </Link>

                      <Link
                        href="/dashboard/report-bug"
                        className="flex items-center gap-2 px-2 py-2 rounded-sm text-xs hover:bg-accent transition-colors"
                      >
                        <Bug className="h-3.5 w-3.5" />
                        <span>Report Bug</span>
                      </Link>

                      <Separator className="my-1 opacity-50" />

                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 h-9 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => signOut({ redirectUrl: "/" })}
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Logout</span>
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        )}
      </SidebarFooter>
      {/* <AiAssistantSheet open={assistantOpen} onOpenChange={setAssistantOpen} /> */}
      <HelpSupportDialog open={isHelpOpen} onOpenChange={setIsHelpOpen} />
    </Sidebar>
  );
}
