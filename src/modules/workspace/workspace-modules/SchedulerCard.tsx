"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Calendar,
  CalendarSync,
  CheckCircle2,
  Clock,
  History,
  Loader2,
  Play,
  Settings2,
  TableConfig,
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SchedulerCardProps {
  scheduler: any;
}

export const SchedulerCard = ({ scheduler }: SchedulerCardProps) => {
  return (
    <Card className="p-3! overflow-hidden shadow-sm bg-accent/30 flex flex-col justify-between">
      <div>
        <CardHeader className="px-0 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2 font-semibold!  tracking-tight">
            <div className="flex items-center gap-2">
              <CalendarSync className="w-5 h-5!" /> Project Scheduler
            </div>
          </CardTitle>
          <Button
            className="bg-muted h-7!  border border-border capitalize text-primary text-[10px] cursor-pointer flex items-center gap-2"
            size="sm"
          >
            <Image src="/kaya.svg" alt="Kaya" width={18} height={18} />
            help with schedule
          </Button>
        </CardHeader>
        <CardContent className="p-0 space-y-3 -mt-2">
          {!scheduler ? (
            <div className="py-5 text-center flex flex-col items-center gap-2">
              <CalendarSync className="w-8 h-8 opacity-50 " />
              <p className="font-semibold tracking-tight text-base">
                No Schedule Setup Yet
              </p>
              <p className="text-xs text-muted-foreground px-6">
                Ask KAYA to create automated schedules or configure manually.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[10px] mt-2 px-4!"
              >
                Setup <Settings2 />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between mt-5 mb-0!">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-linear-to-br from-muted to-indigo-500 flex items-center justify-center">
                    <Play className="w-3 h-3 text-primary" />
                  </div>
                  <p className="text-sm font-semibold capitalize tracking-tight">
                    {scheduler.name}
                  </p>
                </div>

                {scheduler.isRunning ? (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                    <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                    <span className="text-[10px] text-blue-500  tracking-wider">
                      Running
                    </span>
                  </div>
                ) : (
                  scheduler.lastRunStatus && (
                    <div
                      className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded-full border",
                        scheduler.lastRunStatus === "success"
                          ? "bg-emerald-500/10 border-emerald-800 text-muted-foreground"
                          : "bg-red-500/10 border-red-500/20 text-red-500",
                      )}
                    >
                      {scheduler.lastRunStatus === "success" ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      <span className="text-xs">{scheduler.lastRunStatus}</span>
                    </div>
                  )
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-1">
                <div className="bg-card/50 p-2 rounded-md border border-border/50 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center shrink-0">
                    <History className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                      Last Run
                    </p>
                    <span className="text-[11px] font-bold text-foreground truncate">
                      {scheduler.lastRunAt
                        ? format(scheduler.lastRunAt, "MMM d, HH:mm")
                        : "Never"}
                    </span>
                  </div>
                </div>
                <div className="bg-card/50 p-2 rounded-md border border-border/50 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center shrink-0">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                      Next Run
                    </p>
                    <span className="text-[11px] font-bold text-foreground truncate">
                      {format(scheduler.nextRunAt, "MMM d, HH:mm")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </div>
      {scheduler && (
        <CardFooter className="p-0 pt-3! border-t flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                scheduler.isActive
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-muted",
              )}
            />
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              {scheduler.isActive ? "Active" : "Paused"}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 text-[10px] text-muted-foreground font-bold hover:bg-accent/50 transition-colors"
          >
            Settings <Settings2 className="w-3 h-3 ml-1" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
