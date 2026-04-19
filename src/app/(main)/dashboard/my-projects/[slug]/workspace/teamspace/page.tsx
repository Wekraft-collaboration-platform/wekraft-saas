"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../../../convex/_generated/api";
import { TeamspaceView } from "@/modules/teamspace/TeamspaceView";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeamspacePage() {
  const params = useParams();
  const slug = params.slug as string;

  const project = useQuery(api.project.getProjectBySlug, { slug });

  if (project === undefined) {
    return (
      <div className="flex h-[calc(100vh-76px)] overflow-hidden">
        {/* Channels skeleton */}
        <div className="w-56 border-r p-3 flex flex-col gap-2">
          <Skeleton className="h-4 w-20 mb-2" />
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded-md" />
          ))}
        </div>
        {/* Feed skeleton */}
        <div className="flex-1 flex flex-col">
          <div className="border-b px-4 py-3">
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex-1 p-4 flex flex-col gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Members skeleton */}
        <div className="w-48 border-l p-3 flex flex-col gap-2">
          <Skeleton className="h-4 w-16 mb-2" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-[calc(100vh-76px)] items-center justify-center">
        <p className="text-muted-foreground text-sm">Project not found</p>
      </div>
    );
  }

  return (
    <TeamspaceView
      projectSlug={slug}
      projectId={project._id}
    />
  );
}
