"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { api } from "../../../../../convex/_generated/api";

export default function DirectWorkspaceIntegrationsRedirect() {
  const router = useRouter();
  const userProjects = useQuery(api.project.getUserProjects);
  const joinedProjects = useQuery(api.project.getJoinedProjects);

  useEffect(() => {
    if (userProjects === undefined || joinedProjects === undefined) return;

    const allProjects = [...(userProjects || []), ...(joinedProjects || [])];
    if (allProjects.length > 0 && allProjects[0]?.slug) {
      router.replace(
        `/dashboard/my-projects/${allProjects[0].slug}/workspace/integrations`,
      );
    } else {
      router.replace("/dashboard");
    }
  }, [userProjects, joinedProjects, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">
          Loading project integrations...
        </p>
      </div>
    </div>
  );
}
