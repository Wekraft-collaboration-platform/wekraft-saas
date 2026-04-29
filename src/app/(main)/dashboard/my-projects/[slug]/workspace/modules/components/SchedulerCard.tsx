"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarSync, Loader2, Settings2 } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";

interface SchedulerCardProps {
  scheduler: any;
}

export const SchedulerCard = ({ scheduler }: SchedulerCardProps) => {
  return (
    <Card className="p-3! overflow-hidden shadow-sm bg-accent/30 flex flex-col justify-between">
      <div>
        <CardHeader className="px-0 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2 font-medium tracking-tight">
            <CalendarSync className="w-5 h-5!" /> Project Scheduler
          </CardTitle>
          <Button
            className="bg-linear-to-br h-7! from-card to-indigo-500 border border-border capitalize text-primary text-[10px] cursor-pointer flex items-center gap-2"
            size="sm"
          >
            <Image src="/kaya.svg" alt="Kaya" width={18} height={18} />
            help with schedule
          </Button>
        </CardHeader>
        <CardContent className="p-0 space-y-3 -mt-3">
          {!scheduler ? (
            <div className="py-8 text-center flex flex-col items-center gap-2">
              <CalendarSync className="w-8 h-8 opacity-30 " />
              <p className="font-semibold tracking-tight text-base">
                No Schedule Setup Yet
              </p>
              <p className="text-xs text-muted-foreground px-8">
                Ask Kaya for help to generate an optimized schedule for your
                project.
              </p>
              <Button size="sm" variant="outline" className="h-7 text-[10px] ">
                Setup
              </Button>
            </div>
          ) : (
            <div className="flex items-center"></div>
          )}
        </CardContent>
      </div>
      {scheduler && (
        <CardFooter className="p-0 pt-3! border-t flex justify-between items-center">
          {scheduler.isRunning ? (
            <div className="flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
              <span className="text-[10px] text-blue-600 font-semibold  tracking-wide">
                Running
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">
                Active
              </span>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 text-[10px] text-muted-foreground"
          >
            Settings <Settings2 className="w-3 h-3 ml-1" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

//  <div className="space-y-4 mt-4">
//             <div className="flex justify-between items-end">
//               <div className="space-y-1">
//                 <p className="text-xs">Name</p>
//                 <p className="text-sm font-semibold tracking-tight">
//                   {scheduler.name}
//                 </p>
//               </div>
//               <div className="text-right">
//                 <p className="text-xs">Frequency</p>
//                 <p className="text-xs font-bold">
//                   {scheduler.frequencyDays} Days
//                 </p>
//               </div>
//             </div>

//             <div className="space-y-1 border-t pt-2">
//               <div className="flex justify-between items-center">
//                 <span className="text-[10px] text-muted-foreground">
//                   Last Run
//                 </span>
//                 <span className="text-[11px] font-semibold">
//                   {scheduler.lastRunAt
//                     ? format(scheduler.lastRunAt, "MMM d, HH:mm")
//                     : "---"}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-[10px] text-muted-foreground">
//                   Next Run
//                 </span>
//                 <span className="text-[11px] font-bold">
//                   {format(scheduler.nextRunAt, "MMM d, HH:mm")}
//                 </span>
//               </div>
//             </div>
//           </div>
