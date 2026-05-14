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
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface ProjectConfigTabProps {
  projectId: Id<"projects">;
  projectDetails: any;
  scheduler: any;
}

export const ProjectConfigTab = ({
  projectId,
  projectDetails,
  scheduler,
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Scheduler */}
        <div className="flex flex-col gap-4">
         
          {/* <SchedulerCard scheduler={scheduler} /> */}
        </div>

        {/* Right Column - Member Permissions */}
        <div className="flex flex-col gap-4">
         
          <Card className="border-border/50 bg-accent/5 overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                Project Policies
              </CardTitle>
              <CardDescription className="text-[10px]">
                Control how members interact with project resources.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Member Create Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs flex items-center gap-2">
                    <MessageSquarePlus className="w-3.5 h-3.5 text-blue-500" />
                    Member Task Creation
                  </Label>
                  <p className="text-[10px] text-muted-foreground">
                    Allow team members to create new tasks and issues.
                  </p>
                </div>
                <Switch
                  checked={projectDetails?.memberCanCreate ?? true}
                  onCheckedChange={(checked) =>
                    handleUpdateConfig({ memberCanCreate: checked })
                  }
                />
              </div>

              <Separator className="bg-border/40" />

              {/* Member Kaya Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs flex items-center gap-2">
                    <BrainCircuit className="w-3.5 h-3.5 text-purple-500" />
                    Member AI Access (Kaya)
                  </Label>
                  <p className="text-[10px] text-muted-foreground">
                    Allow team members to use Kaya AI for insights and automation.
                  </p>
                </div>
                <Switch
                  checked={projectDetails?.memberUseKaya ?? true}
                  onCheckedChange={(checked) =>
                    handleUpdateConfig({ memberUseKaya: checked })
                  }
                />
              </div>

              <Separator className="bg-border/40" />

              {/* Kaya Threshold */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      Kaya Call Threshold
                    </Label>
                    <p className="text-[10px] text-muted-foreground">
                      Limit AI operations per project to control costs.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      className="h-8 w-20 text-xs font-bold text-center"
                      defaultValue={projectDetails?.kayaThreshold ?? 0}
                      onBlur={(e) =>
                        handleUpdateConfig({
                          kayaThreshold: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="p-2 bg-amber-500/5 border border-amber-500/10 rounded-md">
                  <p className="text-[9px] text-amber-600 dark:text-amber-400 font-medium">
                    Note: This is a soft threshold. Kaya will alert members when
                    this limit is reached.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
