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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Clock3,
  ShieldCheck,
  BrainCircuit,
  MessageSquarePlus,
  Zap,
} from "lucide-react";
import { SchedulerCard } from "./SchedulerCard";
import { KayaUsageRadial } from "./KayaUsageRadial";
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
    <div className="mt-6 flex flex-col gap-6 max-w-5xl mx-auto w-full pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Left Column - Kaya Usage */}
        <div className="flex flex-col">
          <KayaUsageRadial 
            usage={projectDetails?.kayaUsage ?? 0} 
            threshold={projectDetails?.kayaThreshold ?? 0} 
          />
        </div>

        {/* Right Column - Member Permissions */}
        <div className="flex flex-col">
          <Card className="border-sidebar-border bg-sidebar shadow-none overflow-hidden h-full">
            <CardHeader className="">
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

              {/* Kaya Threshold */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs flex items-center gap-2 font-semibold">
                      <Zap className="w-3.5 h-3.5 text-foreground" />
                      Kaya Call Threshold
                    </Label>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      Limit AI operations per project to control costs.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      disabled={!isOwner}
                      type="number"
                      className="h-8 w-20 text-xs font-semibold text-center bg-background/50 border-sidebar-border"
                      defaultValue={projectDetails?.kayaThreshold ?? 0}
                      onBlur={(e) =>
                        handleUpdateConfig({
                          kayaThreshold: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-sidebar-border" />

              {/* Note and Restriction Message at the bottom */}
              <div className="space-y-3 pt-2">
                <div className="p-2 bg-foreground/5 border border-sidebar-border/50 rounded-md">
                  <p className="text-[9px] text-muted-foreground font-medium">
                    Note: This is a soft threshold. Kaya will alert members when
                    this limit is reached.
                  </p>
                </div>
                
                {!isOwner && (
                  <p className="text-[10px] font-semibold flex items-center gap-2 bg-accent/30 p-2 rounded-md border border-sidebar-border">
                    <ShieldCheck className="w-3 h-3" />
                    Only the project owner can manage policies.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
