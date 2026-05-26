"use client";
import { useQuery as useConvexQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useUserPlan } from "@/hooks/use-user-plan";
import { useStoreUser } from "@/hooks/use-user-store";
import { BioEditor } from "@/modules/profile/components/BioEditor";
import { GithubStats } from "@/modules/profile/components/githubstats";
import { ProfileHeader } from "@/modules/profile/components/ProfileHeader";
import { ProfileSkills } from "@/modules/profile/components/ProfileSkills";
import { SocialLinks } from "@/modules/profile/components/SocialLinks";
import { api } from "../../../../../convex/_generated/api";

const MyProfilePage = () => {
  const user = useConvexQuery(api.user.getCurrentUser);
  const { isLoading: isStoreLoading } = useStoreUser();
  const { isUpgraded } = useUserPlan(user as any);

  if (isStoreLoading || !user) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm">Loading your profile…</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-background text-foreground">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 flex flex-col gap-4">

        {/* ── 1. Profile Header ── */}
        <ProfileHeader user={user} isUpgraded={isUpgraded} />

        {/* ── 2. About Me (left) + Skills & Social Links (right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4 items-stretch">

          {/* About Me */}
          <div className="bg-sidebar border border-border rounded-xl shadow-sm flex flex-col min-h-[160px]">
            <div className="px-4 pt-4 pb-0">
              <BioEditor initialBio={user.bio} isUpgraded={isUpgraded} />
            </div>
          </div>

          {/* Right column: Skills + Social Links */}
          <div className="flex flex-col gap-4 h-full">

            <div className="bg-sidebar border border-border rounded-xl shadow-sm px-4 pt-4 pb-4">
              <ProfileSkills skills={user?.skills} />
            </div>

            <div className="bg-sidebar border border-border rounded-xl shadow-sm px-4 pt-4 pb-4 flex-1">
              <SocialLinks socialLinks={user?.socialLinks} />
            </div>

          </div>
        </div>

        {/* ── 3. GitHub Stats ── */}
        <GithubStats />

      </div>
    </div>
  );
};

export default MyProfilePage;
