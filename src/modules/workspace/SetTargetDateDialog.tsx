"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Target,
  ArrowRight,
  TrendingUp,
  Clock,
  ClipboardClock,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import Image from "next/image";

interface SetTargetDateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: Id<"projects">;
  projectName: string;
  projectCreatedAt: number;
}

const patterns = [
  "/pattern1.png",
  "/pattern2.png",
  "/pattern5.png",
  "/pattern7.png",
  "/pattern9.png",
];

export const SetTargetDateDialog = ({
  isOpen,
  onOpenChange,
  projectId,
  projectName,
  projectCreatedAt,
}: SetTargetDateDialogProps) => {
  const [date, setDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateDeadline = useMutation(api.projectDetails.updateTargetDate);

  const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];

  const handleSave = async () => {
    if (!date) {
      toast.error("Please select a target date");
      return;
    }

    setIsSubmitting(true);
    const targetTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    ).getTime();

    // Validation: 1 week - 1 year
    const MS_IN_DAY = 24 * 60 * 60 * 1000;
    const durationDays = (targetTime - projectCreatedAt) / MS_IN_DAY;

    if (durationDays < 7) {
      toast.error("Project duration must be at least 7 days from creation", {
        description: "Wekraft is designed for projects that span at least a week.",
      });
      setIsSubmitting(false);
      return;
    }

    if (durationDays > 365) {
      toast.error("Deadline exceeds 1 year threshold", {
        description: "Small teams usually focus on yearly goals. Try a shorter target!",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await updateDeadline({
        projectId,
        targetDate: targetTime,
      });
      toast.success("Project baseline established!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update project schedule");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border dark:bg-sidebar bg-background shadow-2xl">
        {/* Header Image */}
        <div className="relative h-[180px] w-full overflow-hidden">
          <img
            src="/4.svg"
            alt="Pattern Header"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-background to-transparent" />
          <div className="absolute bottom-4 left-6 flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg shadow-lg">
              <ClipboardClock className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-primary drop-shadow-md">
                Project Deliver Date
              </h4>
              <p className="text-xs text-muted-foreground font-medium tracking-tight">
                Establish your project timeline baseline
              </p>
            </div>
          </div>
        </div>

        <div className="px-8 pt-6 pb-8 space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold tracking-tight text-foreground leading-none capitalize">
              Set Target for {projectName}
            </h3>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              Define the Delivery date for your project. A target deadline helps
              us generate accurate velocity charts and heatmap insights.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-2.5 rounded-xl border bg-muted backdrop-blur-sm ">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-card border rounded-lg group-hover:bg-primary/10 transition-colors">
                  <Clock className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground ">
                    Select Deadline
                  </p>
                  <p className="text-xs font-medium text-primary">
                    {date ? format(date, "PPP") : "No date set yet..."}
                  </p>
                </div>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg border bg-background hover:bg-muted cursor-pointer"
                  >
                    <CalendarIcon className="w-3.5 h-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 border bg-background"
                  align="end"
                >
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="bg-background"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={!date || isSubmitting}
            size={"sm"}
            className="mx-auto flex items-center justify-center text-xs"
          >
            {isSubmitting ? (
              <>
                Updating <Loader2 className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Update Date <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
