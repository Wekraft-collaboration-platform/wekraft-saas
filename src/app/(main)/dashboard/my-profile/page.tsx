"use client";

import { useQuery as useConvexQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useUserPlan } from "@/hooks/use-user-plan";
import { useStoreUser } from "@/hooks/use-user-store";
import { BioEditor } from "@/modules/profile/components/BioEditor";
import { GithubStats } from "@/modules/profile/components/githubstats";
import { ProfileHeader } from "@/modules/profile/components/ProfileHeader";
import { ProfileSkills } from "@/modules/profile/components/ProfileSkills";
import { SocialLinks } from "@/modules/profile/components/SocialLinks";
import { ProfileSettings } from "@/modules/profile/components/ProfileSettings";
import { api } from "../../../../../convex/_generated/api";

const MyProfilePage = () => {
  const user = useConvexQuery(api.user.getCurrentUser);
  const { isLoading: isStoreLoading } = useStoreUser();
  const { isUpgraded } = useUserPlan(user as any);
  const [showSettings, setShowSettings] = useState(false);

  if (isStoreLoading || !user) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm">Loading your profile…</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-background text-foreground overflow-x-clip">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-7 md:px-10 py-6 md:py-8 flex flex-col gap-6">

        {/* ── 1. Profile Header ── */}
        <ProfileHeader 
          user={user} 
          isUpgraded={isUpgraded} 
          showSettings={showSettings}
          onToggleSettings={() => setShowSettings(!showSettings)}
        />

        {showSettings ? (
          <ProfileSettings 
            user={user} 
            isUpgraded={isUpgraded} 
            onBack={() => setShowSettings(false)} 
          />
        ) : (
          <>
            {/* ── 2. About Me (left) + Skills & Social Links (right) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6 items-stretch">

              {/* About Me */}
              <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col min-h-[160px]">
                <div className="px-4 pt-4 pb-0">
                  <BioEditor initialBio={user.bio} isUpgraded={isUpgraded} />
                </div>
              </div>

              {/* Right column: Skills + Social Links */}
              <div className="flex flex-col gap-6 h-full">

                <div className="bg-card border border-border rounded-xl shadow-sm px-4 pt-4 pb-4">
                  <ProfileSkills skills={user?.skills} />
                </div>

                <div className="bg-card border border-border rounded-xl shadow-sm px-4 pt-4 pb-4 flex-1">
                  <SocialLinks socialLinks={user?.socialLinks} />
                </div>

              </div>
            </div>

            {/* ── 3. GitHub Stats ── */}
            <GithubStats />
          </>
        )}

      </div>
    </div>
  );
};

export default MyProfilePage;
