"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit2, Gem, Loader, Settings2, Share2 } from "lucide-react";
import Image from "next/image";
import React from "react";
import { useQuery as useConvexQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useStoreUser } from "@/hooks/use-user-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserPlan } from "@/hooks/use-user-plan";
import { Star } from "lucide-react";

import { BioEditor } from "@/modules/profile/components/BioEditor";
import { ProfileTabs } from "@/modules/profile/components/ProfileTabs";

const MyProfilePage = () => {
  const user = useConvexQuery(api.user.getCurrentUser);
  const { isLoading: isStoreLoading } = useStoreUser();
  const { isUpgraded, plan } = useUserPlan(user as any);

  if (isStoreLoading || !user) {
    return (
      <div className="w-full h-full p-8 2xl:py-7 2xl:px-10 flex items-center justify-center">
        <Loader className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-full p-8 2xl:py-7 2xl:px-10 overflow-y-auto overflow-x-hidden no-scrollbar">
      <div className="flex gap-10">
        <Card className="min-w-[360px] flex flex-col items-center p-0 overflow-hidden relative shadow-lg border border-dashed">
          <div
            className={`${isUpgraded ? "bg-yellow-500/20" : "bg-blue-600/20"} h-24 w-full absolute z-0 blur-xl opacity-50`}
          ></div>
          {isUpgraded ? (
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-yellow-500/20 to-transparent z-0"></div>
          ) : (
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-600/20 to-transparent z-0"></div>
          )}

          <div className="flex justify-end w-full gap-4 z-10 px-4 pt-4">
            <Button
              variant={"outline"}
              size="icon-sm"
              className="bg-background/50 border-none backdrop-blur-sm shadow-none"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant={"outline"}
              size="icon-sm"
              className="bg-background/50 border-none backdrop-blur-sm shadow-none"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-col gap-3 items-center -mt-10 z-10">
            <Avatar className="h-40 w-40 border-4 border-card shadow-2xl">
              <AvatarImage src={user.avatarUrl || ""} />
              <AvatarFallback className="text-4xl bg-muted font-bold font-pop">
                {user.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="mt-2 flex flex-col items-center gap-2 pb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-pop tracking-tight">
                  {user.name}
                </h2>
                {isUpgraded && (
                  <div className="bg-yellow-400 dark:bg-yellow-500 p-1 rounded-full shadow-lg ring-2 ring-yellow-400/20">
                    <Star className="h-3 w-3 text-black fill-black" />
                  </div>
                )}
              </div>
              <p className="text-muted-foreground text-sm font-pop font-medium">
                @
                {user.githubUsername ||
                  user.name.toLowerCase().replace(" ", "")}
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  {" "}
                  | joined{" "}
                  {new Date(user._creationTime).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </p>

              <div className="flex  gap-3">
                {user?.skills?.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 bg-accent/30 py-1 text-[10px] font-normal tracking-wider text-muted-foreground border rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex w-full items-center justify-evenly border-t pt-3 mt-3">
                <Button variant={"outline"} size={"sm"} className="text-xs">
                  Share <Share2 className="h-4 w-4" />
                </Button>
                {isUpgraded ? (
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    <span className="text-white">Plan:</span>{" "}
                    {user?.accountType}
                  </p>
                ) : (
                  <Button variant={"default"} size={"sm"} className="text-xs">
                    Upgrade <Gem className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="flex-1 border bg-card rounded-lg p-4 shadow-sm  flex flex-col">
          <BioEditor initialBio={user.bio} isUpgraded={isUpgraded} />
        </div>
      </div>

      <div className="mt-8 pb-10">
        <ProfileTabs user={user} isUpgraded={isUpgraded} />
      </div>

      <div className="mt-8 pb-10">
        <p>List top 3 projects</p>
      </div>
    </div>
  );
};

export default MyProfilePage;
