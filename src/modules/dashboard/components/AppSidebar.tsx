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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";

import {
  Bell,
  Bot,
  Bug,
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
  Stars,
  Store,
  Sun,
  User,
  User2,
  Users,
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
import { UserAvatar, useUser, useClerk } from "@clerk/nextjs";
import { ThemeButtons } from "./ThemeButton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import CreateProjectDialog from "@/modules/project/CreateProjectDialog";
import { HelpSupportDialog } from "@/modules/dashboard/components/HelpSupportDialog";
import { ReferralDialog } from "@/modules/dashboard/components/ReferralDialog";

export const AppSidebar = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const user: Doc<"users"> | undefined | null = useQuery(
    api.user.getCurrentUser,
  );
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Bug fix: planExpiry may have passed but DB hasn't been updated yet by cron.
  // Compute effective plan client-side so the sidebar shows "free" immediately
  // after a trial expires, rather than waiting up to 24h for the cron to run.
  const effectivePlan = (() => {
    if (!user) return "free";
    const isExpired = user.planExpiry !== undefined && user.planExpiry !== null && user.planExpiry < Date.now();
    return isExpired ? "free" : (user.accountType || "free");
  })();

  const ownerProjects = useQuery(api.project.getUserProjects);
  const teamProjects = useQuery(api.project.getJoinedProjects);

  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConnectGithub = async () => {
    try {
      const existingGithub = clerkUser?.externalAccounts.find(
        (acc) => acc.provider === "github",
      );

      if (
        existingGithub &&
        existingGithub.verification?.status !== "verified" &&
        existingGithub.verification?.externalVerificationRedirectURL
      ) {
        window.location.href =
          existingGithub.verification.externalVerificationRedirectURL.toString();
        return;
      }

      const res = await clerkUser?.createExternalAccount({
        strategy: "oauth_github",
        redirectUrl: window.location.href,
      });

      if (res?.verification?.externalVerificationRedirectURL) {
        window.location.href =
          res.verification.externalVerificationRedirectURL.toString();
      }
    } catch (error: any) {
      console.error("❌ Failed to connect GitHub:", error);
      toast.error(
        error?.errors?.[0]?.message ||
        "Something went wrong while connecting GitHub",
      );
    }
  };

  const isActive = (url: string) => {
    return pathname === url || pathname.startsWith(url + "/dashbaord");
  };

  return (
    <Sidebar collapsible="icon" className="">
      <SidebarHeader className="p-0 gap-0">
        {isCollapsed ? (
          <Link href="/web" className="flex items-center justify-center h-18 border-b w-full shrink-0">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={30}
              height={30}
              className="cursor-pointer shrink-0"
            />
          </Link>
        ) : (
          <Link href="/web" className="flex items-center justify-center gap-3 px-3 h-18 border-b shrink-0">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={30}
              height={30}
              className="cursor-pointer shrink-0"
            />
            <h1 className="font-bold font-pop text-xl">WeKraft</h1>
          </Link>
        )}
        {user === undefined ? (
          <div className="flex items-center gap-4 my-2 mx-auto border px-6 py-2 bg-sidebar-accent/30 rounded-md w-[calc(100%-1.5rem)] group-data-[collapsible=icon]:hidden">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="flex flex-col space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 my-2 mx-auto border border-border! px-6 py-2 bg-accent/45 rounded-md w-[calc(100%-1.5rem)] group-data-[collapsible=icon]:hidden font-sans">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>

            <div className="flex flex-col space-y-0.5 overflow-hidden">
              {user?.githubUsername ? (
                <>
                  <h2 className="flex gap-2 text-sm items-center truncate">
                    <Github className="h-4 w-4 shrink-0" />{" "}
                    {user?.githubUsername}
                  </h2>
                  <p className="text-xs text-muted-foreground ml-6">
                    Account Synced
                  </p>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleConnectGithub}
                    size="xs"
                    variant="default"
                    className="h-6 rounded! text-[10px] gap-1 px-4!"
                  >
                    <Github className="h-3 w-3" /> Connect GitHub
                  </Button>
                  <p className="text-[10px] ml-1 mt-1">No GitHub Account</p>
                </>
              )}
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
              <Badge
                variant="default"
                className="ml-auto text-[10px] h-4 px-1 group-data-[collapsible=icon]:hidden"
              >
                Soon
              </Badge>
            </div>
          </SidebarMenuButton>


          {/* 4 */}
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
          {/* 5 */}
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
                <TabsContent value="my" className="m-0 px-2 py-1">
                  <div className="flex flex-col gap-2 ">
                    {ownerProjects === undefined ? (
                      <div className="flex flex-col gap-2">
                        <Skeleton className="h-9 w-full rounded-md" />
                        <Skeleton className="h-9 w-full rounded-md" />
                        <Skeleton className="h-9 w-full rounded-md" />
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col gap-0.5">
                          {ownerProjects.map((project, index) => (
                            <Link
                              key={project._id}
                              id={index === 0 ? "sidebar-first-project" : undefined}
                              href={`/dashboard/my-projects/${project.slug}`}
                              className="flex items-center justify-between gap-2 p-0.5 rounded-md hover:bg-accent/40 cursor-pointer transition-all border border-transparent hover:border-sidebar-border"
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
                        <CreateProjectDialog
                          trigger={
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-[10px] mt-2 h-7 w-full cursor-pointer"
                            >
                              <Layers3 className="h-4 w-4 mr-1" />
                              Create New
                            </Button>
                          }
                        />
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
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col gap-1">
                          {teamProjects.map((project) => (
                            <Link
                              key={project?._id}
                              href={`/dashboard/my-projects/${project?.slug}/workspace`}
                              className="flex items-center justify-between gap-2 p-1 rounded-md hover:bg-accent/40 cursor-pointer transition-all border border-transparent hover:border-sidebar-border"
                            >
                              <div className="flex items-center gap-2 max-w-[130px]">
                                <FolderCode className="h-3 w-3 text-primary shrink-0" />
                                <span className="text-xs font-medium truncate">
                                  {project?.projectName}
                                </span>
                              </div>

                              <div className="flex -space-x-1.5 overflow-hidden">
                                {project?.members &&
                                  project?.members.length > 0 ? (
                                  project?.members
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
                                    {project?.totalMembers}
                                  </span>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                        {/* <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="text-[10px] mt-2 h-7 w-full cursor-pointer"
                        >
                          <Link href="/dashboard/my-projects">
                            <Layers3 className="h-4 w-4 mr-1" />
                            View All Projects
                          </Link>
                        </Button> */}
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

          {/* My Referral */}
          <SidebarMenuButton
            tooltip="My Referral"
            onClick={() => window.dispatchEvent(new CustomEvent("open-referral-dialog"))}
            className="group relative overflow-hidden cursor-pointer"
          >
            <div className="relative z-10 flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center">
              <Gift className="h-5 w-5" />
              <span className="text-sm group-data-[collapsible=icon]:hidden font-medium">
                My Referral
              </span>
            </div>
          </SidebarMenuButton>


          {/* 6 */}
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

          {/* Help & Support */}
          <SidebarMenuButton
            tooltip="Help & Support"
            onClick={() => setIsHelpOpen(true)}
            className="group relative overflow-hidden cursor-pointer"
          >
            <div className="relative z-10 flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center">
              <Compass className="h-5 w-5" />
              <span className="text-sm group-data-[collapsible=icon]:hidden font-medium">
                Help & Support
              </span>
            </div>
          </SidebarMenuButton>


        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-accent px-2 py-2 group-data-[collapsible=icon]:hidden">
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
                    {effectivePlan}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground text-left my-1.5 leading-relaxed">
                {effectivePlan === "pro"
                  ? "You have full access to all premium features."
                  : effectivePlan === "plus"
                    ? "Upgrade to Pro to unlock Kaya and Other AI features."
                    : "Upgrade to Plus to unlock AI and boost your productivity."}
              </p>
              {effectivePlan !== "pro" && (
                <Link href="/web/pricing">
                  <Button
                    className="text-[10px] cursor-pointer w-full my-1.5 font-medium"
                    size="xs"
                  >
                    {effectivePlan === "plus"
                      ? "Upgrade to Pro"
                      : "Upgrade Now"}
                  </Button>
                </Link>
              )}
            </div>

            {effectivePlan === "pro" && (
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
                        <LogOutIcon className="h-3.5 w-3.5" />
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
      <HelpSupportDialog open={isHelpOpen} onOpenChange={setIsHelpOpen} />
      <ReferralDialog />
    </Sidebar>
  );
};
