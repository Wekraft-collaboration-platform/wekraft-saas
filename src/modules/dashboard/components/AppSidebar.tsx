"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";

import {
  Bell,
  Bot,
  ChevronDown,
  ChevronRight,
  ChevronsLeftRight,
  ChevronsRight,
  ChevronsUpDown,
  Clover,
  Compass,
  CreditCard,
  FileText,
  Folder,
  FolderCode,
  Gift,
  GitBranch,
  GitBranchPlus,
  Github,
  GithubIcon,
  Layers3,
  LayoutDashboard,
  Link2,
  LogOutIcon,
  LucideGitBranch,
  LucideGithub,
  LucideGrip,
  LucideLayoutDashboard,
  LucideListTodo,
  LucideRocket,
  LucideWandSparkles,
  Mic,
  Moon,
  Palette,
  Play,
  Plus,
  Settings2,
  SparklesIcon,
  Star,
  Stars,
  Store,
  Sun,
  User,
  User2,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Doc } from "../../../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@clerk/nextjs";
import { ThemeButtons } from "./ThemeButton";

export const AppSidebar = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const user: Doc<"users"> | undefined | null = useQuery(
    api.user.getCurrentUser,
  );

  const ownerProjects = useQuery(api.project.getUserProjects);
  const teamProjects = useQuery(api.project.getJoinedProjects);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (url: string) => {
    return pathname === url || pathname.startsWith(url + "/dashbaord");
  };

  return (
    <Sidebar collapsible="icon" className="">
      <SidebarHeader className="p-0 gap-0">
        <div className="flex items-center justify-center gap-3 px-3 h-18 border-b group-data-[collapsible=icon]:px-0 shrink-0">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={30}
            height={30}
            className="cursor-pointer shrink-0"
          />
          <h1 className="font-bold font-pop text-xl group-data-[collapsible=icon]:hidden">
            WeKraft
          </h1>
        </div>
        {user === undefined ? (
          <div className="flex items-center gap-4 my-2 mx-auto border px-6 py-2 bg-sidebar-accent/30 rounded-md w-[calc(100%-1.5rem)] group-data-[collapsible=icon]:hidden">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="flex flex-col space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 my-2 mx-auto border px-6 py-2 bg-accent/40 rounded-md w-[calc(100%-1.5rem)] group-data-[collapsible=icon]:hidden font-sans">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>

            <div className="flex flex-col space-y-0.5">
              <h2 className="flex gap-2 text-sm items-center truncate">
                <Github className="h-4 w-4 shrink-0" /> {user?.githubUsername}
              </h2>
              <p className="text-xs text-muted-foreground ml-3">
                Account Synced
              </p>
            </div>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent className="flex flex-col px-3 py-5 relative overflow-y-auto scroll-smooth group-data-[collapsible=icon]:px-0">
        <SidebarMenu className="flex flex-col gap-2">
          {/* 1 */}
          <SidebarMenuButton
            asChild
            tooltip="Dashboard"
            isActive={isActive("/dashboard")}
            className="group relative overflow-hidden"
          >
            <Link
              href="/dashboard"
              className="relative z-10 flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center"
            >
              <LucideLayoutDashboard className="h-5 w-5" />
              <span className="text-sm group-data-[collapsible=icon]:hidden">
                Dashboard
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
          {/* 2 */}
          <Popover>
            <PopoverTrigger asChild>
              <SidebarMenuButton
                tooltip="Community"
                isActive={isActive("/dashboard/community")}
                className="group relative overflow-hidden"
              >
                <div className="relative z-10 flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center">
                  <Users className="h-5 w-5 shrink-0" />
                  <span className="text-sm group-data-[collapsible=icon]:hidden">
                    Community
                  </span>
                  <ChevronRight className="h-4 w-4 ml-auto group-data-[collapsible=icon]:hidden" />
                </div>
              </SidebarMenuButton>
            </PopoverTrigger>

            <PopoverContent side="right" className="w-56 p-2">
              <div className="flex flex-col gap-1">
                <Link
                  href="/dashboard/community?mode=discover"
                  className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent"
                >
                  <Compass className="h-4 w-4" />
                  Discover Projects
                </Link>

                <Link
                  href="/dashboard/community?mode=bounties"
                  className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent"
                >
                  <Gift className="h-4 w-4" />
                  Open Bounties
                </Link>

                <Link
                  href="/dashboard/community?mode=find-team"
                  className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent"
                >
                  <UserPlus className="h-4 w-4" />
                  Find Teammates
                </Link>
              </div>
            </PopoverContent>
          </Popover>
          {/* 3 */}
          <SidebarMenuButton
            asChild
            tooltip="Repositories"
            isActive={isActive("/dashboard/repositories")}
            className="group relative overflow-hidden"
          >
            <Link
              href="/dashboard/repositories"
              className="relative z-10 flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center"
            >
              <GitBranchPlus className="h-5 w-5" />
              <span className="text-sm group-data-[collapsible=icon]:hidden">
                Repositories
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
          {/* 4 */}
          <div className="px-1 my-2 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center justify-center gap-2">
              <span className="w-10 h-px bg-muted-foreground/30"></span>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground capitalize text-center">
                My Projects
              </h3>
              <span className="w-10 h-px bg-muted-foreground/30"></span>
            </div>

            <Tabs defaultValue="my" className="w-full">
              <TabsList className="grid grid-cols-2 h-8 mx-auto w-full">
                <TabsTrigger value="my" className="text-xs">
                  My Creations
                </TabsTrigger>
                <TabsTrigger value="team" className="text-xs">
                  Team Projects
                </TabsTrigger>
              </TabsList>

              <div className="mt-2 p-1 h-[156px] overflow-y-auto rounded-md border bg-sidebar-accent/30">
                {/* MY CREATIONS */}
                <TabsContent value="my" className="m-0 p-2">
                  <div className="flex flex-col gap-2 ">
                    {ownerProjects === undefined ? (
                      <div className="flex flex-col gap-2">
                        <Skeleton className="h-9 w-full rounded-md" />
                        <Skeleton className="h-9 w-full rounded-md" />
                        <Skeleton className="h-9 w-full rounded-md" />
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col gap-1">
                          {ownerProjects.map((project) => (
                            <Link
                              key={project._id}
                              href={`/dashboard/my-projects/${project.slug}/workspace`}
                              className="flex items-center justify-between gap-2 p-1 rounded-md hover:bg-accent/40 cursor-pointer transition-all border border-transparent hover:border-sidebar-border"
                            >
                              <div className="flex items-center gap-2 max-w-[130px]">
                                <Folder className="h-3 w-3 text-primary shrink-0" />
                                <span className="text-xs font-medium truncate">
                                  {project.projectName}
                                </span>
                              </div>

                              <div className="flex -space-x-0.5 overflow-hidden">
                                {project.members &&
                                project.members.length > 0 ? (
                                  project.members
                                    .slice(0, 3)
                                    .map((member, idx) => (
                                      <Avatar
                                        key={idx}
                                        className="h-5.5 w-5.5 border border-primary/70"
                                      >
                                        <AvatarImage src={member.userImage} />
                                        <AvatarFallback className="text-[8px]">
                                          {member.userName
                                            .substring(0, 1)
                                            .toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                    ))
                                ) : (
                                  <>
                                    <Button
                                      className="text-[10px] cursor-pointer"
                                      size="xs"
                                      variant="ghost"
                                    >
                                      Invite +
                                    </Button>
                                  </>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="text-[10px] mt-2 h-7 w-full cursor-pointer"
                        >
                          <Link href="/dashboard/my-projects">
                            <Layers3 className="h-4 w-4 mr-1" />
                            View All Projects
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </TabsContent>

                {/* TEAM PROJECTS */}
                <TabsContent value="team" className="m-0 p-2">
                  <div className="flex flex-col gap-2 ">
                    {teamProjects === undefined ? (
                      <div className="flex flex-col gap-2">
                        <Skeleton className="h-9 w-full rounded-md" />
                        <Skeleton className="h-9 w-full rounded-md" />
                        <Skeleton className="h-9 w-full rounded-md" />
                      </div>
                    ) : teamProjects.length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-center py-4">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          No team projects
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="text-[10px] mt-2 h-7 w-full cursor-pointer"
                        >
                          <Link href="/dashboard/community?mode=discover">
                            <Layers3 className="h-4 w-4 mr-1" />
                            Discover Projects
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col gap-1">
                          {teamProjects.map((project) => (
                            <Link
                              key={project._id}
                              href={`/dashboard/my-projects/${project.slug}`}
                              className="flex items-center justify-between gap-2 p-1 rounded-md hover:bg-accent/40 cursor-pointer transition-all border border-transparent hover:border-sidebar-border"
                            >
                              <div className="flex items-center gap-2 max-w-[130px]">
                                <FolderCode className="h-3 w-3 text-primary shrink-0" />
                                <span className="text-xs font-medium truncate">
                                  {project.projectName}
                                </span>
                              </div>

                              <div className="flex -space-x-1.5 overflow-hidden">
                                {project.members &&
                                project.members.length > 0 ? (
                                  project.members
                                    .slice(0, 3)
                                    .map((member, idx) => (
                                      <Avatar key={idx} className="h-5 w-5">
                                        <AvatarImage src={member.userImage} />
                                        <AvatarFallback className="text-[8px]">
                                          {member.userName
                                            .substring(0, 1)
                                            .toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                    ))
                                ) : (
                                  <span className="text-[10px] text-muted-foreground">
                                    {project.totalMembers}
                                  </span>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="text-[10px] mt-2 h-7 w-full cursor-pointer"
                        >
                          <Link href="/dashboard/my-projects">
                            <Layers3 className="h-4 w-4 mr-1" />
                            View All Projects
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* QUICK ACCESS */}
          <div className="flex items-center justify-center gap-2 group-data-[collapsible=icon]:hidden">
            <span className="w-10 h-px bg-muted-foreground/30"></span>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground capitalize text-center">
              Quick Access
            </h3>
            <span className="w-10 h-px bg-muted-foreground/30"></span>
          </div>

          {/* 5 */}
          <SidebarMenuButton
            asChild
            tooltip="My Profile"
            isActive={isActive("/dashboard/my-profile")}
            className="group relative overflow-hidden"
          >
            <Link
              href="/dashboard/my-profile"
              className="relative z-10 flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center"
            >
              <User2 className="h-5 w-5" />
              <span className="text-sm group-data-[collapsible=icon]:hidden">
                My Profile
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

          {/* THEME SWITCHER */}
          <Popover>
            <SidebarMenuButton
              asChild
              tooltip="Theme"
              className="group relative overflow-hidden"
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="relative z-10 flex w-full items-center gap-3 text-primary group-data-[collapsible=icon]:justify-center"
                >
                  <Palette className="h-5 w-5" />
                  <span className="text-sm group-data-[collapsible=icon]:hidden">
                    Theme
                  </span>

                  {/* Active gradient */}
                  <span
                    className="
            pointer-events-none absolute inset-0 -z-10
            opacity-0 transition-opacity
            group-data-[active=true]:opacity-100
            bg-linear-to-l from-blue-600/50 via-transparent to-transparent
          "
                  />
                </button>
              </PopoverTrigger>
            </SidebarMenuButton>

            <PopoverContent
              align="start"
              side="right"
              className="w-48 rounded-lg p-2"
            >
              <ThemeButtons />
            </PopoverContent>
          </Popover>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-accent px-2 py-2 group-data-[collapsible=icon]:hidden">
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
};
