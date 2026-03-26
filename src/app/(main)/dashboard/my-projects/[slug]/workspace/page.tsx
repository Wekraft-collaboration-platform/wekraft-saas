"use client";

import { useParams } from "next/navigation";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Home } from "lucide-react";

const ProjectWorkspace = () => {
  const params = useParams();
  const slug = params.slug as string;

  const project = useQuery(api.project.getProjectBySlug, { slug });
  const projectName = project?.projectName;
  const repoId = project?.repositoryId;

  return (
    <div className="p-6">
      <header className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-70">
              Workspace
            </p>
          </div>
          <h1 className="text-3xl font-bold tracking-tighter">
            Activity Workspace
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
            Monitor project insights, track progress and team performance all in one platform Wekraft 
          </p>
        </div>
        <Link href={`/dashboard/my-projects/${slug}`}>
          <Button className="text-xs cursor-pointer" variant="outline" size="sm">
            <ChevronLeft />
            Back to Home
            <Home className="w-3 h-3"/>
          </Button>
        </Link>
      </header>
    </div>
  );
};

export default ProjectWorkspace;
