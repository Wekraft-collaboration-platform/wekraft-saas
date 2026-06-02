"use client";

import { RedirectToSignIn } from "@clerk/nextjs";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { BugPlay, Home, Moon, Share2, SunMedium, Video, HelpCircle, BriefcaseBusiness, ChevronRight, ChevronLeft, Gift } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useStoreUser } from "@/hooks/use-user-store";
import { DashboardBreadcrumbs } from "@/modules/dashboard/components/HeaderCrumbs";
import { NotificationCenter } from "@/modules/dashboard/components/NotificationCenter";
import { ShareProjectDialog } from "@/modules/dashboard/components/ShareProjectDialog";
import { UserMenu } from "@/modules/dashboard/components/UserMenu";
import { HelpSupportDialog } from "@/modules/dashboard/components/HelpSupportDialog";
import { api } from "../../../../convex/_generated/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TourOrchestrator } from "@/modules/dashboard/components/TourOrchestrator";
import { MyWorkSheet } from "@/modules/workspace/workspace-modules/MyWorkSheet";
import { useMyWorkStore } from "@/store/useMyWorkStore";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0, width: 0 },
  visible: {
    opacity: 1,
    width: "auto",
    transition: {
      width: { type: "spring", stiffness: 220, damping: 24 },
      opacity: { duration: 0.2 },
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    width: 0,
    transition: {
      width: { duration: 0.2 },
      opacity: { duration: 0.15 },
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8, x: -8 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    x: -8,
    transition: { duration: 0.15 },
  },
} as const;

export default function Layout({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  // Cache trigger comment
  const { isLoading: isStoreLoading } = useStoreUser();
  const user = useQuery(api.user.getCurrentUser);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const isWorkspaceRoute = pathname?.includes("/workspace");
  const slug = params?.slug as string | undefined;

  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { setIsOpen: setIsWorkOpen } = useMyWorkStore();
  const [showWorkspaceTools, setShowWorkspaceTools] = useState(false);

  // Close workspace tools when navigating away from a workspace route
  useEffect(() => {
    if (!isWorkspaceRoute) {
      setShowWorkspaceTools(false);
    }
  }, [isWorkspaceRoute]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isStoreLoading) return;
    if (user === undefined) return;

    if (user && !user.hasCompletedOnboarding) {
      router.push(`/onboard/${user._id}`);
    }
  }, [isStoreLoading, user, router]);

  return (
    <div className="h-screen overflow-hidden">
      <Unauthenticated>
        <RedirectToSignIn />
      </Unauthenticated>
      <Authenticated>
        <TourOrchestrator />
        <SidebarProvider defaultOpen={true}>
          {sidebar}
          <SidebarInset className="border-l h-screen flex flex-col">
            <header className="flex justify-between h-18 py-1 flex-none items-center border-b px-4 bg-sidebar/60 backdrop-blur-xl z-50">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 cursor-pointer hover:scale-105 transition-all duration-200" />
                <DashboardBreadcrumbs />
              </div>
              {/* <div>
                <CommunitySearchBar />
              </div> */}
              <div className="flex items-center gap-5">
                {/* <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "h-9 w-9",
                    },
                  }}
                /> */}
                <div className="flex items-center gap-3">
                  {/* Only when workspace ! */}
                  {isWorkspaceRoute && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowWorkspaceTools(!showWorkspaceTools)}
                        className="h-8 gap-1.5 px-3 cursor-pointer hover:scale-105 transition-all duration-200 select-none rounded-lg text-xs font-medium flex items-center"
                      >
                        <ChevronLeft
                          className={`h-4 w-4 transition-transform duration-300 ${showWorkspaceTools ? "rotate-180" : ""
                            }`}
                        />
                        <span className="whitespace-nowrap">
                          {showWorkspaceTools ? "Close" : "View More"}
                        </span>

                      </Button>
                      <AnimatePresence>
                        {showWorkspaceTools && (
                          <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="flex items-center gap-2 overflow-hidden whitespace-nowrap"
                          >
                            {/* HOME */}
                            <motion.div variants={itemVariants}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon-sm"
                                    variant="outline"
                                    onClick={() => router.push(`/dashboard/my-projects/${slug}`)}
                                    aria-label="Home"
                                    className="cursor-pointer hover:scale-105 transition-all duration-200"
                                  >
                                    <Home className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Home</TooltipContent>
                              </Tooltip>
                            </motion.div>

                            {/* MY WORK */}
                            <motion.div variants={itemVariants}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon-sm"
                                    variant="outline"
                                    aria-label="My-work"
                                    onClick={() => setIsWorkOpen(true)}
                                    className="cursor-pointer hover:scale-105 transition-all duration-200"
                                  >
                                    <BriefcaseBusiness className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>My Work</TooltipContent>
                              </Tooltip>
                            </motion.div>

                            {/* Share */}
                            <motion.div variants={itemVariants}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon-sm"
                                    variant="outline"
                                    onClick={() => setIsShareOpen(true)}
                                    aria-label="Share project"
                                  >
                                    <Share2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Share Project</TooltipContent>
                              </Tooltip>
                            </motion.div>

                            {/* Team Meet */}
                            <motion.div variants={itemVariants}>
                              <Link href={`/dashboard/my-projects/${slug}/workspace/meet`}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon-sm"
                                      variant="outline"
                                      aria-label="Start video call"
                                    >
                                      <Video className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Team Meet</TooltipContent>
                                </Tooltip>
                              </Link>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                  {/* NOTIFICATION + HELP & SUPPORT */}
                  <TooltipProvider>
                    <NotificationCenter />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon-sm"
                          variant="outline"
                          onClick={() => setIsHelpOpen(true)}
                          aria-label="Help & Support"
                          className="cursor-pointer hover:scale-105 transition-all duration-200"
                        >
                          <HelpCircle className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Help & Support</TooltipContent>
                    </Tooltip>

                  </TooltipProvider>
                  {/* Referal */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon-sm"
                          variant="outline"
                          onClick={() => window.dispatchEvent(new CustomEvent("open-referral-dialog"))}
                          aria-label="Referral Program"
                          className="cursor-pointer hover:scale-105 transition-all duration-200"
                        >
                          <Gift className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Referral Program</TooltipContent>
                    </Tooltip>

                  </TooltipProvider>
                </div>
                <UserMenu />
              </div>
            </header>
            <div className="flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full scroll-smooth scrollbar-hide">
                {children}
              </ScrollArea>
            </div>
          </SidebarInset>
          {slug && (
            <ShareProjectDialog
              isOpen={isShareOpen}
              onClose={() => setIsShareOpen(false)}
              projectSlug={slug}
            />
          )}
          <HelpSupportDialog open={isHelpOpen} onOpenChange={setIsHelpOpen} />
          {isWorkspaceRoute && <MyWorkSheet />}
        </SidebarProvider>
      </Authenticated>
    </div>
  );
}
