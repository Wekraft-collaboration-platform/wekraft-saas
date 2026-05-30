"use client";

import { useMutation } from "convex/react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  ShieldCheck,
  BrainCircuit,
  MessageSquarePlus,
} from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface ProjectConfigTabProps {
  projectId: Id<"projects">;
  projectDetails: any;
  scheduler: any;
  isOwner: boolean;
}

export const ProjectConfigTab = ({
  projectId,
  projectDetails,
  scheduler,
  isOwner,
}: ProjectConfigTabProps) => {
  const updateProjectConfig = useMutation(api.projectDetails.updateProjectConfig);

  const handleUpdateConfig = async (updates: any) => {
    try {
      await updateProjectConfig({
        projectId,
        ...updates,
      });
      toast.success("Settings updated");
    } catch (error) {
      toast.error("Failed to update settings");
    }
  };

  return (
    <div className="mt-6 flex flex-col gap-6 max-w-2xl mx-auto w-full pb-20">
      <Card className="border-sidebar-border bg-sidebar shadow-none overflow-hidden">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            Project Policies
          </CardTitle>
          <CardDescription className="text-[10px] uppercase tracking-widest font-medium opacity-60">
            Member Governance & Access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-6">
          {/* Member Create Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs flex items-center gap-2 font-semibold">
                <MessageSquarePlus className="w-3.5 h-3.5 text-foreground" />
                Member Task Creation
              </Label>
              <p className="text-[10px] text-muted-foreground font-medium">
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

          <Separator className="bg-sidebar-border" />

          {/* Member Kaya Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs flex items-center gap-2 font-semibold">
                <BrainCircuit className="w-3.5 h-3.5 text-foreground" />
                Member AI Access (Kaya)
              </Label>
              <p className="text-[10px] text-muted-foreground font-medium">
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

          <Separator className="bg-sidebar-border" />

          {/* AI in Teamspace Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs flex items-center gap-2 font-semibold">
                <BrainCircuit className="w-3.5 h-3.5 text-foreground" />
                AI in Teamspace
              </Label>
              <p className="text-[10px] text-muted-foreground font-medium">
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

          {/* Restriction Message at the bottom */}
          {!isOwner && (
            <div className="space-y-3 pt-2">
              <p className="text-[10px] font-semibold flex items-center gap-2 bg-accent/30 p-2 rounded-md border border-sidebar-border">
                <ShieldCheck className="w-3 h-3" />
                Only the project owner can manage policies.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
