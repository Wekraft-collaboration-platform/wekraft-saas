"use client";

import { useParams } from "next/navigation";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const ProjectWorkspace = () => {
  const params = useParams();
  const projectId = params.id as Id<"projects">;

  const project = useQuery(api.project.getProjectById, { projectId });
  const projectName = project?.projectName;
  const repoId = project?.repositoryId;

  return (
    <div>
      <Link href={`/dashboard/my-projects/${projectId}`}>
        <Button className="text-xs cursor-pointer" variant="outline" size="sm">
          <ChevronLeft />
          Back to Home
        </Button>
      </Link>
      <h1>Project Workspace</h1>
    </div>
  );
};

export default ProjectWorkspace;
