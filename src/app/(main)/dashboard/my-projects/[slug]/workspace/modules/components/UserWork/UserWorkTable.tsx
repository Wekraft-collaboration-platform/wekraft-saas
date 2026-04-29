"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  ClipboardList,
  Bug,
  Zap,
  Ticket,
  CalendarDays,
  LayoutGrid,
  Sparkles,
} from "lucide-react";
import { useKayaStore } from "@/store/useKayaStore";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface UserWorkTableProps {
  userName?: string;
}

export const UserWorkTable = ({ userName }: UserWorkTableProps) => {
  const [activeTab, setActiveTab] = useState("tasks");
  const { toggleKaya } = useKayaStore();
  const today = format(new Date(), "PPPP");

  const tabs = [
    { id: "tasks", label: "Tasks", icon: ClipboardList },
    { id: "issues", label: "Issues", icon: Bug },
    { id: "sprints", label: "Sprints", icon: Zap },
    { id: "tickets", label: "Tickets", icon: Ticket },
  ];

  const renderEmptyState = (id: string) => {
    const config: Record<string, any> = {
      tasks: {
        icon: ClipboardList,
        title: "No tasks found for today",
        desc: "You're all caught up! Enjoy your day or check other tabs for pending work.",
      },
      issues: {
        icon: Bug,
        title: "No issues assigned",
        desc: "Great job! There are no critical bugs requiring your immediate attention.",
      },
      sprints: {
        icon: Zap,
        title: "No active sprints",
        desc: "You are not part of any active sprints currently. Check with your team lead.",
      },
      tickets: {
        icon: Ticket,
        title: "No open tickets",
        desc: "Support queue is empty. No tickets are currently assigned to you.",
      },
    };

    const state = config[id];
    const Icon = state.icon;

    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-12 bg-muted/10 rounded-xl border border-dashed border-border/40 transition-all duration-300">
        <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center mb-6 border border-primary/10 shadow-xs">
          <Icon className="w-7 h-7 text-primary/40" />
        </div>
        <h3 className="text-sm font-semibold tracking-tight text-foreground/80">
          {state.title}
        </h3>
        <p className="text-[11px] text-muted-foreground max-w-[240px] mt-2 font-medium leading-relaxed">
          {state.desc}
        </p>
      </div>
    );
  };

  return (
    <Card className="border border-border shadow-none overflow-hidden bg-card">
      <CardHeader className="flex  items-center justify-between space-y-0 ">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold tracking-tight text-primary uppercase flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-primary" />
            {userName ? `${userName}'s Work` : "My Work"}
          </CardTitle>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <CalendarDays className="w-3 h-3" />
          {today}
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-0">
        <div className="flex items-center justify-between border-b border-border/40 mb-8">
          <div className="flex items-center gap-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-10 text-[11px] font-semibold px-4 transition-all relative cursor-pointer rounded-none border-b-2",
                  activeTab === tab.id
                    ? "border-b-primary text-primary bg-transparent"
                    : "border-b-transparent text-muted-foreground hover:text-foreground hover:bg-transparent",
                )}
              >
                <tab.icon
                  className={cn(
                    "w-3.5 h-3.5 mr-2",
                    activeTab === tab.id
                      ? "text-primary"
                      : "text-muted-foreground/60",
                  )}
                />
                {tab.label}
              </Button>
            ))}
          </div>

          <Button
            onClick={toggleKaya}
            variant="outline"
            size="sm"
            className="h-8 text-[11px] font-bold gap-2 rounded-full border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-primary transition-all cursor-pointer shadow-none"
          >
            <Image src="/kaya.svg" alt="kaya" width={20} height={20} />
            Ask for Standup
          </Button>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-1 duration-500">
          {renderEmptyState(activeTab)}
        </div>
      </CardContent>
    </Card>
  );
};
