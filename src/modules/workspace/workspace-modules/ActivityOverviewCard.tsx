"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Layers3, 
  ClipboardList, 
  Bug, 
  TicketPlus, 
  ChevronRight,
  Zap
} from "lucide-react";
import Link from "next/link";

interface ActivityOverviewCardProps {
  slug: string;
  tasksCount: number;
  issuesCount: number;
  sprintsCount: number;
  eventsCount: number;
}

export const ActivityOverviewCard = ({
  slug,
  tasksCount,
  issuesCount,
  sprintsCount,
  eventsCount,
}: ActivityOverviewCardProps) => {
  const stats = [
    {
      label: "Tasks",
      count: tasksCount,
      icon: ClipboardList,
      href: `/dashboard/my-projects/${slug}/workspace/tasks`,
      action: "View Tasks",
    },
    {
      label: "Issues",
      count: issuesCount,
      icon: Bug,
      href: `/dashboard/my-projects/${slug}/workspace/issues`,
      action: "View Issues",
    },
    {
      label: "Sprints",
      count: sprintsCount,
      icon: Zap,
      href: `/dashboard/my-projects/${slug}/workspace/sprint`,
      action: "Manage Sprints",
    },
    {
      label: "Events",
      count: eventsCount,
      icon: TicketPlus,
      href: `/dashboard/my-projects/${slug}/workspace/calendar`,
      action: "Calendar",
    },
  ];

  return (
    <Card className="p-3! overflow-hidden shadow-sm bg-linear-to-br from-card to-muted/70">
      <CardHeader className="px-0 pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2 font-bold tracking-tight">
          <Layers3 className="w-5 h-5!" /> Activity Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 grid grid-cols-2 gap-3 -mt-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="p-2.5 rounded-xl bg-card border flex flex-col justify-between h-22"
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px]">{stat.label}</span>
              <stat.icon className="w-4 h-4" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold tracking-tighter leading-none pl-2">
                {stat.count}
              </span>
              <Link href={stat.href}>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto text-[10px] flex justify-end ml-auto text-foreground hover:translate-x-0.5 transition-transform cursor-pointer"
                >
                  {stat.action} <ChevronRight className="w-3 h-3 " />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
