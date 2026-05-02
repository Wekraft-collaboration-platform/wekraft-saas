"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { CalendarIcon, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Id } from "../../../convex/_generated/dataModel";

interface CreateSprintDialogProps {
  projectId: Id<"projects">;
  projectName: string;
  trigger: React.ReactNode;
}

export const CreateSprintDialog = ({
  projectId,
  projectName,
  trigger,
}: CreateSprintDialogProps) => {
  const [open, setOpen] = useState(false);
  const [sprintName, setSprintName] = useState("");
  const [sprintGoal, setSprintGoal] = useState("");
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [isPending, setIsPending] = useState(false);

  const projectDetails = useQuery(api.project.getProjectDetails, {
    projectId,
  });

  const createSprint = useMutation(api.sprint.createSprint);

  const handleCreate = async () => {
    if (!sprintName.trim()) {
      toast.error("Sprint name is required");
      return;
    }
    if (!sprintGoal.trim()) {
      toast.error("Sprint goal is required");
      return;
    }
    if (!date?.from || !date?.to) {
      toast.error("Please select start and end dates");
      return;
    }

    // Client-side deadline check
    if (
      projectDetails?.targetDate &&
      date.to.getTime() > projectDetails.targetDate
    ) {
      toast.error(
        `Sprint cannot end after project deadline (${format(projectDetails.targetDate, "MMM d, yyyy")})`,
      );
      return;
    }

    try {
      setIsPending(true);
      await createSprint({
        projectId,
        sprintName: sprintName.trim(),
        sprintGoal: sprintGoal.trim(),
        duration: {
          startDate: date.from.getTime(),
          endDate: date.to.getTime(),
        },
      });
      toast.success("Sprint created!");
      setOpen(false);
      // Reset
      setSprintName("");
      setSprintGoal("");
      setDate(undefined);
    } catch (error: any) {
      toast.error(error.message || "Failed to create sprint");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-full max-w-[480px] dark:bg-[#1c1c1c] border-[#2b2b2b] p-0 overflow-hidden dark:text-neutral-200">
        <DialogHeader className="p-4 flex flex-row items-center gap-2 border-b border-[#2b2b2b]">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
            <div className="w-3 h-3 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white" />
            <span className="text-sm">{projectName}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-xs -mb-1">New Sprint</span>
          </div>
        </DialogHeader>

        <div className=" space-y-3">
          <div className="relative h-[180px] w-full overflow-hidden">
            <img
              src="/3.svg"
              alt="Pattern Header"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-zinc-950  to-transparent" />
            <div className="absolute bottom-4 left-6 flex items-center gap-3">
              <div>
                <h4 className="text-sm font-medium text-primary drop-shadow-md">
                  Create a new Sprint
                </h4>
                <p className="text-xs text-muted-foreground font-medium tracking-tight">
                  Sprints help us to breakdown the work and achieve our goals.
                </p>
              </div>
            </div>
          </div>
          {/* Sprint Name */}
          <div className="space-y-1.5 px-4">
            <Label className="text-sm">Sprint Name</Label>
            <Input
              placeholder="e.g. Sprint 1 — Auth Flow"
              value={sprintName}
              onChange={(e) => setSprintName(e.target.value)}
              className="text-sm border bg-transparent focus-visible:ring-0 placeholder:text-neutral-600"
            />
          </div>

          {/* Sprint Goal */}
          <div className="space-y-1.5 px-4">
            <Label className="text-sm">Sprint Goal</Label>
            <Textarea
              placeholder="What should the team achieve by the end of this sprint?"
              value={sprintGoal}
              onChange={(e) => setSprintGoal(e.target.value)}
              className="h-[80px] bg-transparent border focus-visible:ring-0 placeholder:text-neutral-600 resize-none text-sm"
            />
          </div>

          {/* Duration */}
          <div className="space-y-1.5 px-4">
            <Label className="text-sm">Duration</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left text-sm h-9 bg-transparent border-[#333] hover:bg-[#2b2b2b]",
                    date?.from ? "text-primary" : "text-neutral-500",
                  )}
                >
                  <CalendarIcon className="w-4 h-4 mr-2 shrink-0" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "MMM d, yyyy")} →{" "}
                        {format(date.to, "MMM d, yyyy")}
                      </>
                    ) : (
                      format(date.from, "MMM d, yyyy")
                    )
                  ) : (
                    "Select start and end dates"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-[#1c1c1c] border-[#2b2b2b]"
                align="start"
              >
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from || new Date()}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                  disabled={(d) => {
                    const isPast =
                      d < new Date(new Date().setHours(0, 0, 0, 0));
                    const isPastDeadline = projectDetails?.targetDate
                      ? d > new Date(projectDetails.targetDate)
                      : false;
                    return isPast || isPastDeadline;
                  }}
                  className="bg-[#1c1c1c] text-neutral-200"
                />
              </PopoverContent>
            </Popover>
            {date?.from && date?.to && (
              <p className="text-[11px] text-muted-foreground">
                {Math.ceil(
                  (date.to.getTime() - date.from.getTime()) /
                    (1000 * 60 * 60 * 24),
                )}{" "}
                days
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2b2b2b] flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            className="h-8 text-xs text-neutral-400 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            disabled={isPending}
            onClick={handleCreate}
            className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white px-4"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Sprint"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
