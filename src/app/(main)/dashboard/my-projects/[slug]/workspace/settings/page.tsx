"use client";

import { useMutation, useQuery } from "convex/react";
import {
  ExternalLink,
  GitBranch,
  Layers,
  Link2,
  Loader2,
  Save,
  Settings2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const project = useQuery(api.project.getProjectBySlug, { slug });
  const updateProject = useMutation(api.project.updateProject);

  const [projectName, setProjectName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (project?.projectName) {
      setProjectName(project.projectName);
    }
  }, [project?.projectName]);

  if (project === undefined) {
    return (
      <div className="w-full h-full p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <p className="text-muted-foreground text-sm">Project not found</p>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const handleSaveTitle = async () => {
    if (!projectName.trim()) {
      toast.error("Project title cannot be empty");
      return;
    }
    setIsSaving(true);
    try {
      await updateProject({
        projectId: project._id as Id<"projects">,
        projectName: projectName.trim(),
      });
      toast.success("Project title updated successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to update project title");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl p-6 mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
          <Settings2 className="w-6 h-6 text-primary" />
          Project Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage project details and repository connections
        </p>
      </div>

      {/* Project Title Card */}
      <Card className="border-accent">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Project Title
          </CardTitle>
          <CardDescription>
            The display name of your project across the workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectName" className="text-xs">
              Title
            </Label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project title..."
              className="max-w-md font-medium"
            />
          </div>
          <Button
            size="sm"
            onClick={handleSaveTitle}
            disabled={isSaving || projectName === project.projectName}
            className="text-xs cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 mr-1.5" /> Save Title
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Connected Repository Card */}
      <Card className="border-accent">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-primary" />
            Connected Repository
          </CardTitle>
          <CardDescription>
            The GitHub repository linked to this project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {project.repoFullName || project.repositoryId ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border border-border bg-muted/40 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-md bg-accent text-primary">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                      {project.repoFullName || "Repository Connected"}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-green-500/10 text-green-500 border-green-500/20"
                    >
                      Connected
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Synced with GitHub
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard/repositories")}
                className="text-xs cursor-pointer"
              >
                Change Repository
                <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border border-dashed border-border bg-muted/20 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-md bg-accent text-muted-foreground">
                  <GitBranch className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">
                    No repository connected
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Connect a repository to link commits & code tracking.
                  </p>
                </div>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push("/dashboard/repositories")}
                className="text-xs cursor-pointer bg-blue-500 text-white hover:bg-blue-600"
              >
                Connect Repository
                <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
