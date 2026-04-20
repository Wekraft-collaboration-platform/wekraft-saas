"use client";

import { useStoreUser } from "@/hooks/use-user-store";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { RedirectToSignIn, UserButton } from "@clerk/nextjs";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { DashboardBreadcrumbs } from "@/modules/dashboard/components/HeaderCrumbs";
import { CommunitySearchBar } from "@/modules/dashboard/components/SearchBar";

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
    <div>
      <Unauthenticated>
        <RedirectToSignIn />
      </Unauthenticated>
      <Authenticated>
        <SidebarProvider defaultOpen={true}>
          {sidebar}
          <SidebarInset>
            <header className="flex justify-between h-19 py-1 flex-none items-center border-b px-4 bg-background/80 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 cursor-pointer hover:scale-105 transition-all duration-200" />
                <Separator
                  orientation="vertical"
                  className="mx-4 h-8! bg-accent"
                />
                <DashboardBreadcrumbs />
              </div>
              {/* <div>
                <CommunitySearchBar />
              </div> */}
              <div className="">
                <UserButton />
              </div>
            </header>
            <main className="flex-1 overflow-auto">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </Authenticated>
    </div>
  );
}
