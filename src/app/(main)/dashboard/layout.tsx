"use client";

import { RedirectToSignIn } from "@clerk/nextjs";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { BugPlay, Home, Moon, Share2, SunMedium, Video } from "lucide-react";
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
import { ShareProjectDialog } from "@/modules/dashboard/components/ShareProjectDialog";
import { UserMenu } from "@/modules/dashboard/components/UserMenu";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { AnnouncementBanner } from "@/modules/dashboard/components/AnnouncementBanner";
import { NotificationCenter } from "@/modules/dashboard/components/NotificationCenter";

export default function Layout({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  const { isLoading: isStoreLoading } = useStoreUser();
  const user = useQuery(api.user.getCurrentUser);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isWorkspaceRoute = pathname?.includes("/workspace");
  const slug = params?.slug as string | undefined;


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
                  <NotificationCenter />
                  <Button
                    size="icon-sm"
                    variant="outline"
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                    aria-label="Toggle theme"
                  >
                    {!mounted || theme === "light" ? (
                      <SunMedium className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </Button>
                  {/* Only when workspace ! */}
                  {isWorkspaceRoute && (
                    <>
                      <Button
                        size="icon-sm"
                        variant="outline"
                        onClick={() => setIsShareOpen(true)}
                        aria-label="Share project"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="outline"
                        aria-label="Start video call"
                      >
                        <Video className="h-4 w-4" />
                      </Button>
                      <Link href={`/dashboard/my-projects/${slug}`}>
                        <Button size="icon-sm" variant="outline">
                          <Home />
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
                <UserMenu />
              </div>
            </header>
            <div className="flex-1 min-h-0 overflow-hidden">
              <AnnouncementBanner />
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
        </SidebarProvider>
      </Authenticated>
    </div>
  );
}
