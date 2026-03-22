"use client";

import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "convex/react";
import { LucideExternalLink } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

const ProjectPage = () => {
  const params = useParams();
  const projectId = params.id as Id<"projects">;

  const project = useQuery(api.project.getProjectById, { projectId });
  const user = useQuery(api.user.getCurrentUser);

  if (project === undefined) {
    return <ProjectSkeleton />;
  }

  if (project === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 p-6">
        <h2 className="text-2xl font-bold">Project not found</h2>
        <Link href="/dashboard">
          <Button variant="default">Go Back Dashboard</Button>
        </Link>
      </div>
    );
  }
  return (
    <div className="w-full h-full animate-in fade-in duration-700 p-6 2xl:p-10 2xl:py-7">
      <Link href={`/dashboard/my-projects/${project?._id}/workspace`}>
        <Button size="sm" className="px-10 cursor-pointer">
          <LucideExternalLink className="w-4 h-4 inline mr-2" /> Visit workspace
        </Button>
      </Link>
    </div>
  );
};

const ProjectSkeleton = () => {
  return (
    <div className="w-full h-full p-6 lg:p-10 space-y-8">
      <Skeleton className="w-40 h-6" />

      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-4 w-full max-w-2xl">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-full" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="md:col-span-2 h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
};

export default ProjectPage;
