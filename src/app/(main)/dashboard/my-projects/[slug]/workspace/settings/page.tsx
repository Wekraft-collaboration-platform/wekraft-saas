"use client";

import { useMutation, useQuery } from "convex/react";
import {
  ExternalLink,
  GitBranch,
  Link2,
  Loader2,
  Save,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { KayaSettingsSection } from "@/modules/workspace/settings/KayaSettingsSection";

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const project = useQuery(api.project.getProjectBySlug, { slug });
  const user = useQuery(api.user.getCurrentUser);
  const isOwner = !!project && !!user && project.ownerId === user._id;

  const projectId = project?._id;

  const projectDetails = useQuery(
    api.projectDetails.getProjectDetails,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip",
  );

  const updateProject = useMutation(api.project.updateProject);
  const updateProjectConfig = useMutation(
    api.projectDetails.updateProjectConfig,
  );

  const [projectName, setProjectName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (project?.projectName) {
      setProjectName(project.projectName);
    }
  }, [project?.projectName]);

  if (project === undefined || user === undefined) {
    return (
      <div className="w-full h-full p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
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

  const handleUpdateConfig = async (updates: any) => {
    if (!projectId) return;
    try {
      await updateProjectConfig({
        projectId: projectId as Id<"projects">,
        ...updates,
      });
      toast.success("Project policy updated");
    } catch (error) {
      toast.error("Failed to update project policy");
    }
  };

  return (
    <div className="w-full p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold flex items-center gap-2 text-foreground">
          <Settings2 className="w-6 h-6 text-primary" />
          Project Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your Project details, Policies, Integrations, and Kaya Settings.
        </p>
      </div>

      <div className="max-w-4xl min-w-2xl:max-w-5xl mx-auto space-y-6">
        {/* 1. Project Title - Linear Style */}
        <div className="space-y-2">
          <div>
            <h3 className="text-sm font-medium text-foreground">
              Project Title
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              The display name of your project across the workspace
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project title..."
                className="max-w-md text-xs h-9 bg-background/60 font-medium"
              />
              <Button
                size="sm"
                onClick={handleSaveTitle}
                disabled={isSaving || projectName === project.projectName}
                className="text-xs cursor-pointer h-9 px-3"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />{" "}
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 mr-1.5" /> Save Title
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* 2. Connected Repository - Linear Style */}
        <div className="space-y-2 pt-2">
          <div>
            <h3 className="text-sm font-medium text-foreground">
              Connected Repository
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              The GitHub repository linked to this project for commits and code tracking
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
            {project.repoFullName || project.repositoryId ? (
              <div className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/15 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-neutral-900/90 border border-border/60 flex items-center justify-center shrink-0 text-primary">
                    <Link2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-xs text-foreground truncate">
                        {project.repoFullName || "Repository Connected"}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] py-0 px-1.5 bg-green-500/10 text-green-500 border-green-500/20 font-normal"
                      >
                        Connected
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Synced with GitHub
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/dashboard/repositories")}
                  className="text-xs cursor-pointer h-8"
                >
                  Change Repository
                  <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/15 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted/40 border border-border/60 flex items-center justify-center shrink-0 text-muted-foreground">
                    <GitBranch className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-foreground">
                      No repository connected
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Connect a repository to link commits & code tracking.
                    </p>
                  </div>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => router.push("/dashboard/repositories")}
                  className="text-xs cursor-pointer h-8 bg-blue-500 text-white hover:bg-blue-600"
                >
                  Connect Repository
                  <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Project Policies Section - Linear Style */}
        <div className="space-y-2 pt-2">
          <div>
            <h3 className="text-sm font-medium text-foreground">
              Project Policies
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Member governance, AI permissions, and channel access
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card divide-y divide-neutral-800 overflow-hidden shadow-xs">
            {/* Member Task Creation */}
            <div className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/15 transition-colors">
              <div className="space-y-0.5">
                <div className="text-xs font-medium text-foreground">
                  Member Task Creation
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Allow team members to create new tasks and issues.
                </p>
              </div>
              <Switch
                disabled={!isOwner}
                checked={projectDetails?.memberCanCreate ?? true}
                onCheckedChange={(checked) =>
                  handleUpdateConfig({ memberCanCreate: checked })
                }
              />
            </div>

            {/* Member AI Access (Kaya) */}
            <div className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/15 transition-colors">
              <div className="space-y-0.5">
                <div className="text-xs font-medium text-foreground">
                  Member AI Access (Kaya)
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Allow team members to use Kaya AI for insights and automation.
                </p>
              </div>
              <Switch
                disabled={!isOwner}
                checked={projectDetails?.memberUseKaya ?? true}
                onCheckedChange={(checked) =>
                  handleUpdateConfig({ memberUseKaya: checked })
                }
              />
            </div>

            {/* AI in Teamspace */}
            <div className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/15 transition-colors">
              <div className="space-y-0.5">
                <div className="text-xs font-medium text-foreground">
                  AI in Teamspace
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Enable AI assistants and summary tools in project channels.
                </p>
              </div>
              <Switch
                disabled={!isOwner}
                checked={projectDetails?.canUseAITeamspace ?? false}
                onCheckedChange={(checked) =>
                  handleUpdateConfig({ canUseAITeamspace: checked })
                }
              />
            </div>

            {/* Non-owner notice */}
            {!isOwner && (
              <div className="px-4 py-2.5 bg-muted/20 text-[11px] text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Only the project owner can modify governance policies.</span>
              </div>
            )}
          </div>
        </div>

        {/* Kaya Settings Section */}
        <KayaSettingsSection projectId={project._id as Id<"projects">} />
      </div>
    </div>
  );
}
