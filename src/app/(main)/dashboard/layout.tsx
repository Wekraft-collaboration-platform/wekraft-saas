"use client";

import { useStoreUser } from "@/hooks/use-user-store";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { RedirectToSignIn } from "@clerk/nextjs";
import { UserMenu } from "@/modules/dashboard/components/UserMenu";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { DashboardBreadcrumbs } from "@/modules/dashboard/components/HeaderCrumbs";
import { CommunitySearchBar } from "@/modules/dashboard/components/SearchBar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BugPlay, Share2, SunMedium } from "lucide-react";
import { Button } from "@/components/ui/button";

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
                  <Button size="icon-sm" variant="outline">
                    <BugPlay />
                  </Button>
                  <Button size="icon-sm" variant="outline">
                    <SunMedium />
                  </Button>
                  <Button size="icon-sm" variant="outline">
                    <Share2 />
                  </Button>
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
        </SidebarProvider>
      </Authenticated>
    </div>
  );
}
